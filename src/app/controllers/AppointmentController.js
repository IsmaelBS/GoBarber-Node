import * as Yup from "yup";
import { startOfHour, isBefore, parseISO, format, subHours } from "date-fns";
import pt from "date-fns/locale/pt";
import Appointment from "../models/Appointment";
import User from "../models/User";
import File from "../models/File";
import Notification from "../schemas/Notification";
import Queue from "../../lib/Queue";
import CancellationMail from "../jobs/CancellationMail";

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        cancelled_at: null
      },
      order: ["date"],
      attributes: ["id", "date", "past", "cancelable"],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: "provider",
          attributes: ["id", "name"],
          include: [
            {
              model: File,
              as: "avatar",
              attributes: ["id", "path", "url"]
            }
          ]
        }
      ]
    });

    return res.json({ appointments });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      date: Yup.date().required(),
      provider_id: Yup.number().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validation fails!" });
    }

    const { provider_id, date } = req.body;

    const isProvider = await User.findOne({
      where: {
        id: provider_id,
        provider: true
      }
    });

    if (!isProvider) {
      return res
        .status(400)
        .json({ error: "You can only create appointments with providers" });
    }

    if (provider_id === req.userId) {
      return res
        .status(400)
        .json({ error: "You can not create appointment with yourself" });
    }

    const startHour = startOfHour(parseISO(date));

    if (isBefore(startHour, new Date())) {
      return res.status(400).json({
        error: "Past dates are not permitted"
      });
    }

    const checkAvailability = await Appointment.findOne({
      where: { provider_id, cancelled_at: null, date: startHour }
    });

    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: "Appointment date is not available" });
    }

    const user = await User.findByPk(req.userId);

    const formatedDate = format(startHour, "dd' de 'MMMM', às 'H:mm'h'", {
      locale: pt
    });

    await Notification.create({
      content: `Novo agendamento de ${user.name} para dia ${formatedDate}`,
      user: provider_id
    });

    const appointment = await Appointment.create({
      provider_id,
      date: startHour,
      user_id: req.userId
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "provider",
          attributes: ["name", "email"]
        },
        {
          model: User,
          as: "user",
          attributes: ["name"]
        }
      ]
    });

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this appointment"
      });
    }

    const subTwoHour = subHours(appointment.date, 2);

    if (isBefore(subTwoHour, new Date())) {
      return res.status(401).json({
        error: "You can only cancel appointments 2 hours in advance"
      });
    }

    appointment.cancelled_at = new Date();

    Queue.add(CancellationMail.key, { appointment });

    await appointment.save();

    return res.json(appointment);
  }
}

export default new AppointmentController();
