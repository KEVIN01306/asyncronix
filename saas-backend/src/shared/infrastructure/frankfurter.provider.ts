import type { ExchangeRateProvider, ExchangeRateResponse } from '@shared/domain/providers/ExchangeRateProvider.js';
import AppError from '@shared/errors/AppError.js';

export class FrankfurterExchangeRateProvider implements ExchangeRateProvider {
    private baseUrl = 'https://api.frankfurter.dev/v2';

    async getRate(base: string, quote: string): Promise<ExchangeRateResponse> {
        try {
            if (base === quote) {
                return {
                    base,
                    quote,
                    rate: 1.0,
                    date: new Date().toISOString().split('T')[0],
                };
            }

            const response = await fetch(`${this.baseUrl}/rate/${base}/${quote}`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            return {
                base: data.base,
                quote: data.quote,
                rate: data.rate,
                date: data.date,
            };
        } catch (error) {
            throw new AppError(
                'No fue posible obtener el tipo de cambio',
                'EXCHANGE_RATE_ERROR',
                500
            );
        }
    }
}
