'use server';

import { ai_client } from '@/app/lib/vertex';
import { uploadImage } from '@/app/lib/cloudinary';

export interface GenerateOptions {
  userTopic: string;
  styleDescription: string;
  format: 'A4' | 'POST';
}

export async function generateImage({ 
  userTopic, 
  styleDescription, 
  format 
}: GenerateOptions): Promise<string | null> {
  
  try {
    let finalPrompt = '';
    let aspectRatio: "3:4" | "16:9" = "3:4"; 

    if (format === 'A4') {
      aspectRatio = "3:4";
      finalPrompt = `
        Generate a high-quality event poster background.
        THEME: ${userTopic}
        STYLE: ${styleDescription}
        NEGATIVE PROMPT: Do not include text, letters, logos. Keep center clean.
      `;
    } else {
      // SOCIAL POST (Background Only)
      aspectRatio = "16:9";
      finalPrompt = `
        Generate a high-quality background for a social media banner (16:9).
        THEME: ${userTopic}
        STYLE: ${styleDescription}
        NEGATIVE PROMPT: Do not include text, letters, logos. Keep center clean for text overlay.
      `;
    }

    console.log(`Generating ${format} Background...`);

    const response = await ai_client.models.generateImages({
      model: 'imagen-3.0-generate-001', 
      prompt: finalPrompt,
      config: { numberOfImages: 1, aspectRatio: aspectRatio }
    });

    const firstImage = response.generatedImages?.[0]?.image;
    if (!firstImage?.imageBytes) throw new Error("No image generated.");

    const base64Image = `data:image/png;base64,${firstImage.imageBytes}`;
    return await uploadImage(base64Image, "my-poster-app/vertex-generations");

  } catch (error: any) {
    console.error("Vertex AI Generation Failed:", error);
    return null;
  }
}
