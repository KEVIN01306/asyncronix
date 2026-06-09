import AppError from "../../../shared/errors/AppError.js";

export function construirDetallesVentaPorVariante(variante: any, lotes: any[], cantidad: number) {
    const lotesActivos = lotes.filter((l: any) => l.activo && (l.cantidad_actual ?? 0) > 0);
    if (!lotesActivos || lotesActivos.length === 0) {
        throw new AppError('No hay lotes activos con stock para la variante', 'NO_LOTE_DISPONIBLE', 400);
    }

    let restante = cantidad;
    const detallesToCreate: any[] = [];
    const precioUnitario = variante.precio_sugerido ?? 0;

    for (const lote of lotesActivos) {
        if (restante <= 0) break;
        const disponible = lote.cantidad_actual ?? 0;
        if (disponible <= 0) continue;

        const take = Math.min(restante, disponible);
        const baseName = variante.producto?.nombre ?? lote.variante?.producto_nombre ?? variante.sku ?? '';
        const atributos = (variante.valores ?? []).map((v: any) => v.atributo ? `${v.atributo.nombre}: ${v.valor}` : `${v.valor}`).filter(Boolean).join(', ');
        const descripcion = atributos && atributos.length > 0 ? `${baseName} (${atributos})` : baseName;

        detallesToCreate.push({
            variante_id: variante.id,
            lote_id: lote.id,
            descripcion,
            cantidad: take,
            precio_unitario: precioUnitario,
            costo_unitario: lote.costo_compra ?? 0
        });

        restante -= take;
    }

    if (restante > 0) {
        throw new AppError('Stock insuficiente para completar la cantidad solicitada', 'INSUFICIENTE_STOCK', 400);
    }

    return detallesToCreate;
}
