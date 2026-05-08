import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './FlashcardsPage.css';

function FlashcardsPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const cards = state?.cards ?? [];
  const total = cards.length;

  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [results, setResults] = useState([]);

  if (!cards.length) {
    return (
      <div className="fc-page fc-empty">
        <p>No flashcards found.</p>
        <button onClick={() => navigate('/context')}>Go back</button>
      </div>
    );
  }

  const current = cards[index];
  const progress = ((index) / total) * 100;

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      setShowActions(true);
    }
  };

  const handleAnswer = (correct) => {
    const updated = [...results, { card: current, correct }];
    setResults(updated);

    if (index + 1 >= total) {
      navigate('/results', { state: { results: updated, total } });
      return;
    }

    setIsFlipped(false);
    setShowActions(false);
    setTimeout(() => setIndex((i) => i + 1), 320);
  };

  return (
    <div className="fc-page">
      <div className="fc-header">
        <button className="fc-exit" onClick={() => navigate('/context')}>✕</button>
        <div className="fc-progress-bar">
          <div className="fc-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="fc-counter">{index + 1} / {total}</span>
      </div>

      <div className="fc-body">
        <div
          className={`card-scene${isFlipped ? ' is-flipped' : ''}`}
          onClick={handleFlip}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleFlip()}
          aria-label={isFlipped ? 'Card answer visible' : 'Click to reveal answer'}
        >
          <div className="card-inner">
            <div className="card-face card-front">
              <span className="card-label">Question</span>
              <p className="card-text">{current.question}</p>
              {!isFlipped && (
                <span className="card-hint">Click to reveal answer</span>
              )}
            </div>
            <div className="card-face card-back">
              <span className="card-label">Answer</span>
              <p className="card-text">{current.answer}</p>
            </div>
          </div>
        </div>

        <div className={`fc-actions${showActions ? ' visible' : ''}`}>
          <button
            className="fc-btn fc-btn-wrong"
            onClick={() => handleAnswer(false)}
          >
            ✕ Need review
          </button>
          <button
            className="fc-btn fc-btn-correct"
            onClick={() => handleAnswer(true)}
          >
            ✓ Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export default FlashcardsPage;
