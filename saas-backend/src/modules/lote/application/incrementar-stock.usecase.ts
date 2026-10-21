import type { PrismaClient } from "@prisma/client";
import { incrementarStock } from "./services/stock-movement.service.js";
import type { IncrementarStockInput, StockResultado } from "../domain/stock-movement.types.js";

export class IncrementarStockUseCase {
    constructor(private readonly prisma: PrismaClient) {}

    async execute(input: IncrementarStockInput): Promise<StockResultado> {
        return await incrementarStock(this.prisma, input);
    }
}

export const DevolverStockUseCase = IncrementarStockUseCase;
