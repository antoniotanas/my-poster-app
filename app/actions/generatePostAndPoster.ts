'use server';

import { ai_client } from '@/app/lib/vertex';
import { uploadImage } from '@/app/lib/cloudinary';
import { StyleTemplate } from '@/app/actions/analyzeStyle'; // Assumiamo tu esporti l'interfaccia da qui

// Estendiamo le opzioni per accettare l'intero oggetto di stile/layout
interface GenerateOptions {
  userTopic: string;
  styleDescription: string;
  format: 'A4' | 'POST';
  includeText: boolean;
  
  // Passiamo l'oggetto completo dei testi e del layout se disponibile
  textData?: {
    title: string;
    description?: string;
    location?: string;
    agenda?: string; // Passato come stringa unica con \n
  };
  
  // Opzionale: Passiamo hint sul layout per guidare Imagen
  layoutHints?: StyleTemplate['layout'];
}

export async function generateBackgroundWithStyle({ 
  userTopic, 
  styleDescription, 
  format, 
  includeText, 
  textData,
  layoutHints
}: GenerateOptions): Promise<string | null> {
  
  try {
    let finalPrompt = '';
    let aspectRatio: "3:4" | "16:9" = "3:4"; 

    // --- 1. A4 BACKGROUND (No Text) ---
    if (format === 'A4') {
      aspectRatio = "3:4";
      finalPrompt = `
        Generate a high-quality event poster background.
        THEME: ${userTopic}
        STYLE: ${styleDescription}
        NEGATIVE PROMPT: Do not include text, letters, logos, typography. Keep it clean for overlay.
      `;
    } 
    
    // --- 2. SOCIAL POST (Landscape) ---
    else {
      aspectRatio = "16:9";
      
      if (includeText && textData) {
        // Costruiamo istruzioni di layout basate su quello estratto (se c'è)
        let layoutInstruction = "Center the main title.";
        if (layoutHints) {
            // Esempio semplice di traduzione layout verticale -> orizzontale
            // Se il titolo era "top", nel landscape potrebbe essere "top" o "left".
            // Per semplicità, chiediamo una composizione bilanciata.
            layoutInstruction = `Place the title '${textData.title}' prominently.`;
            
            if (layoutHints.title.align === 'left') layoutInstruction += " Align text to the left.";
            if (layoutHints.title.align === 'right') layoutInstruction += " Align text to the right.";
        }

               // Get the first 2-3 non-empty lines from the agenda string
        const agendaHighlights = textData.agenda;
         /*?.split('\n')
          .filter(line => line.trim() !== '')
          .slice(0, 3)
          .join(' · '); // Join with a separator for the prompt
        */
        
        finalPrompt = `
          Generate a high-quality social media event banner. Horizontal 16:9.
          THEME: ${userTopic}
          STYLE: ${styleDescription}
          
          TEXT RENDERING TASK:
          You act as a professional graphic designer. Render the following text elements into the image composition.
          
          1. MAIN TITLE: "${textData.title}" (Large, readable font).
          ${textData.location ? `2. LOCATION: "${textData.location}" (Smaller, secondary).` : ''}
          ${textData.description ? `3. TAGLINE: "${textData.description}" (Subtle).` : ''}

          ${agendaHighlights ? `3. **Event Highlights (Smaller, if it fits design):** "${agendaHighlights}"` : ''}

          
          LAYOUT GUIDE: ${layoutInstruction}
          
          Ensure high contrast between text and background. No spelling errors.
        `;
      } else {
        // Social Background (No text)
        finalPrompt = `
          Generate a high-quality background for a social media post. Horizontal 16:9.
          THEME: ${userTopic}
          STYLE: ${styleDescription}
          NEGATIVE PROMPT: Do not include text, letters, logos.
        `;
      }
    }

    console.log(`Generating ${format} with Imagen 3 (Ratio: ${aspectRatio})...`);

    const response = await ai_client.models.generateImages({
      model: 'imagen-3.0-generate-001', 
      prompt: finalPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio
      }
    });

    const firstImage = response.generatedImages?.[0]?.image;
    
    if (!firstImage || !firstImage.imageBytes) {
       throw new Error("No image generated.");
    }

    const base64Image = `data:image/png;base64,${firstImage.imageBytes}`;

    console.log("Image found! Uploading to Cloudinary...");
    return await uploadImage(base64Image, "my-poster-app/vertex-generations");

  } catch (error: any) {
    console.error("Vertex AI Generation Failed:", error);
    return null;
  }
}
