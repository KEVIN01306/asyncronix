// shared/infrastructure/email/templates/cliente-bienvenida.template.ts
import { EmailLayout } from './base.template.js';

export interface ClienteBienvenidaTemplateParams {
  nombre: string;
  dpi: string;
  password?: string | null;
  plataformaUrl?: string;
  primaryColor?: string;
}

export const ClienteBienvenidaTemplate = ({
  nombre,
  dpi,
  password,
  plataformaUrl = process.env.CLIENTES_PLATAFORMA_URL || process.env.FRONTEND_URL || 'https://app.asyncronix.com',
  primaryColor = '#0F172A',
}: ClienteBienvenidaTemplateParams): string => {
  const contenidoHTML = `
    <tr>
      <td class="content-padding" style="padding: 40px 48px;">
        
        <h1 class="title-text" style="color: #0f172a; font-size: 22px; line-height: 30px; font-weight: 700; margin: 0 0 16px 0; padding: 0; text-align: center;">
          ¡Bienvenido a Asyncronix!
        </h1>

        <p class="body-text" style="font-size: 15px; line-height: 24px; color: #334155; margin: 0 0 20px 0; text-align: left;">
          Hola <strong>${nombre}</strong>, tu cuenta ha sido creada exitosamente. A través de nuestro portal podrás consultar tus compras, cotizaciones, vehículos y estados de servicio.
        </p>

        <p class="body-text" style="font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 16px 0; text-align: left;">
          A continuación te compartimos tus credenciales iniciales de acceso:
        </p>

        <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f1f5f9; border-radius: 6px; margin-bottom: 24px;">
          <tbody>
            <tr>
              <td class="code-box" style="padding: 20px 24px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 6px 0; font-size: 14px; color: #64748b;">
                      <strong>Usuario (DPI):</strong>
                    </td>
                    <td align="right" style="padding: 6px 0;">
                      <span style="font-family: 'SF Mono', Consolas, 'Liberation Mono', Menlo, Monaco, monospace; font-size: 16px; font-weight: 700; color: #0f172a;">
                        ${dpi}
                      </span>
                    </td>
                  </tr>
                  ${password ? `
                  <tr>
                    <td style="padding: 6px 0; font-size: 14px; color: #64748b;">
                      <strong>Contraseña inicial:</strong>
                    </td>
                    <td align="right" style="padding: 6px 0;">
                      <span style="font-family: 'SF Mono', Consolas, 'Liberation Mono', Menlo, Monaco, monospace; font-size: 15px; font-weight: 700; color: #0f172a; background-color: #e2e8f0; padding: 4px 8px; border-radius: 4px;">
                        ${password}
                      </span>
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px;">
          <tbody>
            <tr>
              <td align="center">
                <a href="${plataformaUrl}" class="btn-action" style="background-color: ${primaryColor}; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 6px; display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  Acceder a mi cuenta
                </a>
              </td>
            </tr>
          </tbody>
        </table>

        <p class="body-text" style="font-size: 13px; line-height: 20px; color: #475569; margin: 0 0 10px 0; text-align: center; font-weight: 600;">
          Por tu seguridad, te recomendamos cambiar tu contraseña al iniciar sesión por primera vez.
        </p>

        <p style="font-size: 13px; line-height: 20px; color: #64748b; margin: 0 0 28px 0; text-align: center;">
          No compartas tus credenciales de acceso con terceras personas.
        </p>

        <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px;">
          <tbody>
            <tr>
              <td style="border-top: 1px solid #e2e8f0; font-size: 0; line-height: 0;">&nbsp;</td>
            </tr>
          </tbody>
        </table>

        <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin: 0; text-align: center;">
          Este correo fue generado automáticamente por la plataforma de servicios Asyncronix. Si no reconoces esta cuenta, puedes comunicarte con soporte.
        </p>

      </td>
    </tr>
  `;

  return EmailLayout(
    'Bienvenido a Asyncronix - Credenciales de acceso',
    `Hola ${nombre}, tu cuenta en Asyncronix ha sido creada. Tu usuario de acceso es tu DPI: ${dpi}.`,
    contenidoHTML
  );
};
