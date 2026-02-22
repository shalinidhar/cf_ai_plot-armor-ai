import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
//import { StoryAnalyzerWorkflow } from '../../server/workflow'

type Bindings = {
  plot_armor_db: D1Database
  STORY_WORKFLOW: Workflow
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => {
  return c.html(
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Plot Armor AI</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/client.tsx"></script>
    </body>
  </html>
  )
})

app.get('/story_bible', async (c) => {
  const db = c.env.plot_armor_db;
  try {
    const settings = await db.prepare("SELECT * FROM story_settings").first();
    const { results: characters } = await db.prepare("SELECT * FROM characters ORDER BY created_at").all();
    
    return c.json({
      success: true,
      data: { settings, characters },
      message: "Story Bible retrieved successfully."
    });
  } catch (error) {
    return c.json({ success: false, message: "Failed to load Story Bible" }, 500);
  }
})

// 2. Story Text Endpoint
app.get('/text', async (c) => {
  const db = c.env.plot_armor_db;
  try {
    const story = await db.prepare("SELECT * FROM story_text ORDER BY created_at DESC").first();
    return c.json({
      success: true,
      data: { story },
      message: "Story retrieved successfully."
    });
  } catch (error) {
    return c.json({ success: false, message: "Failed to load Story" }, 500);
  }
})

app.post('/save_bible', async (c) => {
  const db = c.env.plot_armor_db;
  try {
    const { settings, characters } = await c.req.json();

    const story_set = db.prepare(`
      UPDATE story_settings SET time_period = ?, world_rules = ?, plot_outline = ?
      WHERE id = 1
    `).bind(settings.timePeriod, settings.worldRules, settings.plotOutline);

    const char_del = db.prepare(`DELETE FROM characters`);

    const insertCharStmts = characters.map((char: any) => 
      db.prepare(`
        INSERT INTO characters (name, ethnicity, personality, traits, relationships)
        VALUES (?, ?, ?, ?, ?)
      `).bind(char.name, char.race, char.personality, char.traits, char.relationship)
    );

    await db.batch([
      story_set,
      char_del,
      ...insertCharStmts
    ]);

    return c.json({ success: true, message: "Story Bible saved to D1" });
  } catch (error: any) {
    console.error(error);
    return c.json({ success: false, message: "Failed to save to database.", error: error.message }, 500);
  }
})

app.post('/save_text', async (c) => {
  const db = c.env.plot_armor_db;
  try {
    const { title, body } = await c.req.json();
    await db.prepare(`
      INSERT INTO story_text (title, body)
      VALUES (?, ?)
    `).bind(title, body).run();
    return c.json({ success: true, message: "Story Text saved to D1" });
  } catch (error: any) {
    console.error(error);
    return c.json({ success: false, message: "Failed to save to database.", error: error.message }, 500);
  }
})

// app.post('/start_analysis', async (c) => {
//   const { draft, title, story_bible } = await c.req.json();
//   try {
//     const instance = await c.env.STORY_WORKFLOW.create({
//       params: { draft: draft, title: title, story_bible: story_bible }
//     });
//     return c.json({ success: true, instanceId: instance.id });
//   } catch (error) {
//     console.error("Workflow trigger failed:", error);
//     return c.json({ success: false, error: "Could not start analysis." }, 500);
//   }
// })

// app.get('/latest_log', async (c) => {
//   const db = c.env.plot_armor_db;  
//   try {
//     const latest = await db.prepare("SELECT analysis FROM plot_hole_logs ORDER BY id DESC LIMIT 1").first();
//     return c.json(latest ? { success: true, analysis: latest.analysis } : { found: false });
//   } catch (error) {
//     console.error("Failed to retrieve latest log:", error);
//     return c.json({ success: false, message: "Could not retrieve latest log." }, 500);
//   }     
// })

// export const onRequest = (context: any) => app.fetch(context.request, context.env, context)

export default app
export { StoryAnalyzerWorkflow } from './workflow';
