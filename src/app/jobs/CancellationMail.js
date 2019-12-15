import { format, parseISO } from "date-fns";
import pt from "date-fns/locale/pt";
import Mail from "../../lib/Mail";

class CancellationJob {
  get key() {
    return "CancellationMail";
  }

  async handle({ data }) {
    const { appointment } = data;
    console.log("A fila chegou");
    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: "Cancelamento de agendamento",
      text: "Você tem um novo cancelamento de serviço",
      template: "cancelation",
      context: {
        provider: appointment.provider.name,
        name: appointment.user.name,
        date: format(parseISO(appointment.date), "dd' de 'MMMM', às 'H:mm'h'", {
          locale: pt
        })
      }
    });
  }
}

export default new CancellationJob();
