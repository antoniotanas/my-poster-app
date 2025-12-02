// app/actions/generateImage.ts
'use server';

// --- 2. YOUR GOOGLE / NANO BANANA LOGIC (INTEGRATED) ---
async function generatePosterWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.NANO_BANANA_API_KEY;

  if (!apiKey) {
    console.warn("API Key mancante. Avvio fallback immediato a Pollinations.");
    return triggerFallback(prompt);
  }

  // Dimensioni A4 (at 96 DPI) per Imagen
  const width = 794;
  const height = 1123;
  // Try the newer model if available, otherwise stick to 3.0
  const model = "imagen-4.0-generate-001";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;

  const requestBody = {
    instances: [{ prompt: prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: "3:4",
    },
  };

  console.log(`Calling Google API (${model})... Endpoint: ${url.substring(0, 50)}...`);

  try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Imagen API Error (${response.status}):`, errorText);

        if (response.status === 400 || response.status === 403 || response.status === 429) {
          console.warn("Google API issue detected (Billing/Quota/BadRequest). Falling back to Pollinations.");
          return triggerFallback(prompt);
        }
        throw new Error(`Google API Error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      // Estrazione Immagine
      if (data.predictions && data.predictions[0]) {
        const prediction = data.predictions[0];

        // --- NEW LOGGING HERE ---
        if (prediction.bytesBase64Encoded) {
          const rawBase64 = prediction.bytesBase64Encoded;
          console.log(`[Server] 1. Received raw Base64 Buffer representation from Google. Length: ${rawBase64.length} characters.`);

          const finalDataUrl = `data:image/png;base64,${rawBase64}`;
          console.log(`[Server] 2. Converted to Data URL string. Starts with: ${finalDataUrl.substring(0, 50)}...`);
          return finalDataUrl;
        }
        // Handle slightly different response structure
        if (prediction.image && prediction.image.bytesBase64Encoded) {
             const rawBase64 = prediction.image.bytesBase64Encoded;
             const mimeType = prediction.mimeType || 'image/png';
             console.log(`[Server] 1. Received raw Base64 Buffer representation from Google (struct format). Length: ${rawBase64.length} characters.`);

             const finalDataUrl = `data:${mimeType};base64,${rawBase64}`;
             console.log(`[Server] 2. Converted to Data URL string. Starts with: ${finalDataUrl.substring(0, 50)}...`);
             return finalDataUrl;
        }
      }

      console.error("Unexpected Google API response structure:", JSON.stringify(data).substring(0, 200));
      throw new Error("Formato risposta Imagen non riconosciuto");

  } catch (e: any) {
       console.error("Exception calling Google API:", e.message);
       console.warn("Exception caught. Falling back to Pollinations.");
       return triggerFallback(prompt);
  }
}

function triggerFallback(prompt: string): string {
    const width = 794;
    const height = 1123;
    const encodedPrompt = encodeURIComponent(prompt.substring(0, 250));
    const seed = Math.floor(Math.random() * 1000000);
    // Added 'enhance=true' for better colors from fallback
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&model=flux&enhance=true&seed=${seed}`;
    console.log(`[Server] Fallback URL generated: ${fallbackUrl.substring(0, 60)}...`);
    return fallbackUrl;
}


// --- MAIN SERVER ACTION ---

interface GenerateImageParams {
  title: string;
  description: string;
}

export async function generateBackground(params: GenerateImageParams): Promise<{ url: string | null, error?: string }> {
  const { title, description } = params;

  // 1. PROMPT ENGINEERING
  // We craft a specific prompt to guide the AI towards a poster background.
  // Crucial: We ask for dark/muted tones so white overlaid text is readable.
  const optimizedPrompt = `A professional, abstract event poster background for an event.
  Theme based on description: "${description}".
  Style guidelines: Ethereal, deep colors, flowing abstract shapes, futuristic textures.
  CRITICAL: The image must be dark, moody, and muted. No bright white spots. 
  It must serve as a background for white text to be perfectly readable on top. 
  No existing description, text, letters, or logos in the image.`;

  console.log("Starting generation process for prompt:", optimizedPrompt.substring(0, 100) + "...");

  try {
    const imageUrl = await generatePosterWithGemini(optimizedPrompt);
    // Log the final result before sending to client
    console.log(`[Server] Action successful. Returning URL length: ${imageUrl.length}`);
    return { url: imageUrl };
  } catch (e: any) {
    console.error("Fatal error in generateBackground:", e);
    return {
      url: null,
      error: e.message || "Failed to generate image."
    };
  }
}

export async function generateForeground(params: GenerateImageParams): Promise<{ url: string | null, error?: string }> {
  const { title, description } = params;

  // 1. PROMPT ENGINEERING
  // We craft a specific prompt to guide the AI towards a poster background.
  // Crucial: We ask for dark/muted tones so white overlaid text is readable.
  const optimizedPrompt = `A professional, abstract event poster background for an event titled "${title}".
  Theme based on description: "${description}".
  Style guidelines: Ethereal, deep colors, flowing abstract shapes, futuristic textures.
  CRITICAL: The image must be dark, moody, and muted. No bright white spots. It must serve as a background for white text to be perfectly readable on top. No existing text, letters, or logos in the image.`;

  console.log("Starting generation process for prompt:", optimizedPrompt.substring(0, 100) + "...");

  try {
    const imageUrl = await generatePosterWithGemini(optimizedPrompt);
    // Log the final result before sending to client
    console.log(`[Server] Action successful. Returning URL length: ${imageUrl.length}`);
    return { url: imageUrl };
  } catch (e: any) {
    console.error("Fatal error in generateBackground:", e);
    return {
      url: null,
      error: e.message || "Failed to generate image."
    };
  }
}