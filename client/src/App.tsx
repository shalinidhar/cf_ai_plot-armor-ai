import { useState, useEffect} from 'react';
import { getStoryBible, saveStoryBible, getStory, saveStoryText } from './quieries'; 
import { startAnalysis, getLatestLog} from './actions';
// import { StorySetting } from './lib/types';
export interface StorySetting {
  timePeriod: string;
  worldRules: string;
  plotOutline: string;
}

export default function App() {
  const [status, setStatus] = useState('');
  const [storyText, setStoryText] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string, text: string }[]>([
    { role: 'ai', text: 'Hello! Paste a chapter on the left, and I will check it against your Story Bible.' }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [setting, setSetting] = useState<StorySetting>({ timePeriod: '', worldRules: '', plotOutline: '' });
  const [characters, setCharacters] = useState([
    { name: '', race: '', personality: '', traits: '', relationship: '' }
  ]);

  useEffect(() => {
    async function load() {
      setStoryText('test');
      const result2 = await getStory();
      if (result2.success && result2.data?.story) {
        setStoryText(result2.data.story.body || '');
        setStoryTitle(result2.data.story.title || '');
      }
      setStatus('Story loaded');

      const result = await getStoryBible();
      if (result.success && result.data) {
        // 1. Handle Settings (Single Object)
        if (result.data.settings) {
        setSetting({
          // If time_period is null/undefined, it becomes ''
          timePeriod: String(result.data.settings.time_period ?? ''), 
          worldRules: String(result.data.settings.world_rules ?? ''),
          plotOutline: String(result.data.settings.plot_outline ?? '')
        });
        }

        // 2. Handle Characters (Array)
        if (result.data.characters && result.data.characters.length > 0) {
          // Map the SQL columns to your React state keys
          const formattedCharacters = result.data.characters.map((char: any) => ({
            name: char.name || '',
            race: char.ethnicity || '', // Mapping SQL 'ethnicity' to React 'race'
            personality: char.personality || '',
            traits: char.traits || '',
            relationship: char.relationships || '' // Mapping SQL 'relationships' to React 'relationship'
          }));
          
          setCharacters(formattedCharacters);
        }
      }
    }

    load();

  }, []);

  const addCharacter = () => {
    setCharacters([...characters, { name: '', race: '', personality: '', traits: '', relationship: '' }]);
  };

  const updateCharacter = (index: number, field: string, value: string) => {
    const newChars = [...characters];
    (newChars[index] as any)[field] = value;
    setCharacters(newChars);
  };

const handleSaveBible = async () => {
  setStatus('Saving Story Bible...');
  console.log("Saving Story Bible:", { setting, characters });
  const result = await saveStoryBible(setting, characters);
  if (result.success) {
    setStatus('Saved Story Bible!');
  } else {
    setStatus('Error saving Story Bible... Try Again');
  }
  setIsModalOpen(false);
};

const handleSaveStory = async () => {
  setStatus('Saving Story...');
  console.log("Saving Story Text:", { storyTitle, storyText });
	const result = await saveStoryText(storyTitle, storyText);
	if (result.success) {
		setStatus('Story saved');
	} else {
		setStatus('Error saving Story... Try Again');
	}
};

const handleAnalysis = async () => {
	setChatMessages(prev => [...prev, { role: 'assistant', text: "🛡️ Plot Armor is analyzing your story..." }]);

	const result = await startAnalysis(storyText, storyTitle, {setting, characters});
	
	if (!result.success) {
		setChatMessages(prev => [...prev, { role: 'assistant', text: "❌ System error: Unable to start analysis. Try again" }]);
		return;
	}
	// 3. Polling for the result
	// We'll check the database (plot_hole_logs) or workflow status every 2 seconds
	const pollTimer = setInterval(async () => {
		// You'll need a 'getLatestLog' server action to check the DB
		const poll_result = await getLatestLog(); 
		if (poll_result.success && poll_result.analysis) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: poll_result.analysis }]);
      clearInterval(pollTimer);
		}
	}, 2000);

};

  return (
    <main className="min-h-screen bg-slate-50 p-6 font-sans">
      <header className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-800">Plot Armor AI 🛡️</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{status}</span>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm hover:bg-slate-700 transition"
          >
            Configure Story Bible
          </button>
        </div>
      </header>

	  {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Configure Your Story Bible</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {/* SECTION 1: SETTING */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col">
                <label className="text-sm font-bold mb-1">Time Period</label>
                <input 
                  className="border p-2 rounded" 
                  value={setting.timePeriod}
                  onChange={(e) => setSetting({...setting, timePeriod: e.target.value})}
                />
              </div>
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-bold mb-1">World Rules</label>
                <input 
                  className="border p-2 rounded" 
                  value={setting.worldRules}
                  onChange={(e) => setSetting({...setting, worldRules: e.target.value})}
                />
              </div>
              <div className="flex flex-col md:col-span-3">
                <label className="text-sm font-bold mb-1">Plot Outline</label>
                <textarea 
                  className="border p-2 rounded h-20" 
                  value={setting.plotOutline}
                  onChange={(e) => setSetting({...setting, plotOutline: e.target.value})}
                />
              </div>
            </div>

            {/* SECTION 2: CHARACTERS */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Characters</h3>
                <button 
                  onClick={addCharacter}
                  className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold hover:bg-blue-200"
                >
                  + Add Character
                </button>
              </div>

              {characters.map((char, index) => (
                <div key={index} className="p-4 border border-slate-100 bg-slate-50 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Header with Remove Button */}
				{/* <div className="flex justify-between items-center mb-4">
					<span className="text-xs font-bold uppercase text-slate-400">Character #{index + 1}</span>
					<button 
					onClick={() => removeCharacter(index)}
					className="text-xs text-red-500 hover:text-red-700 font-medium"
					>
					Remove
					</button>
				</div> */}
				{/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
				<div className="flex flex-col">
				<label className="text-sm font-bold mb-1">Name</label>
                  <input value={char.name} className="border p-2 rounded bg-white" onChange={(e) => updateCharacter(index, 'name', e.target.value)} />
				  </div>
				  <div className="flex flex-col">
				  <label className="text-sm font-bold mb-1">Ethnicity</label>
                  <input value={char.race} className="border p-2 rounded bg-white" onChange={(e) => updateCharacter(index, 'race', e.target.value)} />
				  </div>
				  <div className="flex flex-col">
				  <label className="text-sm font-bold mb-1">Personality</label>
                  <input value={char.personality} className="border p-2 rounded bg-white" onChange={(e) => updateCharacter(index, 'personality', e.target.value)} />
				  </div>
				  <div className="flex flex-col">
				  <label className="text-sm font-bold mb-1">Other Traits</label>
                  <input value={char.traits} className="border p-2 rounded bg-white" onChange={(e) => updateCharacter(index, 'traits', e.target.value)} />
				  </div>
				  <div className="flex flex-col md:col-span-2">
				  <label className="text-sm font-bold mb-1">Relationships</label>
                  <textarea
                    value={char.relationship}
                    className="border p-2 rounded bg-white md:col-span-2 h-16" 
                    onChange={(e) => updateCharacter(index, 'relationship', e.target.value)}
                  />
				  </div>
                </div>
				// </div>
              ))}
            </div>

            <button 
              onClick={handleSaveBible}
              className="mt-8 w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-160px)]">
        
        {/* Left Side: Text Input */}
        <section className="flex flex-col bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-slate-700">Input: Chapter Content</h2>
          <textarea 
            value={storyText}
            onChange={(e) => setStoryText(e.target.value)}
            className="flex-grow w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none outline-none"
            placeholder="Once upon a time in the Nebula..."
          />
          <button 
            onClick={async () => {
            await handleSaveStory();
            await handleAnalysis();
          }}
            className="mt-4 w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 shadow-md transition"
          >
            Save and Run Continuity Check
          </button>
        </section>

        {/* Right Side: Chatbot Space */}
        <section className="flex flex-col bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <h2 className="text-lg font-semibold mb-4 text-slate-700">Output: Analysis Logs</h2>
          
          <div className="flex-grow overflow-y-auto space-y-4 pr-2">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-slate-100 text-slate-800 rounded-bl-none'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t text-xs text-slate-400 italic">
            Powered by Llama 3.3 & Cloudflare Workflows
          </div>
        </section>
      </div>
    </main>
  );
}