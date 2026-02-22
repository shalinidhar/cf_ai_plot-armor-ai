-- schema.sql 
-- Used to initialize the SQLite database and populate with default values.

CREATE TABLE IF NOT EXISTS story_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        time_period TEXT,
        world_rules TEXT,
        plot_outline TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        ethnicity TEXT,
        personality TEXT,
        traits TEXT,
        relationships TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- INSERT INTO story_settings (id, time_period, world_rules, plot_outline)
-- VALUES (1, 'Unknown Period', 'No rules defined yet', 'Outline pending...');

-- INSERT INTO characters (id, name, ethnicity, personality, traits, relationships)
-- VALUES (1, 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown');

CREATE TABLE IF NOT EXISTS story_text (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        body TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO story_text (id, title, body)
VALUES (1, 'Battle of the Stars', 'This is definitely not based on Star Wars. Trust.');


