import { startOfDay, endOfDay, parseISO } from "date-fns";
import Appointment from "../models/Appointment";
import User from "../models/User";
import { Op } from "sequelize";

class ScheduleController {
  async index(req, res) {
    const isProvider = await User.findOne({
      where: {
        id: req.userId,
        provider: true
      }
    });

    if (!isProvider) {
      return res.status(400).json({ error: "User is not a provider!" });
    }

    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date not provided!" });
    }

    const parsedDate = parseISO(date);
    const startDay = startOfDay(parsedDate);
    const endDay = endOfDay(parsedDate);

    const appointments = await Appointment.findAll({
      where: {
        cancelled_at: null,
        provider_id: req.userId,
        date: {
          [Op.between]: [startDay, endDay]
        }
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name"]
        }
      ]
    });

    return res.json(appointments);
  }
}

export default new ScheduleController();
