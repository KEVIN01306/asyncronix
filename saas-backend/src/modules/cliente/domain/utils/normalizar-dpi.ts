export function normalizarDpi(dpi: string | null | undefined): string | null {
    if (!dpi) return null;
    const cleaned = dpi.toString().replace(/\D/g, '').trim();
    return cleaned.length > 0 ? cleaned : null;
}

export function validarFormatoDpi(dpi: string | null | undefined): boolean {
    const normalizado = normalizarDpi(dpi);
    if (!normalizado) return false;
    // Guatemalan DPI has 13 numeric digits
    return normalizado.length === 13;
}
