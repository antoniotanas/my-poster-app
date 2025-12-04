// app/actions/analyzeStyle.ts
'use server';

// Assicuriamoci di importare il client corretto (quello NUOVO che stai usando)
// Se nel tuo file si chiama ai_client o ai_client, usa quello.
import { ai_client } from '@/app/lib/vertex';

export interface LayoutElement {
  position: 'top' | 'center' | 'bottom';
  align: 'left' | 'center' | 'right';
  color: string;
}

export interface ExtractedTexts {
  title: string;
  description: string;
  location: string;
  agenda: string[]; // lista di righe/voce agenda
}

export interface StyleTemplate {
  styleDescription: string;
  suggestedOverlayColor: string;
  layout: {
    title: LayoutElement;
    description: LayoutElement;
    location: LayoutElement; // <--- NUOVO
    agenda: LayoutElement;
  };
  texts: ExtractedTexts; // NEW
}

export async function analyzeStyle(imageBase64: string): Promise<StyleTemplate | null> {
  try {
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    // --- TUA SINTASSI CORRETTA CON IL NUOVO SDK ---
    const response = await ai_client.models.generateContent({
      model: 'gemini-2.5-flash', // O il modello che stai usando e funziona
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are an expert graphic designer and OCR assistant.

Given this EVENT POSTER image:

1) STYLE
- Describe background artistic style, color palette, lighting, texture, mood.
- Focus ONLY on background, ignore logos and text content.
- This will be used as a prompt for a new background.

2) LAYOUT
- Estimate where the main text blocks are:
  - Title
  - Description / subtitle
  - Location
  - Agenda / list
- For each block, estimate vertical position (top|center|bottom) and horizontal alignment (left|center|right).
- Also estimate the MAIN text color used for that block as a hex.

3) TEXTS
- Try to read and extract the main visible texts:
  - "title": main prominent title of the event
  - "description": short subtitle or tagline
  - "location": place/address where the event happens (if present). Empty string if not clearly present.
  - "agenda": list of bullet points or schedule items (as an array of strings)

Return ONLY valid JSON with this EXACT structure:

{
  "styleDescription": "detailed prompt for background generation...",
  "suggestedOverlayColor": "rgba(0,0,0,0.5)",
  "layout": {
    "title": { "position": "top|center|bottom", "align": "left|center|right", "color": "#hex" },
    "description": { "position": "top|center|bottom", "align": "left|center|right", "color": "#hex" },
    "location": { "position": "top|center|bottom", "align": "left|center|right", "color": "#hex" }
    "agenda": { "position": "top|center|bottom", "align": "left|center|right", "color": "#hex" }
  },
  "texts": {
    "title": "string",
    "description": "string",
    "location": "string"
    "agenda": ["item 1", "item 2", "..."],
  }
}`
            },
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
        responseMimeType: "application/json" // Questa feature è fantastica, tienila!
      }
    });

    // Ecco il modo universale che piace a TypeScript:
    let jsonString = "";

    // Verifica se esiste candidates
    if (response.candidates && response.candidates.length > 0) {
      // Accedi al primo candidato -> primo content -> prima part -> text
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        jsonString = candidate.content.parts[0].text || "";
      }
    }

    // Fallback se la libreria usa una struttura diversa (a volte response.text è una stringa diretta nel nuovo SDK beta)
    if (!jsonString && typeof response.text === 'string') {
      jsonString = response.text;
    } else if (!jsonString && typeof response.text === 'function') {
      // @ts-ignore: Se a runtime è una funzione ma i tipi sono sbagliati
      jsonString = response.text();
    }

    if (!jsonString) throw new Error("Empty response from Gemini");

    console.log("Analysis Result Raw:", jsonString);
    const cleanJson = jsonString.replace(/``````/g, '').trim();

    const rawData = JSON.parse(cleanJson);

    // Helper per pulire un elemento layout
    const sanitizeElement = (el: any, defaultPos: string) => ({
      position: el?.position || defaultPos, // Se è null, usa default
      align: el?.align || 'center',
      color: el?.color || '#FFFFFF'
    });

    // Ricostruisci l'oggetto pulito
    const sanitizedData: StyleTemplate = {
      styleDescription: rawData.styleDescription || "",
      suggestedOverlayColor: rawData.suggestedOverlayColor || "rgba(0,0,0,0.5)",
      texts: rawData.texts || { title: "", description: "", location: "", agenda: [] },
      layout: {
        title: sanitizeElement(rawData.layout?.title, 'top'),
        description: sanitizeElement(rawData.layout?.description, 'top'),
        location: sanitizeElement(rawData.layout?.location, 'bottom'),
        agenda: sanitizeElement(rawData.layout?.agenda, 'center')
      }
    };
    return sanitizedData;
  } catch (error) {
    console.error("Analysis Failed:", error);
    return null;
  }
}
