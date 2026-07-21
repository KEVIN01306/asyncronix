export const VerificationCodeTemplate = (code: string, primaryColor: string = '#0F172A') => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="es">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>Código de Verificación - Asyncronix</title>
  </head>
  <body
    dir="ltr"
    lang="es"
    style="background-color:rgb(255,255,255);margin-top:0;margin-bottom:0;margin-right:0;margin-left:0">
    <table
      border="0"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      align="center">
      <tbody>
        <tr>
          <td
            dir="ltr"
            lang="es"
            style='background-color:rgb(255,255,255);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif;margin-right:auto;margin-left:auto;margin-bottom:0;margin-top:0'>
            
            <!-- Preheader / Texto oculto para vista previa -->
            <div
              style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0"
              data-skip-in-text="true">
              Tu código de verificación de Asyncronix es ${code}
              <div>
                &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
              </div>
            </div>

            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="max-width:37.5em;margin-right:auto;margin-left:auto;margin-bottom:0;margin-top:0">
              <tbody>
                <tr style="width:100%">
                  <td
                    style="padding-bottom:0;padding-top:0;padding-right:20px;padding-left:20px">
                    
                    <!-- Header / Logo -->
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="margin-top:32px">
                      <tbody>
                        <tr>
                          <td>
                            <img
                              alt="Asyncronix"
                              height="36"
                              src="https://pub-d0d406503a924f028d558cf1d4e7ceed.r2.dev/asyncronix_corto.png"
                              style="display:block;outline:none;border:none;text-decoration:none;object-fit:contain;" />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <!-- Título -->
                    <h1
                      style="color:rgb(29,28,29);font-size:32px;line-height:38px;font-weight:700;margin-bottom:24px;margin-top:30px;margin-right:0;margin-left:0;padding:0">
                      Código de verificación
                    </h1>

                    <!-- Mensaje principal -->
                    <p
                      style="font-size:18px;line-height:26px;color:rgb(51,65,85);margin-bottom:1.5rem;margin-top:16px">
                      Hola,<br /><br />
                      Has solicitado verificar tu dirección de correo electrónico. Utiliza el siguiente código para completar el proceso:
                    </p>

                    <!-- Caja con el Código -->
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="background-color:rgb(245,244,245);border-radius:0.5rem;margin-bottom:24px">
                      <tbody>
                        <tr>
                          <td
                            style="padding-bottom:32px;padding-top:32px;padding-right:10px;padding-left:10px">
                            <p
                              style="font-size:36px;line-height:36px;font-weight:700;letter-spacing:6px;color:${primaryColor};text-align:center;vertical-align:middle;margin-top:0;margin-bottom:0">
                              ${code}
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <!-- Expiración y Advertencias -->
                    <p
                      style="font-size:15px;line-height:22px;color:rgb(51,65,85);margin-top:16px;margin-bottom:12px">
                      Este código <strong>expirará en 15 minutos</strong>.
                    </p>

                    <p
                      style="font-size:14px;line-height:22px;color:#ef4444;font-weight:500;margin-top:0;margin-bottom:32px">
                      Si no solicitaste este código, puedes ignorar este correo con seguridad. No compartas este código con nadie.
                    </p>

                    <!-- Línea de Marca / Footer Logo -->
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation">
                      <tbody>
                        <tr>
                          <td>
                            <table
                              align="center"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="margin-bottom:24px;border-top:1px solid #e2e8f0;padding-top:24px">
                              <tbody style="width:100%">
                                <tr style="width:100%">
                                  <td style="width:100%">
                                    <img
                                      alt="Asyncronix"
                                      height="28"
                                      src="https://pub-d0d406503a924f028d558cf1d4e7ceed.r2.dev/asyncronix_corto.png"
                                      style="display:block;outline:none;border:none;text-decoration:none;object-fit:contain;" />
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <!-- Derechos de autor y Legal -->
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation">
                      <tbody>
                        <tr>
                          <td>
                            <p
                              style="font-size:12px;line-height:18px;text-align:left;margin-bottom:40px;color:rgb(183,183,183);margin-top:0">
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
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
};