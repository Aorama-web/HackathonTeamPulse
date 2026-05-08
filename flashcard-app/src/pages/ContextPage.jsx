import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ContextPage.css';

function ContextPage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic first.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          topic: topic,
          context: text
        }),
      });

      if (!response.ok) throw new Error('Failed to generate cards');

      const data = await response.json();
      navigate('/flashcards', { state: { cards: data.flashcards, difficulty } });

    } catch (err) {
      setError('Connection error: Make sure your FastAPI server is running on port 8000.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="context-page">
      <button className="back-link" onClick={() => navigate('/')}>← Back</button>

      <h1>AI Architect</h1>

      <form className="form-card" onSubmit={(e) => { e.preventDefault(); handleGenerate(); }}>
        <div className="form-group">
          <label htmlFor="topic">Study Topic</label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Computer Networks"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              background: '#1a1a1a',
              color: 'white',
              border: '1px solid #333',
              marginBottom: '15px'
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="study-material">Study Material (Optional)</label>
          <textarea
            id="study-material"
            value={text}
            onChange={(e) => { setText(e.target.value); setError(''); }}
            placeholder="Paste your notes here..."
          />
          {error && <p className="form-error">{error}</p>}
        </div>

        <div className="form-row">
          <div className="form-group" style={{ width: '100%' }}>
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button
            className={`generate-btn${loading ? ' loading' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Generating 10 cards...' : 'Generate 10 Flashcards'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ContextPage;