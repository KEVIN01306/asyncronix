


export const formatMoney = (value: number) => {
    return `Q ${value.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`
}