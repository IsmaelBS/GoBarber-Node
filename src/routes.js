import { Router } from "express";
import multer from "multer";
import multerConfig from "./config/multer";
import UserController from "./app/controllers/UserController";
import SessionController from "./app/controllers/SessionController";
import FileController from "./app/controllers/FileController";
import ProviderController from "./app/controllers/ProviderController";
import AppointmentController from "./app/controllers/AppointmentController";
import authMiddleware from "./app/middlewares/auth";
import ScheduleController from "./app/controllers/ScheduleController";
import NotificationController from "./app/controllers/NotificationController";
import AvailableController from "./app/controllers/AvailableController";

const uploads = multer(multerConfig);
const routes = new Router();

routes.post("/user", UserController.store);

routes.post("/session", SessionController.store);

routes.use(authMiddleware);

routes.post("/files", uploads.single("file"), FileController.store);

routes.put("/user", UserController.update);

routes.get("/appointments", AppointmentController.index);

routes.post("/appointments", AppointmentController.store);

routes.delete("/appointments/:id", AppointmentController.delete);

routes.get("/providers", ProviderController.index);

routes.get("/providers/:provider/available", AvailableController.index);

routes.get("/schedule", ScheduleController.index);

routes.get("/notification", NotificationController.index);

routes.put("/notification/:id", NotificationController.update);

export default routes;
