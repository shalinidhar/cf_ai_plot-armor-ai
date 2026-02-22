// import { StoryBible } from './lib/type';
interface StorySetting {
  timePeriod: string;
  worldRules: string;
  plotOutline: string;
}

interface StoryBible {
  setting: StorySetting;
  characters: any[]
}

const API_BASE = import.meta.env.VITE_API_URL || '';

//Triggering the Workflow and retrieving the response

export async function startAnalysis(draftText: string, draftTitle: string, bible: StoryBible) {
  const response = await fetch(`${API_BASE}/workflow/start_analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ draft: draftText, title: draftTitle, story_bible: bible })
  });
  return await response.json() as {success: boolean, instanceId?: string, error?: string};
}


export async function getLatestLog() {
  const response = await fetch(`${API_BASE}/workflow/latest_log`);
  return await response.json() as {success: boolean, analysis?: any, message?: string};
}