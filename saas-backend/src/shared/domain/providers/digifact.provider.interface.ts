export interface DigifactLoginResponseDTO {
    Token: string;
    expira_en: string;
    otorgado_a: string;
}

export interface DigifactCertificacionResponseDTO {
    code: number;
    message: string;
    authNumber?: string;
    responseData1?: string; // XML
    responseData3?: string; // PDF
    suggestedFileName?: string;
    serial?: string;
    issuedTimeStamp?: string;
    taxID?: string;
    receiverTaxID?: string;
    totalAmount?: string;
}

export interface DigifactAnulacionRequestDTO {
    Taxid: string; // NIT Emisor
    Autorizacion: string; // DTE UUID a anular
    IdReceptor: string; // CF o NIT del receptor
    FechaEmisionDocumentoAnular: string; // 2026-08-24T17:28:00
    MotivoAnulacion: string;
    Username: string;
    ambiente: string;
}

export interface DigifactAnulacionResponseDTO {
    code: number;
    message: string;
    authNumber?: string;
    responseData1?: string; // XML de anulación
    responseData3?: string; // PDF de anulación
}

export interface DigifactLoginRequestDTO {
    Username: string;
    Password: string; // Not real password, but the credentials for FEL
    ambiente: string; // 'TEST' o 'PRODUCCION'
    nitEmisor?: string;
}

export interface DigifactInfoNitRequestDTO {
    nitEmisor: string;
    nitConsultar: string;
    username: string;
    ambiente: string;
    codigoIsoPais: string;
}

export interface DigifactInfoNitResponseDTO {
    Codigo?: number;
    Mensaje?: string;
    RESPONSE?: Array<{
        PAIS: string;
        NIT: string;
        NOMBRE: string;
        Direccion?: string;
        DEPARTAMENTO?: string;
        MUNICIPIO?: string;
    }>;
}

export interface IDigifactProvider {
    /**
     * Obtains a temporal token from Digifact
     */
    login(request: DigifactLoginRequestDTO): Promise<DigifactLoginResponseDTO>;

    /**
     * Certifies an invoice via Digifact
     */
    certificarFactura(
        token: string,
        nitEmisor: string,
        username: string,
        nucJson: any,
        ambiente: string
    ): Promise<DigifactCertificacionResponseDTO>;

    /**
     * Anula una factura certificada previamente en Digifact
     */
    anularFactura(
        token: string,
        request: DigifactAnulacionRequestDTO
    ): Promise<DigifactAnulacionResponseDTO>;

    /**
     * Obtiene información de un NIT (nombre, etc.) consultando a Digifact
     */
    obtenerInformacionNit(
        token: string,
        request: DigifactInfoNitRequestDTO
    ): Promise<DigifactInfoNitResponseDTO>;
}
