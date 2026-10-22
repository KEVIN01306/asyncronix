import crypto from "node:crypto";

export function generarPasswordSegura(): string {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*";
    const bytes = crypto.randomBytes(14);
    let result = "";
    for (let i = 0; i < 14; i++) {
        const byte = bytes[i] ?? 0;
        result += chars[byte % chars.length]!;
    }
    return result;
}
