import type { PrismaClient } from "@prisma/client";
import { descontarStock } from "./services/stock-movement.service.js";
import type { DescontarStockInput, StockResultado } from "../domain/stock-movement.types.js";

export class DescontarStockUseCase {
    constructor(private readonly prisma: PrismaClient) {}

    async execute(input: DescontarStockInput): Promise<StockResultado> {
        return await descontarStock(this.prisma, input);
    }
}
