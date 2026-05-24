import type { RouteObject } from 'react-router-dom';
import { ChecklistItemsListPage, ChecklistItemFormPage, ChecklistItemDetailPage } from './checklist-items-lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const checklistItemsRoutes: RouteObject[] = [
    {
        path: 'checklist',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_CHECKLIST">
                        <ChecklistItemsListPage />
                    </RouteProtector>
                )
            },
            {
                path: 'nuevo',
                element: (
                    <RouteProtector requiredPermission="CREAR_CHECKLIST">
                        <ChecklistItemFormPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id',
                element: (
                    <RouteProtector requiredPermission="VER_CHECKLIST_DETALLE">
                        <ChecklistItemDetailPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id/editar',
                element: (
                    <RouteProtector requiredPermission="EDITAR_CHECKLIST">
                        <ChecklistItemFormPage />
                    </RouteProtector>
                )
            }
        ]
    }
];
