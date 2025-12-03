'use server';

import { ai_client_new as ai_client } from '@/app/lib/vertex';

export interface StyleTemplate {
  styleDescription: string;
  overlayColor: string;
}

export type ExtractedStyle = StyleTemplate;

export async function analyzeStyle(imageBase64: string): Promise<StyleTemplate | null> {
  try {
    // Pulizia base64
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    // NUOVA SINTASSI UFFICIALE
    const response = await ai_client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: `Analyze this image and extract a detailed style description for generating a similar background.
Focus on: artistic style, color palette, lighting, texture, and mood.
Also suggest a semi-transparent overlay color (rgba) that would make white text readable on top of this background.
Return ONLY valid JSON with this structure:
{
  "styleDescription": "detailed description string...",
  "overlayColor": "rgba(0,0,0,0.5)"
}` },
            { 
              inlineData: { 
                mimeType: 'image/jpeg', 
                data: base64Data 
              } 
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    // Estrazione risposta
    const textResponse = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) throw new Error("No data");

    return JSON.parse(textResponse);

  } catch (error) {
    console.error("Analysis Failed:", error);
    return null;
  }
}
