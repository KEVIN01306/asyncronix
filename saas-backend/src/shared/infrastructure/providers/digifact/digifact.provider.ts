import type {
    IDigifactProvider,
    DigifactLoginRequestDTO,
    DigifactLoginResponseDTO,
    DigifactCertificacionResponseDTO,
    DigifactAnulacionRequestDTO,
    DigifactAnulacionResponseDTO,
    DigifactInfoNitRequestDTO,
    DigifactInfoNitResponseDTO
} from "../../../domain/providers/digifact.provider.interface.js";
import AppError from "../../../errors/AppError.js";

export class DigifactProvider implements IDigifactProvider {
    private readonly defaultBaseUrl: string | undefined;

    constructor() {
        // Fallback or explicit env config
        this.defaultBaseUrl = process.env.DIGIFACT_URL_BASE;
    }

    private getBaseUrl(ambiente: string): string {
        if (ambiente === 'PRODUCCION') {
            return process.env.DIGIFACT_URL_PROD || "https://nucgt.digifact.com/gt.com.apinuc/api";
        }
        return process.env.DIGIFACT_URL_TEST || this.defaultBaseUrl || "https://testnucgt.digifact.com/api";
    }

    async login(request: DigifactLoginRequestDTO): Promise<DigifactLoginResponseDTO> {
        try {
            const baseUrl = this.getBaseUrl(request.ambiente);
            const url = `${baseUrl}/login/get_token`;

            // Format Username if needed (Digifact requires GT.[12_DIGIT_NIT].[USERNAME])
            let formattedUsername = request.Username;
            if (!formattedUsername.startsWith('GT.') && request.nitEmisor) {
                const taxId = request.nitEmisor.padStart(12, '0');
                formattedUsername = `GT.${taxId}.${request.Username}`;
            }

            const payload = { Username: formattedUsername, Password: request.Password };

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json() as DigifactLoginResponseDTO;
        } catch (error: any) {
            console.error("Error obtaining Digifact token", error.message);
            throw new AppError("Error de autenticación con Digifact", "DIGIFACT_AUTH_ERROR", 502);
        }
    }

    async certificarFactura(
        token: string,
        nitEmisor: string,
        username: string,
        nucJson: any,
        ambiente: string
    ): Promise<DigifactCertificacionResponseDTO> {
        try {
            const baseUrl = this.getBaseUrl(ambiente);
            // Format NIT to exactly 12 characters as required
            const taxId = nitEmisor.padStart(12, '0');

            let formattedUsername = username;
            if (!formattedUsername.startsWith('GT.')) {
                formattedUsername = `GT.${taxId}.${username}`;
            }

            const url = `${baseUrl}/v2/transform/nuc_json?TAXID=${encodeURIComponent(taxId)}&USERNAME=${encodeURIComponent(formattedUsername)}&FORMAT=XML|PDF`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
                body: JSON.stringify(nucJson)
            });

            const data: any = await response.json();

            if (!response.ok || data.code !== 1) {
                // If Digifact returns a business error, we should pass it up, but without exposing tokens.
                const digifactMsg = data?.message || "Error al certificar factura en Digifact";
                throw new AppError(digifactMsg, "DIGIFACT_CERT_ERROR", 502);
            }

            return data as DigifactCertificacionResponseDTO;
        } catch (error: any) {
            console.error("Error certifying Digifact invoice", error.message);
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Error de comunicación al certificar factura en Digifact", "DIGIFACT_CERT_ERROR", 502);
        }
    }

    async anularFactura(
        token: string,
        request: DigifactAnulacionRequestDTO
    ): Promise<DigifactAnulacionResponseDTO> {
        try {
            let baseUrl = this.getBaseUrl(request.ambiente);
            // Si la base URL tiene /api al final, para anular suele ser base/api/Anular/CancelFelGT
            // En caso de que no tenga api, se agrega. (La que tenemos en getBaseUrl ya tiene /api)
            const url = baseUrl.endsWith('/api')
                ? `${baseUrl}/CancelFelGT`
                : `${baseUrl}/api/CancelFelGT`;

            // Format NIT to exactly 12 characters as required
            const taxId = request.Taxid.padStart(12, '0');

            let formattedUsername = request.Username;
            if (!formattedUsername.startsWith('GT.')) {
                formattedUsername = `GT.${taxId}.${request.Username}`;
            }

            const payload = {
                Taxid: taxId,
                Autorizacion: request.Autorizacion,
                IdReceptor: request.IdReceptor,
                FechaEmisionDocumentoAnular: request.FechaEmisionDocumentoAnular,
                MotivoAnulacion: request.MotivoAnulacion,
                Username: formattedUsername
            };

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
                body: JSON.stringify(payload)
            });

            let data: any;
            let responseText: string = "";
            try {
                responseText = await response.text();
                data = JSON.parse(responseText);
            } catch (e) {
                console.error("Digifact returned non-JSON response:", responseText);
                throw new Error(`Invalid JSON response: ${response.status} ${response.statusText}`);
            }

            if (!response.ok || (data.code !== 1 && data.Codigo !== 1)) {
                const digifactMsg = data?.message || data?.Mensaje || data?.error || `Error al anular factura en Digifact (HTTP ${response.status}). Respuesta: ${responseText}`;
                throw new AppError(digifactMsg, "DIGIFACT_ANULACION_ERROR", 502);
            }

            // Mapear los nombres en mayúsculas que devuelve Digifact al DTO interno
            return {
                ...data,
                code: data.code ?? data.Codigo,
                message: data.message ?? data.Mensaje,
                responseData1: data.responseData1 ?? data.ResponseDATA1,
                responseData3: data.responseData3 ?? data.ResponseDATA3,
                authNumber: data.authNumber ?? data.Autorizacion
            } as DigifactAnulacionResponseDTO;
        } catch (error: any) {
            console.error("Error annulling Digifact invoice", error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Error de comunicación al anular factura en Digifact: ${error.message}`, "DIGIFACT_ANULACION_ERROR", 502);
        }
    }

    async obtenerInformacionNit(
        token: string,
        request: DigifactInfoNitRequestDTO
    ): Promise<DigifactInfoNitResponseDTO> {
        try {
            const baseUrl = this.getBaseUrl(request.ambiente);
            const urlBaseApi = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
            
            const taxId = request.nitEmisor.padStart(12, '0');

            let formattedUsername = request.username;
            if (!formattedUsername.startsWith('GT.')) {
                formattedUsername = `GT.${taxId}.${request.username}`;
            }

            const url = new URL(`${urlBaseApi}/Shared`);
            url.searchParams.append("TAXID", taxId);
            url.searchParams.append("DATA1", "SHARED_GETINFONITcom");
            url.searchParams.append("DATA2", `NIT|${request.nitConsultar}`);
            url.searchParams.append("COUNTRY", request.codigoIsoPais);
            url.searchParams.append("USERNAME", formattedUsername);

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                }
            });

            let data: any;
            let responseText: string = "";
            try {
                responseText = await response.text();
                data = JSON.parse(responseText);
            } catch (e) {
                console.error("Digifact returned non-JSON response for NIT info:", responseText);
                throw new Error(`Invalid JSON response: ${response.status} ${response.statusText}`);
            }

            // Check if successful
            // Typical response has "REQUEST_DATA" array where "Codigo": 1 is success
            const requestData = data.REQUEST_DATA?.[0];
            if (!response.ok || !requestData || requestData.Codigo !== 1) {
                const digifactMsg = requestData?.Mensaje || `Error al consultar NIT en Digifact (HTTP ${response.status})`;
                throw new AppError(digifactMsg, "DIGIFACT_NIT_LOOKUP_ERROR", 502);
            }

            return data as DigifactInfoNitResponseDTO;
        } catch (error: any) {
            console.error("Error obtaining Digifact NIT info", error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Error de comunicación al consultar NIT en Digifact: ${error.message}`, "DIGIFACT_NIT_LOOKUP_ERROR", 502);
        }
    }
}
