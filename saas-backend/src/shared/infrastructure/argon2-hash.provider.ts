import bcrypt from "argon2";
import type { HashProvider } from "../domain/hash.provider.js";

export class Argon2HashProvider implements HashProvider {

    async hash(payload: string): Promise<string> {
        return bcrypt.hash(payload);
    }

    async compare(payload: string, hashed: string): Promise<boolean> {
        const plainValue = payload.trim();
        const storedValue = hashed.trim();

        if (!storedValue) {
            return false;
        }

        if (!storedValue.startsWith('$')) {
            return storedValue === plainValue;
        }

        try {
            return await bcrypt.verify(storedValue, plainValue);
        } catch {
            return false;
        }
    }
}