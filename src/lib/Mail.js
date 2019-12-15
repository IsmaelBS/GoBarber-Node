import { resolve } from "path";
import exphbs from "express-handlebars";
import mailerhbs from "nodemailer-express-handlebars";
import nodemailer from "nodemailer";
import mailConfig from "../config/mail";

class Mail {
  constructor() {
    const { host, port, secure, auth } = mailConfig;
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: auth ? auth : null
    });

    this.configureTemplates();
  }

  configureTemplates() {
    const viewPath = resolve(__dirname, "..", "app", "view", "emails");

    this.transporter.use(
      "compile",
      mailerhbs({
        viewEngine: exphbs.create({
          layoutsDir: resolve(viewPath, "layouts"),
          partialsDir: resolve(viewPath, "partials"),
          defaultLayout: "default",
          extname: ".hbs"
        }),
        viewPath,
        extName: ".hbs"
      })
    );
  }

  sendMail(message) {
    this.transporter.sendMail({ ...mailConfig.default, ...message });
  }
}

export default new Mail();
