import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

async function run() {
  const config = await prisma.negocioFacturacionConfig.findFirst();
  
  const taxId = config.nit_emisor.padStart(12, '0');
  const digifactUsername = `GT.${taxId}.${config.fel_username}`;
  
  const authRes = await fetch("https://testnucgt.digifact.com/api/login/get_token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Username: digifactUsername, Password: config.fel_password })
  });
  const token = (await authRes.json()).Token;
  
  const url = `https://testnucgt.digifact.com/api/v2/transform/nuc_json?TAXID=${encodeURIComponent(taxId)}&USERNAME=${encodeURIComponent(digifactUsername)}&FORMAT=XML|PDF`;
  
  const testPayloads = [
    { SHARED_GETDTE: { } },
    { GTDocumento: { } },
    { "dte:GTDocumento": { } },
    { "Documento": { "DocumentType": "FACT" } },
    { "Document": { "DocumentType": "FACT", "Currency": "GTQ" } },
    { "Document": { } }
  ];
  
  for (const payload of testPayloads) {
      console.log("Testing:", Object.keys(payload)[0]);
      const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": token },
          body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log("Res:", data.message || data);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
