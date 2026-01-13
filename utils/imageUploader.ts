import { API_BASE_URL } from '../constants/config';
import { useAuthStore } from '../store/authStore';

export const uploadImage = async (uri: string): Promise<string> => {
  const token = useAuthStore.getState().token;

  if (!token) {
    throw new Error('User not authenticated');
  }

  const formData = new FormData();
  
  // React Native specific way to handle file uploads
  const filename = uri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename || '');
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('file', {
    uri,
    name: filename || 'image.jpg',
    type,
  } as any);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  const text = await response.text();
  
  let data;
  try {
      data = JSON.parse(text);
  } catch (e) {
      throw new Error(`Server Error: ${text.substring(0, 50)}`);
  }

  if (!response.ok) {
    throw new Error(data.message || 'Image upload failed');
  }

  return data.url;
};
