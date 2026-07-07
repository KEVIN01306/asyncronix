export interface ExchangeRateResponse {
    base: string;
    quote: string;
    rate: number;
    date: string;
}

export interface ExchangeRateProvider {
    getRate(base: string, quote: string): Promise<ExchangeRateResponse>;
}
