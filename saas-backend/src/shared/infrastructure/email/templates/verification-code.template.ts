export const VerificationCodeTemplate = (code: string, primaryColor: string = '#0F172A', frontendUrl: string = process.env.FRONTEND_URL || 'http://localhost:5173') => {
  // Separación limpia de caracteres
  const formattedCode = code.split('').join(' ');

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="es">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Código de Verificación - Asyncronix</title>
    <style type="text/css">
      @media only screen and (max-width: 480px) {
        .body-padding {
          padding: 20px 8px !important;
        }
        .content-padding {
          padding: 28px 20px !important;
        }
        .header-padding {
          padding: 24px 16px !important;
        }
        .logo-img {
          height: 70px !important;
        }
        .title-text {
          font-size: 18px !important;
          line-height: 26px !important;
        }
        .code-box {
          padding: 16px 8px !important;
        }
        .code-text {
          font-size: 15px !important;
          line-height: 28px !important;
          letter-spacing: 6px !important;
        }
        .body-text {
          font-size: 14px !important;
          line-height: 22px !important;
        }
        .btn-action {
          width: 100% !important;
          box-sizing: border-box !important;
        }
      }
    </style>
  </head>
  <body
    class="body-padding"
    dir="ltr"
    lang="es"
    style="background-color: rgba(219, 223, 228, 1); margin: 0; padding: 48px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    
    <!-- Preheader oculto -->
    <div style="display:none; overflow:hidden; line-height:1px; opacity:0; max-height:0; max-width:0;" data-skip-in-text="true">
      Tu código de verificación de Asyncronix es ${code}.
    </div>

    <!-- Contenedor General -->
    <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
      <tbody>
        <tr>
          <td align="center">
            
            <!-- Tarjeta Principal SaaS (540px) -->
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="max-width: 540px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              <tbody>
                
                <!-- Header -->
                <tr>
                  <td class="header-padding" align="center" style="background-color: #ffffff; padding: 36px 32px; text-align: center;">
                    <img
                      class="logo-img"
                      alt="Asyncronix"
                      height="70"
                      src="https://pub-d0d406503a924f028d558cf1d4e7ceed.r2.dev/asyncronix_corto.png"
                      style="display: block; outline: none; border: none; text-decoration: none; margin: 0 auto; object-fit: contain;" />
                  </td>
                </tr>

                <!-- Cuerpo del Correo -->
                <tr>
                  <td class="content-padding" style="padding: 40px 48px;">
                    
                    <!-- Título Formal -->
                    <h1 class="title-text" style="color: #0f172a; font-size: 22px; line-height: 30px; font-weight: 700; margin: 0 0 16px 0; padding: 0; text-align: center;">
                      Código de verificación
                    </h1>

                    <!-- Texto de Introducción -->
                    <p class="body-text" style="font-size: 15px; line-height: 24px; color: #334155; margin: 0 0 24px 0; text-align: left;">
                      Has solicitado acceder a tu cuenta en <strong>Asyncronix ERP</strong>. Utiliza el siguiente código para completar la verificación:
                    </p>

                    <!-- Caja del Código -->
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="background-color: #f1f5f9; border-radius: 6px; margin-bottom: 20px;">
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

                    <!-- Botón de Acción -->
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

                    <!-- Expiración y Nota de Seguridad -->
                    <p class="body-text" style="font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 10px 0; text-align: center; font-weight: 600;">
                      Este código es válido durante 15 minutos.
                    </p>

                    <p style="font-size: 13px; line-height: 20px; color: #64748b; margin: 0 0 28px 0; text-align: center;">
                      Si no has solicitado este código de verificación, puedes ignorar este correo de forma segura. No compartas este código con ninguna persona.
                    </p>

                    <!-- Separador Neutro -->
                    <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px;">
                      <tbody>
                        <tr>
                          <td style="border-top: 1px solid #e2e8f0; font-size: 0; line-height: 0;">&nbsp;</td>
                        </tr>
                      </tbody>
                    </table>

                    <!-- Bloque de Soporte -->
                    <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin: 0; text-align: center;">
                      ¿El código no funciona o ha expirado? Solicita uno nuevo directamente desde el portal de inicio de sesión de Asyncronix.
                    </p>

                  </td>
                </tr>

              </tbody>
            </table>

            <!-- Footer Externo -->
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 540px; margin-top: 20px;">
              <tbody>
                <tr>
                  <td align="center" style="text-align: center; padding: 0 12px;">
                    <p style="font-size: 12px; line-height: 18px; color: #ffffff; margin: 0 0 4px 0; opacity: 0.9;">
                      Este es un mensaje automático del sistema, por favor no respondas a este correo.
                    </p>
                    <p style="font-size: 12px; line-height: 18px; color: #ffffff; margin: 0; opacity: 0.9;">
                      &copy; ${new Date().getFullYear()} Asyncronix. Todos los derechos reservados.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
};