export interface Cilindrada {
    id: string;
    cilindrada: number;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CilindradaSimple extends Omit<Cilindrada, 'activo'> { }
