import User from "../models/User";
import * as Yup from "yup";
import File from "../models/File";

class UserController {
  async store(req, res) {
    const Schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6)
    });

    if (!(await Schema.isValid(req.body))) {
      return res.status(401).json({ error: "Validation fails!" });
    }

    const emailExist = await User.findOne({ where: { email: req.body.email } });

    if (emailExist) {
      return res.status(400).json({ error: "E-mail already exists!" });
    }

    const { id, name, email } = await User.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    const Schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string().when("oldPassword", (oldPassword, field) =>
        oldPassword ? field.required() : field
      ),
      confirmPassword: Yup.string().when("password", (password, field) =>
        password ? field.required().oneOf([Yup.ref("password")]) : field
      )
    });

    if (!(await Schema.isValid(req.body))) {
      return res.status(401).json({ error: "Validation fails!" });
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email && user.email !== email) {
      const emailExist = await User.findOne({
        where: { email }
      });

      if (emailExist) {
        return res.status(400).json({ error: "E-mail already exists!" });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: "Password does not match!" });
    }

    await user.update(req.body);

    const { id, name, avatar } = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: "avatar",
          attributes: ["id", "path", "url"]
        }
      ]
    });

    return res.json({ id, name, email, avatar });
  }
}

export default new UserController();
