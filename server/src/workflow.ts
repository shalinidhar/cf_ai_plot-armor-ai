import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
// import {StoryParams} from '../client/src/lib/type';

interface StorySetting {
  timePeriod: string;
  worldRules: string;
  plotOutline: string;
}

interface StoryBible {
  setting: StorySetting;
  characters: any[]
}

interface StoryParams {
  draft: string;
  title: string;
  story_bible: StoryBible; 
}

export type Env = {
  plot_armor_db: D1Database;
  AI: Ai;
  STORY_WORKFLOW: Workflow;
};

export class StoryAnalyzerWorkflow extends WorkflowEntrypoint<Env, StoryParams> {
    //defining the run method for Cloudflare Workflow
  async run(event: WorkflowEvent<StoryParams>, step: WorkflowStep){
    const {draft, title, story_bible} = event.payload;
    // Using Llama 3.3
    const analysis = await step.do('analyze-continuity', async () => {
      const prompt = `
        You are a story continuity expert. Compare the following story draft 
        against these character facts: ${JSON.stringify(story_bible)}.
        Your tasks is to simply identy any continuity issues or plot holes in 
        the draft based on the character facts. Ignore minute details like typos, 
        grammar, or writing style. Focus only on major plot inconsistencies or 
        character contradictions.
        
        Draft: "${draft}"
        Title: "${title}"
      `;

      const result = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
        prompt: prompt, max_tokens: 500
      });
      console.log("Raw AI Output:", JSON.stringify(result));
      return (result as any).response|| "No analysis generated.";
    });

    // Recording the anaysis result. 
    await step.do('log-results', async () => {
      await this.env.plot_armor_db.prepare(
        "CREATE TABLE IF NOT EXISTS plot_hole_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, analysis TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
      )
      .run();
      await this.env.plot_armor_db.prepare(
        "INSERT INTO plot_hole_logs (analysis) VALUES (?)"
      ).bind(analysis).run();

      return { success: true};
    });
  }
}