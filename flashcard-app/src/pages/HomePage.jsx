import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const features = [
  {
    icon: '📄',
    title: 'Paste any text',
    desc: 'Articles, notes, textbooks — any study material works.',
  },
  {
    icon: '✨',
    title: 'AI generation',
    desc: 'Smart questions and answers crafted from your content.',
  },
  {
    icon: '🎯',
    title: 'Learn & master',
    desc: 'Track your progress with spaced repetition built in.',
  },
];

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="home-badge">AI-Powered Flashcards</div>
        <h1 className="home-title">
          Study smarter,<br />not harder
        </h1>
        <p className="home-subtitle">
          Paste any text and get a personalized flashcard deck in seconds.
          <br />
          Built for students who want results.
        </p>
        <button className="home-cta" onClick={() => navigate('/context')}>
          Get started <span className="cta-arrow">→</span>
        </button>
      </div>

      <div className="home-features">
        {features.map((f) => (
          <div key={f.title} className="feature-card">
            <span className="feature-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
