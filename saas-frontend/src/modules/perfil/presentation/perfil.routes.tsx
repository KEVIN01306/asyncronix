import type { RouteObject } from "react-router-dom";
import { PerfilPage, VerificarCorreoPage, CorreoVerificadoPage } from "./perfil.lazy";

export const perfilRoutes: RouteObject[] = [
    {
        path: "perfil",
        children: [
            {
                index: true,
                element: <PerfilPage />,
            },
            {
                path: "verificar-correo",
                element: <VerificarCorreoPage />,
            },
            {
                path: "correo-verificado",
                element: <CorreoVerificadoPage />,
            }
        ]
    }
];
