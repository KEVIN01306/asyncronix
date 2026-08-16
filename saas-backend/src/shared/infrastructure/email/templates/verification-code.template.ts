// shared/infrastructure/email/templates/verification-code.template.ts
import { EmailLayout } from './base.template.js';

export const VerificationCodeTemplate = (code: string, primaryColor: string = '#0F172A', frontendUrl: string = process.env.FRONTEND_URL || 'http://localhost:5173') => {
  const formattedCode = code.split('').join(' ');

  const contenidoHTML = `
    <tr>
      <td class="content-padding" style="padding: 40px 48px;">
        
        <h1 class="title-text" style="color: #0f172a; font-size: 22px; line-height: 30px; font-weight: 700; margin: 0 0 16px 0; padding: 0; text-align: center;">
          Código de verificación
        </h1>

        <p class="body-text" style="font-size: 15px; line-height: 24px; color: #334155; margin: 0 0 24px 0; text-align: left;">
          Has solicitado acceder a tu cuenta en <strong>Asyncronix ERP</strong>. Utiliza el siguiente código para completar la verificación:
        </p>

        <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f1f5f9; border-radius: 6px; margin-bottom: 20px;">
          <tbody>
            <tr>
              <td class="code-box" align="center" style="padding: 20px 12px; text-align: center;">
                <span class="code-text" style="font-family: 'SF Mono', Consolas, 'Liberation Mono', Menlo, Monaco, monospace; font-size: 32px; line-height: 32px; font-weight: 700; letter-spacing: 10px; color: #0f172a; display: inline-block;">
                  ${formattedCode}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px;">
          <tbody>
            <tr>
              <td align="center">
                <a href="${frontendUrl}/perfil/verificar-correo?code=${code}" class="btn-action" style="background-color: ${primaryColor}; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 6px; display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  Verificar mi cuenta
                </a>
              </td>
            </tr>
          </tbody>
        </table>

        <p class="body-text" style="font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 10px 0; text-align: center; font-weight: 600;">
          Este código es válido durante 15 minutos.
        </p>

        <p style="font-size: 13px; line-height: 20px; color: #64748b; margin: 0 0 28px 0; text-align: center;">
          Si no has solicitado este código de verificación, puedes ignorar este correo de forma segura. No compartas este código con ninguna persona.
        </p>

        <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px;">
          <tbody>
            <tr>
              <td style="border-top: 1px solid #e2e8f0; font-size: 0; line-height: 0;">&nbsp;</td>
            </tr>
          </tbody>
        </table>

        <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin: 0; text-align: center;">
          ¿El código no funciona o ha expirado? Solicita uno nuevo directamente desde el portal de inicio de sesión de Asyncronix.
        </p>

      </td>
    </tr>
  `;

  // Aquí juntamos todas las piezas y devolvemos el HTML final armado
  return EmailLayout(
    'Código de Verificación - Asyncronix', // El ${title}
    `Tu código de verificación de Asyncronix es ${code}.`, // El ${preheader}
    contenidoHTML // El ${content}
  );
};