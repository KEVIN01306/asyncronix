import test from "node:test";
import assert from "node:assert/strict";
import { numeroALetras } from "../../../../../shared/utils/numeroALetras.js";

test("numeroALetras - Valores enteros", () => {
    assert.strictEqual(numeroALetras(0), "CERO QUETZALES CON 00/100");
    assert.strictEqual(numeroALetras(1), "UN QUETZAL CON 00/100");
    assert.strictEqual(numeroALetras(10), "DIEZ QUETZALES CON 00/100");
    assert.strictEqual(numeroALetras(15), "QUINCE QUETZALES CON 00/100");
    assert.strictEqual(numeroALetras(20), "VEINTE QUETZALES CON 00/100");
    assert.strictEqual(numeroALetras(25), "VEINTICINCO QUETZALES CON 00/100");
    assert.strictEqual(numeroALetras(100), "CIEN QUETZALES CON 00/100");
    assert.strictEqual(numeroALetras(110), "CIENTO DIEZ QUETZALES CON 00/100");
    assert.strictEqual(numeroALetras(197), "CIENTO NOVENTA Y SIETE QUETZALES CON 00/100");
    assert.strictEqual(numeroALetras(500), "QUINIENTOS QUETZALES CON 00/100");
    assert.strictEqual(numeroALetras(1000), "MIL QUETZALES CON 00/100");
    assert.strictEqual(numeroALetras(1250), "MIL DOSCIENTOS CINCUENTA QUETZALES CON 00/100");
});

test("numeroALetras - Valores con decimales", () => {
    assert.strictEqual(numeroALetras(0.50), "CERO QUETZALES CON 50/100");
    assert.strictEqual(numeroALetras(1.05), "UN QUETZAL CON 05/100");
    assert.strictEqual(numeroALetras(99.99), "NOVENTA Y NUEVE QUETZALES CON 99/100");
    assert.strictEqual(numeroALetras(150.75), "CIENTO CINCUENTA QUETZALES CON 75/100");
    assert.strictEqual(numeroALetras(10500.25), "DIEZ MIL QUINIENTOS QUETZALES CON 25/100");
});

test("numeroALetras - Grandes cantidades representativas", () => {
    assert.strictEqual(numeroALetras(1000000), "UN MILLÓN QUETZALES CON 00/100");
    assert.strictEqual(numeroALetras(2000000), "DOS MILLONES QUETZALES CON 00/100");
    assert.strictEqual(numeroALetras(1234567.89), "UN MILLÓN DOSCIENTOS TREINTA Y CUATRO MIL QUINIENTOS SESENTA Y SIETE QUETZALES CON 89/100");
});

test("numeroALetras - Manejo de valores negativos o inválidos", () => {
    assert.strictEqual(numeroALetras(-5), "");
    assert.strictEqual(numeroALetras(NaN), "");
});
