import { Router } from "express";
import { mediaController } from "../media.module.js";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";

const mediaRouter = Router();
const auth = new AuthMiddleware();

mediaRouter.use(auth.protegerRuta);

mediaRouter.get("/", mediaController.listar.bind(mediaController));

export default mediaRouter;
