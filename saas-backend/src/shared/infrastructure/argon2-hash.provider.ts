import bcrypt from "argon2";
import type { HashProvider } from "../domain/hash.provider.js";

export class Argon2HashProvider implements HashProvider {

    async hash(payload: string): Promise<string> {
        return bcrypt.hash(payload);
    }

    async compare(payload: string, hashed: string): Promise<boolean> {
        return bcrypt.verify(hashed, payload);
    }
}