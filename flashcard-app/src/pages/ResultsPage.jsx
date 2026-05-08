import { useNavigate, useLocation } from 'react-router-dom';
import './ResultsPage.css';

function getPerformance(pct) {
  if (pct >= 80) return { label: 'Excellent!', color: '#6affc8', emoji: '' };
  if (pct >= 60) return { label: 'Good job!', color: '#ffd56a', emoji: '' };
  if (pct >= 40) return { label: 'Keep going!', color: '#a16aff', emoji: '' };
  return { label: 'Keep practicing', color: '#ff6ec7', emoji: '' };
}

function ResultsPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const results = state?.results ?? [];
  const total = state?.total ?? results.length;
  const correct = results.filter((r) => r.correct).length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const { label, color, emoji } = getPerformance(pct);

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (pct / 100) * circumference;

  if (!results.length) {
    return (
      <div className="results-page results-empty">
        <p>No results yet.</p>
        <button onClick={() => navigate('/context')}>Start studying</button>
      </div>
    );
  }

  return (
    <div className="results-page">
      <div className="results-card">
        <div className="results-header">
          <span className="results-emoji">{emoji}</span>
          <h1 className="results-title">{label}</h1>
          <p className="results-subtitle">You completed {total} flashcard{total !== 1 ? 's' : ''}</p>
        </div>

        <div className="score-ring-wrap">
          <svg className="score-ring" viewBox="0 0 120 120" width="160" height="160">
            <circle cx="60" cy="60" r="54" className="ring-bg" />
            <circle
              cx="60"
              cy="60"
              r="54"
              className="ring-fill"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: dashOffset,
                stroke: color,
              }}
            />
          </svg>
          <div className="score-center">
            <span className="score-pct" style={{ color }}>{pct}%</span>
            <span className="score-fraction">{correct}/{total}</span>
          </div>
        </div>

        <div className="results-stats">
          <div className="stat">
            <span className="stat-num" style={{ color: '#6affc8' }}>{correct}</span>
            <span className="stat-label">Correct</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num" style={{ color: '#ff6ec7' }}>{total - correct}</span>
            <span className="stat-label">Review</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">{total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>

        <div className="results-actions">
          <button className="results-btn results-btn-primary" onClick={() => navigate('/context')}>
            Study again
          </button>
          <button className="results-btn results-btn-secondary" onClick={() => navigate('/')}>
            Home
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="results-review">
          <h2>Card summary</h2>
          <ul className="review-list">
            {results.map((r, i) => (
              <li key={i} className={`review-item ${r.correct ? 'correct' : 'wrong'}`}>
                <span className="review-icon">{r.correct ? '✓' : '✕'}</span>
                <p className="review-q">{r.card.question}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ResultsPage;
