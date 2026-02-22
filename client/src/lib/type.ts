export interface StorySetting {
  timePeriod: string;
  worldRules: string;
  plotOutline: string;
}

export interface StoryBible {
  setting: StorySetting;
  characters: any[]
}

export interface StoryParams {
  draft: string;
  title: string;
  story_bible: StoryBible; 
}