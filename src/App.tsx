import { FormEvent, useEffect, useMemo, useState } from "react";

type Screen = "welcome" | "game" | "results";

type Question = {
  phase: string;
  kicker: string;
  title: string;
  context: string;
  options: string[];
  correct: number;
  rationale: string;
  takeaway: string;
};

type LeaderboardEntry = {
  id: string;
  name: string;
  score: number;
  date: string;
};

const STORAGE_KEY = "steelshift-leaderboard";

const questions: Question[] = [
  {
    phase: "Change readiness",
    kicker: "The digital divide",
    title: "How do you turn skepticism into informed sponsorship?",
    context:
      "Tata Steel’s senior leaders are experienced operators, but many are digital non-natives. Radical ideas from younger employees are often dismissed as too risky for a physical steel business.",
    options: [
      "Mandate digital targets immediately and penalize teams that resist",
      "Pair digital-native employees one-to-one with senior leaders as reverse mentors",
      "Outsource the transformation so internal skepticism cannot slow it down",
      "Wait for a competitor to prove that digital steel sales can work",
    ],
    correct: 1,
    rationale:
      "The task force launched reverse mentoring to close the divide safely. Selected digital natives met senior managers one-to-one, helping leaders understand digital technologies and their business implications without threatening their authority.",
    takeaway: "Build understanding before demanding adoption.",
  },
  {
    phase: "Capability building",
    kicker: "Designing the intervention",
    title: "What makes reverse mentoring credible at the top?",
    context:
      "You need mentors who can challenge long-held assumptions while earning the trust of Tata Steel’s most senior leaders.",
    options: [
      "Let any junior employee volunteer and rotate mentors every week",
      "Ask external consultants to mentor leaders instead of employees",
      "Select proven digital talent rigorously and create psychologically safe monthly sessions",
      "Run one large digital seminar for all senior leaders",
    ],
    correct: 2,
    rationale:
      "Tata Steel selected only 16 reverse mentors from 300 applicants through a written test and rigorous interviews. Monthly one-to-one sessions created the psychological safety needed for honest questions and constructive challenge.",
    takeaway: "Trust grows from careful selection and safe dialogue.",
  },
  {
    phase: "Portfolio strategy",
    kicker: "A thousand flowers bloom",
    title: "Enthusiasm is high. What should happen next?",
    context:
      "Digital immersion and early experiments have energized the company. Many pilots are blooming, but Marketing & Sales now needs tangible value and a coherent direction.",
    options: [
      "Keep every experiment alive to preserve momentum",
      "Freeze experimentation until a five-year technology plan is complete",
      "Focus only on the cheapest ideas, regardless of customer impact",
      "Prioritize high-impact initiatives, pilot them small, then rapidly scale what works",
    ],
    correct: 3,
    rationale:
      "Gupta reframed the effort as “Think Big, Start Small, Scale Fast.” Tata Steel would choose a handful of feasible, high-value initiatives, learn through focused pilots, and incrementally build toward scale.",
    takeaway: "Ambition needs focus, experimentation, and a path to scale.",
  },
  {
    phase: "Think big",
    kicker: "Building the roadmap",
    title: "Which evidence should shape your digital roadmap?",
    context:
      "The transformation is greenfield. You must decide where digital can genuinely improve Marketing & Sales rather than chase fashionable technology.",
    options: [
      "Global best practices, M&S strategic priorities, and the end-to-end customer decision journey",
      "Competitor websites and a list of the newest software products",
      "Only internal process-cost data from the previous financial year",
      "The preferences of senior management, ranked by organizational tenure",
    ],
    correct: 0,
    rationale:
      "Tata Steel used three lenses: learn from digital frontrunners, align with M&S strategy, and map B2B and B2C customer journeys from research through post-purchase. This exposed both pain points and opportunities to delight.",
    takeaway: "Start with strategy and customers—not technology.",
  },
  {
    phase: "Prioritization",
    kicker: "From ideas to opportunities",
    title: "How should the long list of ideas be pruned?",
    context:
      "The roadmap has surfaced many promising possibilities. Resources are limited, and only a few can move into proof-of-concept.",
    options: [
      "Back the ideas proposed by the most senior sponsors",
      "Score each idea on monetary attractiveness and Tata Steel’s ability to execute it",
      "Select one idea at random from each business segment",
      "Choose only projects that require no changes outside M&S",
    ],
    correct: 1,
    rationale:
      "The company passed opportunities through two explicit sieves: monetary value to Tata Steel and the organization’s ability to execute. This balanced ambition with feasibility before investing in proofs of concept.",
    takeaway: "Value and executability turn ideas into a portfolio.",
  },
  {
    phase: "Start small",
    kicker: "Choosing the pilots",
    title: "Which portfolio best tests value across customer segments?",
    context:
      "Your shortlist must address distinct unmet needs in B2C, large B2B accounts, and emerging corporate accounts.",
    options: [
      "Three social-media campaigns using the same content for every segment",
      "A single enterprise resource planning replacement across Tata Steel",
      "AASHIYANA for home builders, COMPASS for B2B visibility, and DIGECA for ECA analytics",
      "One consumer marketplace, with industrial customers added later",
    ],
    correct: 2,
    rationale:
      "Tata Steel selected one focused opportunity per segment: AASHIYANA for B2C early engagement and commerce, COMPASS for B2B supply-chain visibility, and DIGECA for ECA lead management and analytics.",
    takeaway: "Test a specific unmet need in each priority segment.",
  },
  {
    phase: "Delivery model",
    kicker: "Learning at speed",
    title: "How should teams build these first digital products?",
    context:
      "Technology and customer expectations are changing quickly. Detailed requirements may be wrong by the time a long implementation finishes.",
    options: [
      "Use rapid prototypes, customer feedback, and iterative agile cycles",
      "Complete every specification before any customer sees the product",
      "Let part-time teams work around their operational responsibilities",
      "Launch the full solution nationally and correct problems afterward",
    ],
    correct: 0,
    rationale:
      "The case rejects a slow waterfall approach for this turbulent environment. Dedicated teams learned agile methods, using rapid prototyping and customer feedback; well-intentioned failure became an accepted part of learning.",
    takeaway: "Short feedback loops make uncertainty manageable.",
  },
  {
    phase: "Ownership",
    kicker: "Moving beyond the pilot",
    title: "Who should own the move to Scale Fast?",
    context:
      "The proofs of concept have momentum. Scaling them will require decisions and behavior changes throughout B2C, B2B, and ECA—not just inside the central digital team.",
    options: [
      "The external consultant, because it has the deepest technical expertise",
      "The central digital team, with business verticals acting only as reviewers",
      "The VP of M&S alone, preserving the directive model used in early phases",
      "Business verticals, supported by central teams while leaders shift to nurturing and mentoring",
    ],
    correct: 3,
    rationale:
      "Toward the end of Phase 1, Tata Steel shifted ownership to the business verticals so they could define how opportunities would scale. Top M&S management moved from directing to nurturing and mentoring, with KPIs changing for scale.",
    takeaway: "Transformation sticks when the business owns it.",
  },
  {
    phase: "Scale fast",
    kicker: "Complexity appears",
    title: "What operating system does scale now require?",
    context:
      "More internal teams, vendors, and technology partners are involved. Dependencies multiply, portal architecture is strained, and teams duplicate digital assets.",
    options: [
      "Fewer reviews so delivery teams can move without interference",
      "Weekly PMO integration, stronger governance, shared architecture, and cross-learning",
      "Separate technology stacks for every vertical to maximize autonomy",
      "Pause all three products and redesign them sequentially",
    ],
    correct: 1,
    rationale:
      "Scaling exposed dependencies hidden during pilots. Tata Steel strengthened PMO governance with weekly reviews, stakeholder communication, deep dives across opportunities, and work to improve architecture and reuse digital assets.",
    takeaway: "Scale is a coordination challenge, not only a technology challenge.",
  },
  {
    phase: "Leadership dilemma",
    kicker: "The next horizon",
    title: "Deeper or broader—which direction should you choose?",
    context:
      "The core initiatives can be optimized further, while new digital breakthroughs could address unmet needs. Talent is scarce, conflicts are emerging, and the way forward is not clear.",
    options: [
      "Go deeper only; exploration can wait until every current initiative is optimized",
      "Go broader only; shift resources away from the existing platforms",
      "Build organizational ambidexterity: exploit proven opportunities while exploring new ones",
      "Hand both choices to consultants to avoid internal conflict",
    ],
    correct: 2,
    rationale:
      "Gupta recognized that Tata Steel needed organizational ambidexterity: continually optimize existing offerings while exploring breakthrough innovation. The case leaves execution open, but makes balancing exploitation and exploration the central leadership challenge.",
    takeaway: "The strongest answer is not either/or—it is disciplined ambidexterity.",
  },
];

const letter = (index: number) => String.fromCharCode(65 + index);

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="m4 10 4 4 8-8" />
    </svg>
  );
}

function Brand() {
  return (
    <div className="brand" aria-label="Steelshift">
      <span className="brand-mark">
        <i />
        <i />
        <i />
      </span>
      <span>STEELSHIFT</span>
    </div>
  );
}

function readLeaderboard(): LeaderboardEntry[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [name, setName] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(readLeaderboard);
  const [validation, setValidation] = useState("");

  const current = questions[questionIndex];
  const scorePercent = score * 10;
  const sortedLeaderboard = useMemo(
    () =>
      [...leaderboard]
        .sort((a, b) => b.score - a.score || a.date.localeCompare(b.date))
        .slice(0, 5),
    [leaderboard],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [questionIndex, screen]);

  function startGame(event: FormEvent) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setValidation("Enter your name to start the challenge.");
      return;
    }
    setName(cleanName.slice(0, 24));
    setValidation("");
    setQuestionIndex(0);
    setSelected(null);
    setScore(0);
    setScreen("game");
  }

  function selectAnswer(index: number) {
    if (selected !== null) return;
    setSelected(index);
    if (index === current.correct) setScore((value) => value + 1);
  }

  function advance() {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((value) => value + 1);
      setSelected(null);
      return;
    }

    const finalScore = score;
    const entry: LeaderboardEntry = {
      id: `${Date.now()}-${Math.random()}`,
      name,
      score: finalScore,
      date: new Date().toISOString(),
    };
    const next = [...leaderboard, entry].sort((a, b) => b.score - a.score).slice(0, 20);
    setLeaderboard(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setScreen("results");
  }

  function restart() {
    setQuestionIndex(0);
    setSelected(null);
    setScore(0);
    setScreen("welcome");
  }

  const resultMessage =
    scorePercent >= 90
      ? "Transformation architect"
      : scorePercent >= 70
        ? "Digital change leader"
        : scorePercent >= 50
          ? "Promising change maker"
          : "Transformation apprentice";

  return (
    <main className={`app-shell ${screen}`}>
      <header className="topbar">
        <Brand />
        {screen === "game" && (
          <div className="header-meta">
            <span>{name}</span>
            <strong>{score * 10} pts</strong>
          </div>
        )}
        {screen === "results" && <span className="case-label">TATA STEEL · M&amp;S</span>}
      </header>

      {screen === "welcome" && (
        <section className="welcome-page">
          <div className="welcome-copy">
            <p className="eyebrow">A DIGITAL TRANSFORMATION CHALLENGE</p>
            <h1>
              The future of steel
              <br />
              is <em>not</em> just steel.
            </h1>
            <p className="intro">
              Step into the leadership team at Tata Steel. Ten pivotal decisions stand
              between a legacy organization and its digital future.
            </p>

            <form onSubmit={startGame} className="start-form">
              <label htmlFor="player-name">Your name</label>
              <div className="input-row">
                <input
                  id="player-name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setValidation("");
                  }}
                  maxLength={24}
                  placeholder="Enter your name"
                  autoComplete="name"
                  aria-describedby={validation ? "name-error" : undefined}
                />
                <button type="submit" className="primary-button">
                  Begin challenge <ArrowIcon />
                </button>
              </div>
              {validation && (
                <p id="name-error" className="error-message" role="alert">
                  {validation}
                </p>
              )}
            </form>

            <div className="game-facts" aria-label="Game details">
              <span><strong>10</strong> decisions</span>
              <span><strong>~8</strong> minutes</span>
              <span><strong>01</strong> case study</span>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="art-number">10</div>
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-orbit orbit-three" />
            <div className="art-dot dot-one" />
            <div className="art-dot dot-two" />
            <p>DECISIONS<br />THAT SHAPE<br />TRANSFORMATION</p>
          </div>
        </section>
      )}

      {screen === "game" && (
        <section className="game-page">
          <div className="progress-row">
            <div className="progress-copy">
              <span>DECISION {String(questionIndex + 1).padStart(2, "0")}</span>
              <span>{questions.length}</span>
            </div>
            <div className="progress-track">
              <div style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} />
            </div>
            <span className="phase-pill">{current.phase}</span>
          </div>

          <article className="question-layout">
            <aside className="question-aside">
              <span className="aside-number">{String(questionIndex + 1).padStart(2, "0")}</span>
              <p>{current.kicker}</p>
            </aside>

            <div className="question-main">
              <h2>{current.title}</h2>
              <p className="context">{current.context}</p>

              <div className="options" role="group" aria-label="Answer choices">
                {current.options.map((option, index) => {
                  const isSelected = selected === index;
                  const isCorrect = selected !== null && index === current.correct;
                  const isWrong = isSelected && index !== current.correct;
                  return (
                    <button
                      type="button"
                      className={`option ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""} ${
                        selected !== null && !isCorrect && !isSelected ? "muted" : ""
                      }`}
                      onClick={() => selectAnswer(index)}
                      disabled={selected !== null}
                      key={option}
                    >
                      <span className="option-letter">
                        {isCorrect ? <CheckIcon /> : letter(index)}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              {selected !== null && (
                <div className="feedback" aria-live="polite">
                  <div className="feedback-heading">
                    <span className={selected === current.correct ? "right" : "not-quite"}>
                      {selected === current.correct ? "Strong call" : "Not quite"}
                    </span>
                    <span>+{selected === current.correct ? 10 : 0} points</span>
                  </div>
                  <p>{current.rationale}</p>
                  <div className="takeaway">
                    <span>LEADERSHIP NOTE</span>
                    <strong>{current.takeaway}</strong>
                  </div>
                  <button type="button" className="primary-button next-button" onClick={advance}>
                    {questionIndex === questions.length - 1 ? "View results" : "Next decision"}
                    <ArrowIcon />
                  </button>
                </div>
              )}
            </div>
          </article>
        </section>
      )}

      {screen === "results" && (
        <section className="results-page">
          <div className="results-hero">
            <p className="eyebrow">CHALLENGE COMPLETE</p>
            <h1>{resultMessage}</h1>
            <p>
              You navigated Tata Steel’s journey from digital skepticism to the challenge
              of organizational ambidexterity.
            </p>
            <div className="score-lockup">
              <strong>{scorePercent}</strong>
              <span>/ 100</span>
              <i>POINTS</i>
            </div>
          </div>

          <div className="results-grid">
            <div className="result-summary">
              <span className="section-label">YOUR PERFORMANCE</span>
              <div className="stat-row">
                <div><strong>{score}</strong><span>sound decisions</span></div>
                <div><strong>{10 - score}</strong><span>learning moments</span></div>
              </div>
              <blockquote>
                “Think Big, Start Small, Scale Fast.”
                <cite>Peeyush Gupta’s digital motto</cite>
              </blockquote>
              <button type="button" className="primary-button" onClick={restart}>
                Play again <ArrowIcon />
              </button>
            </div>

            <div className="leaderboard-card">
              <div className="leaderboard-title">
                <div>
                  <span className="section-label">LOCAL RANKING</span>
                  <h2>Leaderboard</h2>
                </div>
                <span>TOP 5</span>
              </div>
              <ol>
                {sortedLeaderboard.map((entry, index) => (
                  <li className={entry.id === sortedLeaderboard.find((item) => item.name === name && item.score === score)?.id ? "current-player" : ""} key={entry.id}>
                    <span className="rank">{String(index + 1).padStart(2, "0")}</span>
                    <strong>{entry.name}</strong>
                    <span className="leader-score">{entry.score * 10}</span>
                  </li>
                ))}
              </ol>
              <p className="storage-note">Scores are saved on this device.</p>
            </div>
          </div>
        </section>
      )}

      <footer>
        <span>BASED ON THE ISB CASE STUDY</span>
        <span>DRIVING DIGITAL TRANSFORMATION AT TATA STEEL</span>
      </footer>
    </main>
  );
}

export default App;
