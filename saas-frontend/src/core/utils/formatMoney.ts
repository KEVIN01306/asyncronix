
import { useAuthStore } from '../store/authStore';

const DEFAULT_LOCALE = 'es-GT';
const DEFAULT_SYMBOL = 'Q';
const DEFAULT_CURRENCY = 'GTQ';

export const formatMoney = (value: number, currencyCode?: string, locale?: string) => {
    const authState = useAuthStore.getState?.();
    const storeCurrencyCode = authState?.user?.negocio?.moneda?.codigo;
    const storeCurrencySymbol = authState?.user?.negocio?.moneda?.simbolo;
    const storeLocale = authState?.user?.negocio?.pais?.locale;
    const resolvedLocale = locale || storeLocale || DEFAULT_LOCALE;
    const code = currencyCode || storeCurrencyCode || DEFAULT_CURRENCY;

    console.log('Formatting money:', { value, currencyCode, locale, storeCurrencyCode, storeCurrencySymbol, storeLocale, resolvedLocale, code });

    try {
        if (typeof code === 'string' && code.length === 3) {
            return value.toLocaleString(resolvedLocale, {
                style: 'currency',
                currency: code,
                minimumFractionDigits: 2,
            });
        }
    } catch {
        // If Intl cannot format using the provided currency code, fall back to symbol
    }

    const symbol = storeCurrencySymbol || DEFAULT_SYMBOL;
    return `${symbol} ${value.toLocaleString(resolvedLocale, { minimumFractionDigits: 2 })}`;
};