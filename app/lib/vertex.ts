// app/lib/vertex.ts
import { VertexAI } from '@google-cloud/vertexai'; // VECCHIO SDK (Per Analisi Gemini)
import { GoogleGenAI } from "@google/genai";       // NUOVO SDK (Per Generazione Imagen)
import fs from 'fs';
import path from 'path';
import os from 'os';

// --- SETUP COMUNE ---
const project = process.env.GOOGLE_PROJECT_ID;
const location = process.env.GOOGLE_LOCATION || 'us-central1';

if (!process.env.GOOGLE_CREDENTIALS_BASE64) {
  throw new Error("GOOGLE_CREDENTIALS_BASE64 is missing");
}

// Decodifica Credenziali
const credentialsString = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8');
const credentialsJson = JSON.parse(credentialsString);

// --- CLIENT 1: VECCHIO & AFFIDABILE (Per Chat/Analisi) ---
// Questo non ha mai fallito l'analisi JSON
export const vertex_old = new VertexAI({
  project,
  location,
  googleAuthOptions: { credentials: credentialsJson }
});

// --- CLIENT 2: NUOVO (Per Imagen 3) ---
// Scriviamo il file temp per farlo felice
const tempFilePath = path.join(os.tmpdir(), 'google-credentials-gen.json');
try {
    fs.writeFileSync(tempFilePath, credentialsString);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tempFilePath;
} catch (e) {
    console.error("Failed to write temp creds:", e);
}

export const ai_client = new GoogleGenAI({
  vertexai: true,
  project,
  location,
});
