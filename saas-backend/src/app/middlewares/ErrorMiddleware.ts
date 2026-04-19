import type { NextFunction, Request, Response } from "express";
import Respuesta from "../http/respuesta.js";

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = err.statusCode || 500;
    let code = err.code || 'INTERNAL_SERVER_ERROR';
    let message = err.message || 'Error interno del servidor';
    console.log(err)
    res.status(statusCode).json(
        Respuesta.error(message, code)
    );
}