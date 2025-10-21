// frontend/src/services/apiService.ts

interface RestoreResult {
  imageUrl: string;
  mimeType: string;
}

// Правильный URL вашего бэкенда с верным портом и путем
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const BACKEND_API_URL = `${API_BASE_URL}/api/restore`;

export const restorePhoto = async (
  base64Data: string, 
  mimeType: string, 
  prompt: string
): Promise<RestoreResult> => {
  
  const response = await fetch(BACKEND_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // Отправляем ключ 'image', который теперь ожидает наш бэкенд
    body: JSON.stringify({
      image: base64Data,
      mimeType: mimeType,
      prompt: prompt,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'An error occurred on the server.');
  }

  const result: RestoreResult = await response.json();
  return result;
};