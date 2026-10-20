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
                const cleanNit = request.nitEmisor.replace(/[^0-9]/g, '');
                const taxId = cleanNit.padStart(12, '0');
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

            const responseText = await response.text();

            if (!response.ok) {
                console.error("Digifact login failed with status:", response.status, responseText);
                throw new AppError(`Error de autenticación con Digifact (${response.status}): ${responseText}`, "DIGIFACT_AUTH_ERROR", 401);
            }

            let data: any;
            try {
                data = JSON.parse(responseText);
            } catch {
                throw new AppError("Respuesta de autenticación no válida de Digifact", "DIGIFACT_AUTH_ERROR", 502);
            }

            return data as DigifactLoginResponseDTO;
        } catch (error: any) {
            console.error("Error obtaining Digifact token:", error.message);
            if (error instanceof AppError) {
                throw error;
            }
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
            const cleanNit = nitEmisor.replace(/[^0-9]/g, '');
            const taxId = cleanNit.padStart(12, '0');

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

            const responseText = await response.text();

            // Detect 401 Unauthorized or expired token
            if (response.status === 401 || response.status === 403 || responseText.includes("401 Unauthorized") || responseText.toLowerCase().includes("unauthorized")) {
                throw new AppError("Token de Digifact no válido o expirado", "DIGIFACT_UNAUTHORIZED", 401);
            }

            let data: any;
            try {
                data = JSON.parse(responseText);
            } catch {
                throw new AppError(`Respuesta no válida de Digifact (HTTP ${response.status}): ${responseText}`, "DIGIFACT_CERT_ERROR", 502);
            }

            if (!response.ok || data.code !== 1) {
                const digifactMsg = data?.message || data?.Mensaje || "Error al certificar factura en Digifact";
                if (data?.code === 401 || data?.Codigo === 401 || digifactMsg.toLowerCase().includes("token") || digifactMsg.toLowerCase().includes("unauthorized") || digifactMsg.toLowerCase().includes("no autorizado")) {
                    throw new AppError(digifactMsg, "DIGIFACT_UNAUTHORIZED", 401);
                }
                throw new AppError(digifactMsg, "DIGIFACT_CERT_ERROR", 502);
            }

            return data as DigifactCertificacionResponseDTO;
        } catch (error: any) {
            console.error("Error certifying Digifact invoice:", error.message);
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
            const url = baseUrl.endsWith('/api')
                ? `${baseUrl}/CancelFelGT`
                : `${baseUrl}/api/CancelFelGT`;

            // Format NIT to exactly 12 characters as required
            const cleanNit = request.Taxid.replace(/[^0-9]/g, '');
            const taxId = cleanNit.padStart(12, '0');

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

            const responseText = await response.text();

            // Detect 401 Unauthorized or expired token
            if (response.status === 401 || response.status === 403 || responseText.includes("401 Unauthorized") || responseText.toLowerCase().includes("unauthorized")) {
                throw new AppError("Token de Digifact no válido o expirado", "DIGIFACT_UNAUTHORIZED", 401);
            }

            let data: any;
            try {
                data = JSON.parse(responseText);
            } catch {
                throw new AppError(`Respuesta no válida de Digifact al anular (HTTP ${response.status}): ${responseText}`, "DIGIFACT_ANULACION_ERROR", 502);
            }

            if (!response.ok || (data.code !== 1 && data.Codigo !== 1)) {
                const digifactMsg = data?.message || data?.Mensaje || data?.error || `Error al anular factura en Digifact (HTTP ${response.status})`;
                if (data?.code === 401 || data?.Codigo === 401 || digifactMsg.toLowerCase().includes("token") || digifactMsg.toLowerCase().includes("unauthorized") || digifactMsg.toLowerCase().includes("no autorizado")) {
                    throw new AppError(digifactMsg, "DIGIFACT_UNAUTHORIZED", 401);
                }
                throw new AppError(digifactMsg, "DIGIFACT_ANULACION_ERROR", 502);
            }

            return {
                ...data,
                code: data.code ?? data.Codigo,
                message: data.message ?? data.Mensaje,
                responseData1: data.responseData1 ?? data.ResponseDATA1,
                responseData3: data.responseData3 ?? data.ResponseDATA3,
                authNumber: data.authNumber ?? data.Autorizacion
            } as DigifactAnulacionResponseDTO;
        } catch (error: any) {
            console.error("Error annulling Digifact invoice:", error);
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
            
            const cleanNit = request.nitEmisor.replace(/[^0-9]/g, '');
            const taxId = cleanNit.padStart(12, '0');

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

            const responseText = await response.text();

            // Detect 401 Unauthorized or expired token
            if (response.status === 401 || response.status === 403 || responseText.includes("401 Unauthorized") || responseText.toLowerCase().includes("unauthorized")) {
                throw new AppError("Token de Digifact no válido o expirado", "DIGIFACT_UNAUTHORIZED", 401);
            }

            let data: any;
            try {
                data = JSON.parse(responseText);
            } catch {
                throw new AppError(`Respuesta no válida de Digifact al consultar NIT (HTTP ${response.status}): ${responseText}`, "DIGIFACT_NIT_LOOKUP_ERROR", 502);
            }

            const requestData = data.REQUEST_DATA?.[0];
            if (!response.ok || !requestData || requestData.Codigo !== 1) {
                const digifactMsg = requestData?.Mensaje || `Error al consultar NIT en Digifact (HTTP ${response.status})`;
                if (requestData?.Codigo === 401 || digifactMsg.toLowerCase().includes("token") || digifactMsg.toLowerCase().includes("unauthorized") || digifactMsg.toLowerCase().includes("no autorizado")) {
                    throw new AppError(digifactMsg, "DIGIFACT_UNAUTHORIZED", 401);
                }
                throw new AppError(digifactMsg, "DIGIFACT_NIT_LOOKUP_ERROR", 502);
            }

            return data as DigifactInfoNitResponseDTO;
        } catch (error: any) {
            console.error("Error obtaining Digifact NIT info:", error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Error de comunicación al consultar NIT en Digifact: ${error.message}`, "DIGIFACT_NIT_LOOKUP_ERROR", 502);
        }
    }
}
