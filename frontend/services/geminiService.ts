

import { GoogleGenAI, Modality } from "@google/genai";

async function callBackendForImage(
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<{ imageUrl: string; mimeType: string } | null> {
  try {
    const response = await fetch('http://localhost:3001/api/restore', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64ImageData,
        mimeType,
        prompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Backend request failed');
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error("Error calling backend for image restoration:", error);
    if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
             throw new Error(`QUOTA_EXCEEDED: You have exceeded your API quota. To prevent further errors, the process button will be disabled for 60 seconds.`);
        }
        throw new Error(`Backend Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the backend.");
  }
}

export function restorePhoto(
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<{ imageUrl: string; mimeType: string } | null> {
  return callBackendForImage(base64ImageData, mimeType, prompt);
}