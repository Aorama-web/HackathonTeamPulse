import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ContextPage.css';

/*
 * Words that don't make informative flashcard keywords.
 * Filtered out when extracting key terms from the user's text.
 */
const STOP_WORDS = new Set([
  'about', 'above', 'after', 'again', 'against', 'also', 'among', 'being',
  'both', 'during', 'each', 'from', 'have', 'into', 'more', 'most', 'other',
  'some', 'such', 'than', 'that', 'their', 'them', 'then', 'there', 'these',
  'they', 'this', 'those', 'through', 'under', 'until', 'what', 'when',
  'where', 'which', 'while', 'will', 'with', 'would', 'could', 'should',
]);

/*
 * Demo flashcards about learning science, used as fallback when
 * the pasted text is too short to extract meaningful cards from.
 */
const FALLBACK_CARDS = [
  { question: 'What is spaced repetition?',      answer: 'A learning technique that reviews information at gradually increasing intervals to improve long-term retention.' },
  { question: 'What is active recall?',           answer: 'Actively stimulating memory during the learning process rather than passively re-reading material.' },
  { question: 'What is the forgetting curve?',    answer: "Hermann Ebbinghaus's hypothesis showing that memory decays exponentially over time without review." },
  { question: 'What is the Feynman Technique?',   answer: 'Explain a concept in simple terms as if teaching a beginner, then identify and fill any gaps in your understanding.' },
  { question: 'What is interleaving?',            answer: 'Mixing different topics during a study session to improve long-term retention and flexible application of knowledge.' },
  { question: 'What is the testing effect?',      answer: 'Practice tests improve memory retention more than passive restudy of the same material.' },
  { question: 'What is chunking?',               answer: 'Grouping individual pieces of information into larger meaningful units to overcome working memory limits.' },
  { question: 'What is metacognition?',           answer: 'Awareness and regulation of your own thinking processes, allowing you to monitor and adjust learning strategies.' },
  { question: 'What is elaborative interrogation?', answer: "Asking 'why' and 'how' questions about facts to deepen understanding and improve memorization." },
  { question: 'What is the dual coding theory?',  answer: 'Memory is enhanced when information is encoded both verbally and visually, creating two separate mental representations.' },
];

/* Picks a meaningful content word from a sentence to serve as the flashcard key term. */
function pickKeyWord(sentence) {
  const words = sentence
    .split(/\s+/)
    .map((w) => w.replace(/[.,!?;:'"()[\]]/g, ''))
    .filter((w) => w.length > 4 && !STOP_WORDS.has(w.toLowerCase()) && /^[a-zA-Z]/.test(w));

  if (!words.length) return null;
  // Words in the second half of a sentence tend to be more content-rich
  return words[Math.floor(words.length * 0.55)];
}

/* Converts raw text into an array of flashcard objects based on difficulty level. */
function generateCards(text, numCards, difficulty) {
  const sentences = text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40 && s.length < 400);

  const cards = [];

  for (let i = 0; i < sentences.length && cards.length < numCards; i++) {
    const sentence = sentences[i];
    const keyWord = pickKeyWord(sentence);
    if (!keyWord) continue;

    if (difficulty === 'easy') {
      cards.push({
        id: cards.length + 1,
        question: `Complete the sentence:\n"${sentence.replace(keyWord, '______')}"`,
        answer: keyWord.charAt(0).toUpperCase() + keyWord.slice(1),
      });
    } else if (difficulty === 'medium') {
      cards.push({
        id: cards.length + 1,
        question: `What does the text say about "${keyWord}"?`,
        answer: sentence,
      });
    } else {
      cards.push({
        id: cards.length + 1,
        question: `Explain the concept of "${keyWord}" in your own words.`,
        answer: `Reference: ${sentence}`,
      });
    }
  }

  // Pad with fallback cards if the text didn't yield enough sentences
  while (cards.length < numCards) {
    const fb = FALLBACK_CARDS[cards.length % FALLBACK_CARDS.length];
    cards.push({ id: cards.length + 1, ...fb });
  }

  return cards;
}

/* Returns the number of whitespace-delimited words in a string. */
function countWords(str) {
  return str.trim() ? str.trim().split(/\s+/).length : 0;
}

function ContextPage() {
  const navigate = useNavigate();

  // ── Form state ─────────────────────────────────────────────────────
  const [text, setText] = useState('');
  const [numCards, setNumCards] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');

  // ── UI state ───────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Derived values — avoids redundant state
  const wordCount = countWords(text);
  const charCount = text.length;
  const hasText = text.trim().length > 0;

  /* Primary: validate input, simulate API call, then navigate to /flashcards */
  const handleGenerate = () => {
    if (!hasText) {
      setError('Please paste some study material first.');
      return;
    }
    setError('');
    setLoading(true);

    // Simulates network latency. Replace with:
    //   fetch('/api/generate', { method: 'POST', body: JSON.stringify({ text, numCards, difficulty }) })
    setTimeout(() => {
      const cards = generateCards(text, numCards, difficulty);
      navigate('/flashcards', { state: { cards, difficulty } });
    }, 1600);
  };

  /* Secondary: skip context entry and proceed directly to a demo deck */
  const handleSkip = () => {
    console.log('Skipping context step');
    // TODO: navigate('/flashcards', { state: { cards: FALLBACK_CARDS.slice(0, numCards) } });
  };

  /* Tertiary: request inline study hints from the backend based on current input */
  const handleGenerateHints = () => {
    // TODO: POST { text, numCards, difficulty } to /api/hints and render result below the form
    console.log('HINTS_REQUEST', { text, numCards, difficulty });
  };

  return (
    <div className="context-page">
      {/* Back navigation ── aria-label clarifies the destination for screen readers */}
      <button
        className="back-link"
        type="button"
        onClick={() => navigate('/')}
        aria-label="Go back to home page"
      >
        ← Back
      </button>

      <h1>Context</h1>

      {/*
        Using <form> instead of <div> gives us:
          - Enter-key submission from single-line inputs (e.g. numCards)
          - Correct form semantics for assistive technologies
          - noValidate prevents browser native popups so we own the error UI
      */}
      <form
        className="form-card"
        onSubmit={(e) => { e.preventDefault(); handleGenerate(); }}
        noValidate
        aria-label="Flashcard generation settings"
      >

        {/* ── Study material ─────────────────────────────────────── */}
        <div className="form-group">
          <label htmlFor="study-material">Study Material</label>
          <textarea
            id="study-material"
            value={text}
            onChange={(e) => { setText(e.target.value); setError(''); }}
            placeholder="Paste your notes, lecture slides, textbook excerpts, or any study material here. The more context you provide, the better your flashcards will be."
            aria-describedby={error ? 'text-error' : undefined}
            aria-invalid={error ? 'true' : 'false'}
            aria-required="true"
          />

          {/*
            Word / character counter — fades in once the user starts typing.
            aria-hidden prevents screen readers from announcing on every keystroke.
          */}
          <div
            className={`text-meta${hasText ? ' visible' : ''}`}
            aria-hidden="true"
          >
            {wordCount.toLocaleString()} word{wordCount !== 1 ? 's' : ''}
            &nbsp;&middot;&nbsp;
            {charCount.toLocaleString()} char{charCount !== 1 ? 's' : ''}
          </div>

          {/* role="alert" triggers an immediate announcement by screen readers */}
          {error && (
            <p id="text-error" className="form-error" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* ── Configuration controls ──────────────────────────────── */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="num-cards">Number of cards</label>
            <input
              id="num-cards"
              type="number"
              value={numCards}
              onChange={(e) => setNumCards(Math.min(50, Math.max(1, Number(e.target.value))))}
              min="1"
              max="50"
            />
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy — fill in the blank</option>
              <option value="medium">Medium — open questions</option>
              <option value="hard">Hard — explain concepts</option>
            </select>
          </div>
        </div>

        {/* ── Action group ────────────────────────────────────────── */}
        <div className="form-actions">

          {/* Primary: gradient submit button, full width */}
          <button
            className={`generate-btn${loading ? ' loading' : ''}`}
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Generating flashcards...
              </>
            ) : (
              'Generate Flashcards'
            )}
          </button>

          {/* Secondary row: lower-priority actions */}
          <div className="form-actions-row">

            {/*
              Skip: ghost/outlined button.
              Visually quieter than Generate to reinforce its lower priority.
            */}
            <button
              className="skip-btn"
              type="button"
              onClick={handleSkip}
              disabled={loading}
              aria-label="Skip adding context and proceed with a demo deck"
            >
              Skip for now
            </button>

            {/*
              Generate hints: link-style tertiary button.
              Disabled when the textarea is empty because hints require source text.
            */}
            <button
              className="hints-btn"
              type="button"
              onClick={handleGenerateHints}
              disabled={loading || !hasText}
              aria-label="Generate study hints from the current text"
              title={!hasText ? 'Paste study material to generate hints' : undefined}
            >
              Generate hints
            </button>

          </div>
        </div>
      </form>
    </div>
  );
}

export default ContextPage;
