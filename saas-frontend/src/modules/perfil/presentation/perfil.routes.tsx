import type { RouteObject } from "react-router-dom";
import { PerfilPage } from "./perfil.lazy";

export const perfilRoutes: RouteObject[] = [
    {
        path: "perfil",
        element: <PerfilPage />,
    }
];
