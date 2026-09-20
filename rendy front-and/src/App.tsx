import { useState } from 'react';
import './App.css';

function App() {
  const [fib, setFib] = useState([0, 1]);

  const nextFib = () => {
    setFib(([prev, curr]) => [curr, prev + curr]);
  };

  return (
    <main className="fibonacci-page">
      <section className="fibonacci-card" aria-labelledby="fibonacci-title">
        <p className="eyebrow">Latihan state dan event</p>
        <h1 id="fibonacci-title">Penghitung Fibonacci</h1>
        <p className="description">Klik tombol untuk menampilkan angka Fibonacci berikutnya.</p>

        <div className="number-display" aria-live="polite">{fib[0]}</div>

        <button type="button" onClick={nextFib}>
          Angka Fibonacci berikutnya
        </button>
      </section>
    </main>
  );
}

export default App;
 