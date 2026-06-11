export const crearCodigoSecuencial = (sequence: number): string => {
    const padded = String(sequence).padStart(10, '0');
    return `714${padded}`;
};
