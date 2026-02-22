const API_BASE = import.meta.env.VITE_API_URL || '';

export async function getStoryBible() {
  const response = await fetch(`${API_BASE}/api/story_bible`);
  return await response.json() as {success: boolean, data?: any, message?: string};
}
  
export async function saveStoryBible(settings: any, characters: any[]) {
  const response = await fetch(`${API_BASE}/api/save_bible`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      settings: settings, 
      characters: characters 
    })
  });
  return response.json() ;
}

export async function getStory() {
  const response = await fetch(`${API_BASE}/api/text`);
  return await response.json() as {success: boolean, data?: any, message?: string};
}

export async function saveStoryText(title: any, body: any) {
  const response = await fetch(`${API_BASE}/api/save_text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title, body: body })
  });
  return await response.json() as {success: boolean, message: string, error?: string};
}
