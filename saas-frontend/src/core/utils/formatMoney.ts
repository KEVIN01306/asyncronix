
import { useAuthStore } from '../store/authStore';

const DEFAULT_LOCALE = 'es-GT';
const DEFAULT_SYMBOL = 'Q';
const DEFAULT_CURRENCY = 'GTQ';

export const formatMoney = (value: number | string | null | undefined, currencyCode?: string, locale?: string) => {
    if (value === null || value === undefined || value === '') return '-';
    const num = typeof value === 'number' ? value : Number(value);
    if (isNaN(num)) return '-';

    const authState = useAuthStore.getState?.();
    const storeCurrencyCode = authState?.user?.negocio?.moneda?.codigo;
    const storeCurrencySymbol = authState?.user?.negocio?.moneda?.simbolo;
    const storeLocale = authState?.user?.negocio?.pais?.locale;
    const resolvedLocale = locale || storeLocale || DEFAULT_LOCALE;
    const code = currencyCode || storeCurrencyCode || DEFAULT_CURRENCY;

    try {
        if (typeof code === 'string' && code.length === 3) {
            return num.toLocaleString(resolvedLocale, {
                style: 'currency',
                currency: code,
                minimumFractionDigits: 2,
            });
        }
    } catch {
        // If Intl cannot format using the provided currency code, fall back to symbol
    }

    const symbol = storeCurrencySymbol || DEFAULT_SYMBOL;
    return `${symbol} ${num.toLocaleString(resolvedLocale, { minimumFractionDigits: 2 })}`;
};