'use server';

import { ai_client } from '@/app/lib/vertex'; // Nota: importiamo ai_client ora
import { uploadImage } from '@/app/lib/cloudinary';

interface GenerateParams {
  userTopic: string;
  styleDescription: string;
}

export async function generateBackgroundWithStyle(params: GenerateParams): Promise<string | null> {
  try {
    const finalPrompt = `
      Generate a high-quality event poster background.
      THEME: ${params.userTopic}
      STYLE: ${params.styleDescription}
      NEGATIVE PROMPT: Do not include text, letters, logos, typography. Keep it clean.
    `;

   console.log("Generating with Imagen 3 (New SDK)...");

    const response = await ai_client.models.generateImages({
      model: 'imagen-3.0-generate-001', 
      prompt: finalPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "3:4"
      }
    });

    //console.log("FULL VERTEX RESPONSE:", JSON.stringify(response, null, 2));

    // 1. Prendi la prima immagine
    const firstImage = response.generatedImages?.[0]?.image;
    
    // 2. Controlla se esiste imageBytes (che è il base64 grezzo)
    if (!firstImage || !firstImage.imageBytes) {
       throw new Error("No image generated (empty imageBytes).");
    }

    // 3. Costruisci il Data URL
    // imageBytes arriva già come stringa base64 pulita, basta prefissarla
    const base64Image = `data:image/png;base64,${firstImage.imageBytes}`;

    console.log("Image found! Uploading to Cloudinary...");
    return await uploadImage(base64Image, "my-poster-app/vertex-generations");

  } catch (error: any) {
    console.error("Vertex AI Generation Failed:", error);
    return null;
  }
}
