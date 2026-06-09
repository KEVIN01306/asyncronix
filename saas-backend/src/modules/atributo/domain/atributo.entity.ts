export interface ValorAtributoSimple {
    id: string;
    valor: string;
}

export interface Atributo {
    id: string;
    negocio_id?: string | null;
    nombre: string;
    activo: boolean;
    valores?: ValorAtributoSimple[];
}

export interface AtributoCrear {
    nombre: string;
    valores?: string[]; // valores iniciales
}

export interface AtributoActualizar {
    nombre?: string;
    activo?: boolean;
}

export interface ValorAtributoCrear {
    atributo_id: string;
    valor: string;
}

export interface ValorAtributoActualizar {
    valor?: string;
}
