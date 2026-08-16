// shared/infrastructure/email/templates/base.template.ts
export const EmailLayout = (title: string, preheader: string, content: string) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html dir="ltr" lang="es">
    <head>
      <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
      <meta name="x-apple-disable-message-reformatting" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      <style type="text/css">
        @media only screen and (max-width: 480px) {
          .body-padding { padding: 20px 8px !important; }
          .content-padding { padding: 28px 20px !important; }
          .header-padding { padding: 24px 16px !important; }
          .logo-img { height: 70px !important; }
          .title-text { font-size: 18px !important; line-height: 26px !important; }
          .code-box { padding: 16px 8px !important; }
          .code-text { font-size: 15px !important; line-height: 28px !important; letter-spacing: 6px !important; }
          .body-text { font-size: 14px !important; line-height: 22px !important; }
          .btn-action { width: 100% !important; box-sizing: border-box !important; }
        }
      </style>    
    </head>
    <body class="body-padding" style="margin: 0; padding: 0; background-color: #dbdfe4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    
      <!-- Preheader inyectado dinámicamente -->
      <div style="display:none; overflow:hidden; line-height:1px; opacity:0; max-height:0; max-width:0;" data-skip-in-text="true">
        ${preheader}
      </div>

      <!-- Tabla Envolvente (Fondo Gris Persistente) -->
      <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #dbdfe4; width: 100%; height: 100%;">
        <tbody>
          <tr>
            <td class="body-padding" align="center" style="padding: 48px 12px;">
              
              <!-- Tarjeta Principal Blanca -->
              <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <tbody>
                  
                  <!-- HEADER GLOBAL: Logo de la empresa -->
                  <tr>
                    <td class="header-padding" align="center" style="background-color: #ffffff; padding: 36px 32px; text-align: center;">
                      <img class="logo-img" alt="Asyncronix" height="70" src="https://pub-d0d406503a924f028d558cf1d4e7ceed.r2.dev/asyncronix_corto.png" style="display: block; outline: none; border: none; text-decoration: none; margin: 0 auto; object-fit: contain;" />
                    </td>
                  </tr>

                  <!-- ============================================== -->
                  <!-- AQUÍ SE INYECTA EL CONTENIDO DE LA PLANTILLA -->
                  <!-- ============================================== -->
                  ${content}

                </tbody>
              </table>

              <!-- FOOTER GLOBAL -->
              <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 540px; margin-top: 20px;">
                <tbody>
                  <tr>
                    <td align="center" style="text-align: center; padding: 0 12px;">
                      <p style="font-size: 12px; line-height: 18px; color: #64748b; margin: 0 0 4px 0;">
                        Este es un mensaje automático del sistema, por favor no respondas a este correo.
                      </p>
                      <p style="font-size: 12px; line-height: 18px; color: #64748b; margin: 0;">
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