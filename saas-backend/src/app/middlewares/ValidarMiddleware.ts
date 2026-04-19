import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodTypeAny } from "zod";
import Respuesta from "../http/respuesta.js";

export class ValidarMiddleware {

    public validarBody(schema: ZodTypeAny) {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                req.body = schema.parse(req.body);
                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    return res.status(400).json(Respuesta.validacion(error));
                }
                next(error);
            }
        };
    }

    public validarQuery(schema: ZodTypeAny) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                res.locals.query = await schema.parseAsync(req.query);
                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    return res.status(400).json(Respuesta.validacion(error));
                }
                next(error);
            }
        };
    }
}