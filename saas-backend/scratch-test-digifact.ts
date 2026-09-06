import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

async function run() {
  const config = await prisma.negocioFacturacionConfig.findFirst();
  if (!config) throw new Error("No config");
  
  // Login
  let digifactUsername = config.fel_username;
  if (!digifactUsername.startsWith('GT.')) {
      const taxId = config.nit_emisor.padStart(12, '0');
      digifactUsername = `GT.${taxId}.${config.fel_username}`;
  }
  
  const loginUrl = "https://testnucgt.digifact.com/api/login/get_token";
  console.log("Login with:", digifactUsername, config.fel_password);
  
  const authRes = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Username: digifactUsername, Password: config.fel_password })
  });
  
  if (!authRes.ok) throw new Error("Auth failed: " + await authRes.text());
  
  const authData = await authRes.json();
  const token = authData.Token;
  
  console.log("Got token.");
  
  const testPayloads = [
    { Document: { DocumentType: "FACT" } },
    { Documento: { } },
    { SHARED_NUC: { } },
    { NUC: { } }
  ];
  
  const taxId = config.nit_emisor.padStart(12, '0');
  const url = `https://testnucgt.digifact.com/api/v2/transform/nuc_json?TAXID=${encodeURIComponent(taxId)}&USERNAME=${encodeURIComponent(digifactUsername)}&FORMAT=XML|PDF`;
  
  for (const payload of testPayloads) {
      console.log("Testing payload:", Object.keys(payload)[0]);
      const res = await fetch(url, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": token
          },
          body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log("Response:", data.message || data);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
