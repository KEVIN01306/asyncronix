import AppError from "../../../shared/errors/AppError.js";

export function construirDetallesVentaPorVariante(variante: any, lotes: any[], cantidad: number, ignoreStock: boolean = false) {
    const lotesActivos = lotes.filter((l: any) => l.activo && (l.cantidad_actual ?? 0) > 0);
    if ((!lotesActivos || lotesActivos.length === 0) && !ignoreStock) {
        const nombre = variante.producto?.nombre ?? variante.sku ?? 'Desconocido';
        throw new AppError(`No hay stock disponible para el producto: ${nombre}`, 'NO_LOTE_DISPONIBLE', 400);
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
        if (!ignoreStock) {
            const nombre = variante.producto?.nombre ?? variante.sku ?? 'Desconocido';
            throw new AppError(`Stock insuficiente para el producto: ${nombre}`, 'INSUFICIENTE_STOCK', 400);
        } else {
            const baseName = variante.producto?.nombre ?? variante.sku ?? '';
            const atributos = (variante.valores ?? []).map((v: any) => v.atributo ? `${v.atributo.nombre}: ${v.valor}` : `${v.valor}`).filter(Boolean).join(', ');
            const descripcion = atributos && atributos.length > 0 ? `${baseName} (${atributos})` : baseName;

            detallesToCreate.push({
                variante_id: variante.id,
                lote_id: null,
                descripcion,
                cantidad: restante,
                precio_unitario: precioUnitario,
                costo_unitario: 0
            });
            restante = 0;
        }
    }

    return detallesToCreate;
}
