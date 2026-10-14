import './App.css'

function HeartFloat({ className }: { className: string }) {
  return <span className={className} aria-hidden="true" />
}

function App() {
  const floatingHearts = [
    'heart-float heart-one',
    'heart-float heart-two',
    'heart-float heart-three',
    'heart-float heart-four',
    'heart-float heart-five',
    'heart-float heart-six',
    'heart-float heart-seven',
    'heart-float heart-eight',
  ]

  return (
    <div className="heart-page">
      <div className="heart-bokeh" aria-hidden="true" />

      <div className="couple-scene" aria-hidden="true">
        <div className="figure figure-man">
          <span className="head" />
          <span className="body" />
          <span className="arm arm-left" />
          <span className="arm arm-right" />
        </div>

        <div className="figure figure-woman">
          <span className="head" />
          <span className="body" />
          <span className="arm arm-left" />
          <span className="arm arm-right" />
        </div>
      </div>

      <div className="floating-hearts" aria-hidden="true">
        {floatingHearts.map((item) => (
          <HeartFloat key={item} className={item} />
        ))}
      </div>

      <div className="page-shell">
        <header className="topbar">
          <div className="brand">My Love</div>
          <nav className="menu" aria-label="Main menu">
            <a className="active" href="#home">Home</a>
            <a href="#story">Story</a>
            <a href="#memory">Memory</a>
            <a href="#love">Love</a>
          </nav>
        </header>

        <main className="heart-card" id="home">
          <p className="eyebrow">Love animation</p>

          <div className="heart-wrap">
            <div className="heart">
              <span className="heart-text">Aku Sayang Kamu</span>
            </div>
          </div>

          <h1>Untukmu, yang paling aku sayang</h1>
          <p className="subtitle">
            Setiap hari denganmu terasa seperti musim bunga yang datang tanpa permisi,
            membawa senyum, hangat, dan rasa tenang yang tak tergantikan.
          </p>
        </main>
      </div>
    </div>
  )
}

export default App
