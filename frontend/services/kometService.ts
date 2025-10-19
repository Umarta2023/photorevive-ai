// Note: This service is based on assumptions about the Komet API.
// You may need to adjust the endpoint URL, request body, and response parsing
// based on the actual Komet API documentation.

const KOMET_API_KEY = import.meta.env.VITE_KOMET_API_KEY;
// Switched to the chat completions endpoint as it's more likely for multimodal models
const KOMET_API_ENDPOINT = 'https://api.cometapi.com/v1/chat/completions';

if (!KOMET_API_KEY) {
  throw new Error("VITE_KOMET_API_KEY environment variable not set");
}

/**
 * Calls the Komet API (emulating OpenAI's chat completions) to restore or modify an image.
 * @param base64ImageData The base64 encoded image data.
 * @param mimeType The MIME type of the image.
 * @param prompt The instruction for the AI.
 * @returns A promise that resolves to the new image URL and MIME type.
 */
export async function restorePhoto(
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<{ imageUrl: string; mimeType: string } | null> {
  
  try {
    // This request body now mimics the OpenAI Vision API format.
    const requestBody = {
      model: 'gemini-2.5-flash-image',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64ImageData}`,
              },
            },
          ],
        },
      ],
      // It's possible the API expects a max_tokens parameter
      // max_tokens: 1024, 
    };

    const response = await fetch(KOMET_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KOMET_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      // Try to find a more specific error message from the API response
      const errorMessage = errorData?.error?.message || errorData.message || 'Unknown error';
      throw new Error(`Komet API Error: ${errorMessage}`);
    }

    const responseData = await response.json();

    // ASSUMPTION: The API returns a response similar to OpenAI's chat completions.
    // The image URL might be in the content of the first choice.
    const messageContent = responseData.choices?.[0]?.message?.content;
    
    if (typeof messageContent === 'string') {
        // The content might be a markdown image tag like ![result](data:image/png;base64,...)
        const imageUrlMatch = messageContent.match(/!\[.*?\]\((.*?)\)/);
        if (imageUrlMatch && imageUrlMatch[1]) {
            const imageUrl = imageUrlMatch[1];
            const mimeTypeMatch = imageUrl.match(/^data:(image\/\w+);base64,/);
            return {
                imageUrl: imageUrl,
                mimeType: mimeTypeMatch ? mimeTypeMatch[1] : 'image/png',
            };
        }
    }

    throw new Error("The Komet API did not return a valid image in the expected format.");

  } catch (error) {
    console.error("Error calling Komet API:", error);
    if (error instanceof Error) {
      // Re-throw the error to be caught by the calling function in App.tsx
      throw error;
    }
    throw new Error("An unknown error occurred while communicating with the Komet API.");
  }
}
