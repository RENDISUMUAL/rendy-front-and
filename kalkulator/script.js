/**
 * Kalkulator Modern Interaktif
 * Fitur: Operasi Standar, Saintifik Dasar, Riwayat, Audio Feedback, Tema Gelap/Terang, Shortcut Keyboard.
 */

class Calculator {
  constructor(previousOperandTextElement, currentOperandTextElement) {
    this.previousOperandTextElement = previousOperandTextElement;
    this.currentOperandTextElement = currentOperandTextElement;
    this.soundEnabled = true;
    this.audioCtx = null;
    this.history = JSON.parse(localStorage.getItem('calc_history') || '[]');
    this.clear();
  }

  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.shouldResetScreen = false;
  }

  delete() {
    if (this.shouldResetScreen) {
      this.currentOperand = '0';
      this.shouldResetScreen = false;
      return;
    }
    if (this.currentOperand === '0' || this.currentOperand === 'Error' || this.currentOperand.includes('Tidak bisa')) {
      this.currentOperand = '0';
      return;
    }
    if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }
  }

  appendNumber(number) {
    if (this.shouldResetScreen || this.currentOperand === 'Error' || this.currentOperand.includes('Tidak bisa')) {
      this.currentOperand = '';
      this.shouldResetScreen = false;
    }

    if (number === '.' && this.currentOperand.includes('.')) return;
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number.toString();
    } else {
      // Batasi panjang input agar tidak overflow
      if (this.currentOperand.replace(/[^0-9]/g, '').length >= 16) return;
      this.currentOperand = (this.currentOperand === '' && number === '.') ? '0.' : this.currentOperand + number.toString();
    }
  }

  chooseOperation(operation) {
    if (this.currentOperand === 'Error' || this.currentOperand.includes('Tidak bisa')) return;

    if (this.currentOperand === '' && this.previousOperand !== '') {
      this.operation = operation;
      this.updateDisplay();
      return;
    }

    if (this.previousOperand !== '') {
      this.compute();
    }

    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = '';
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current)) return;

    let expr = `${this.formatDisplayNumber(prev)} ${this.operation} ${this.formatDisplayNumber(current)}`;

    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '-':
        computation = prev - current;
        break;
      case '×':
      case '*':
        computation = prev * current;
        break;
      case '÷':
      case '/':
        if (current === 0) {
          this.currentOperand = 'Tidak bisa bagi 0';
          this.previousOperand = '';
          this.operation = undefined;
          this.shouldResetScreen = true;
          return;
        }
        computation = prev / current;
        break;
      case '%':
        computation = (prev * current) / 100;
        break;
      default:
        return;
    }

    // Hindari floating point error seperti 0.1 + 0.2 = 0.30000000000000004
    computation = this.roundAccurate(computation);

    // Simpan ke riwayat
    this.addHistory(expr, computation);

    this.currentOperand = computation.toString();
    this.operation = undefined;
    this.previousOperand = '';
    this.shouldResetScreen = true;
  }

  // Operasi langsung (Akar, Kuadrat, Persen tunggal, Negasi)
  applyUnary(type) {
    let current = parseFloat(this.currentOperand);
    if (isNaN(current)) return;

    let computation;
    let expr = '';

    switch (type) {
      case 'sqrt':
        if (current < 0) {
          this.currentOperand = 'Error';
          this.shouldResetScreen = true;
          return;
        }
        computation = Math.sqrt(current);
        expr = `√(${this.formatDisplayNumber(current)})`;
        break;
      case 'square':
        computation = Math.pow(current, 2);
        expr = `(${this.formatDisplayNumber(current)})²`;
        break;
      case 'negate':
        this.currentOperand = (current * -1).toString();
        this.updateDisplay();
        return;
      default:
        return;
    }

    computation = this.roundAccurate(computation);
    this.addHistory(expr, computation);
    this.currentOperand = computation.toString();
    this.shouldResetScreen = true;
    this.updateDisplay();
  }

  roundAccurate(num) {
    return Math.round((num + Number.EPSILON) * 10000000000) / 10000000000;
  }

  formatDisplayNumber(number) {
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split('.')[0]);
    const decimalDigits = stringNumber.split('.')[1];
    let integerDisplay;

    if (isNaN(integerDigits)) {
      integerDisplay = '';
    } else {
      integerDisplay = integerDigits.toLocaleString('id-ID', { maximumFractionDigits: 0 });
    }

    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }

  updateDisplay() {
    if (this.currentOperand.includes('Tidak bisa') || this.currentOperand === 'Error') {
      this.currentOperandTextElement.innerText = this.currentOperand;
      this.currentOperandTextElement.style.fontSize = '1.4rem';
    } else {
      this.currentOperandTextElement.style.fontSize = '';
      if (this.currentOperand === '') {
        this.currentOperandTextElement.innerText = '0';
      } else {
        const parts = this.currentOperand.split('.');
        const intPart = parseFloat(parts[0]);
        const decPart = parts[1];

        if (isNaN(intPart)) {
          this.currentOperandTextElement.innerText = this.currentOperand;
        } else {
          let formatted = intPart.toLocaleString('id-ID');
          if (parts.length > 1) {
            formatted += '.' + decPart;
          }
          this.currentOperandTextElement.innerText = formatted;
        }
      }
    }

    if (this.operation != null) {
      const prevNum = parseFloat(this.previousOperand);
      const formattedPrev = isNaN(prevNum) ? this.previousOperand : prevNum.toLocaleString('id-ID');
      this.previousOperandTextElement.innerText = `${formattedPrev} ${this.operation}`;
    } else {
      this.previousOperandTextElement.innerText = '';
    }
  }

  addHistory(expression, result) {
    const record = {
      expression,
      result: this.formatDisplayNumber(result),
      rawResult: result,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    this.history.unshift(record);
    if (this.history.length > 30) this.history.pop();
    localStorage.setItem('calc_history', JSON.stringify(this.history));
    renderHistory();
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('calc_history');
    renderHistory();
  }

  // Synthesized Sound Effect using Web Audio API
  playClickSound(freq = 600, type = 'sine') {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  }
}

// Inisialisasi Elemen DOM
const previousOperandTextElement = document.getElementById('previousOperand');
const currentOperandTextElement = document.getElementById('currentOperand');
const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

const numberButtons = document.querySelectorAll('[data-number]');
const operatorButtons = document.querySelectorAll('[data-operator]');
const actionButtons = document.querySelectorAll('[data-action]');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const historyToggleBtn = document.getElementById('historyToggleBtn');
const historyPanel = document.getElementById('historyPanel');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// Event Listeners untuk Tombol Angka
numberButtons.forEach(button => {
  button.addEventListener('click', () => {
    calculator.playClickSound(520);
    calculator.appendNumber(button.innerText.trim());
    calculator.updateDisplay();
  });
});

// Event Listeners untuk Operator
operatorButtons.forEach(button => {
  button.addEventListener('click', () => {
    calculator.playClickSound(740);
    const op = button.getAttribute('data-operator');
    calculator.chooseOperation(op);
    calculator.updateDisplay();
  });
});

// Event Listeners untuk Aksi (AC, DEL, Equals, Sqrt, Square, Negate)
actionButtons.forEach(button => {
  button.addEventListener('click', () => {
    const action = button.getAttribute('data-action');
    switch (action) {
      case 'all-clear':
        calculator.playClickSound(380, 'triangle');
        calculator.clear();
        calculator.updateDisplay();
        break;
      case 'delete':
        calculator.playClickSound(440);
        calculator.delete();
        calculator.updateDisplay();
        break;
      case 'calculate':
        calculator.playClickSound(880, 'triangle');
        calculator.compute();
        calculator.updateDisplay();
        break;
      case 'sqrt':
      case 'square':
      case 'negate':
        calculator.playClickSound(660);
        calculator.applyUnary(action);
        break;
    }
  });
});

// Render Riwayat
function renderHistory() {
  if (!historyList) return;
  if (calculator.history.length === 0) {
    historyList.innerHTML = '<p class="empty-history">Belum ada riwayat perhitungan.</p>';
    return;
  }

  historyList.innerHTML = calculator.history.map((item, index) => `
    <div class="history-item" data-index="${index}" title="Klik untuk gunakan hasil ini">
      <span class="history-item-expr">${item.expression}</span>
      <span class="history-item-res">= ${item.result}</span>
    </div>
  `).join('');

  // Klik riwayat untuk memasukkan angka kembali ke kalkulator
  document.querySelectorAll('.history-item').forEach(itemEl => {
    itemEl.addEventListener('click', () => {
      const idx = itemEl.getAttribute('data-index');
      const item = calculator.history[idx];
      if (item) {
        calculator.currentOperand = item.rawResult.toString();
        calculator.shouldResetScreen = true;
        calculator.updateDisplay();
        historyPanel.classList.add('hidden');
        calculator.playClickSound(600);
      }
    });
  });
}

// Bersihkan Riwayat
clearHistoryBtn.addEventListener('click', () => {
  calculator.clearHistory();
});

// Toggle Riwayat Panel
historyToggleBtn.addEventListener('click', () => {
  historyPanel.classList.toggle('hidden');
});

// Tutup Panel Riwayat bila klik di luar
document.addEventListener('click', (e) => {
  if (!historyPanel.contains(e.target) && !historyToggleBtn.contains(e.target) && !historyPanel.classList.contains('hidden')) {
    historyPanel.classList.add('hidden');
  }
});

// Toggle Suara
soundToggleBtn.addEventListener('click', () => {
  calculator.soundEnabled = !calculator.soundEnabled;
  soundToggleBtn.innerText = calculator.soundEnabled ? '🔊' : '🔇';
  soundToggleBtn.setAttribute('title', calculator.soundEnabled ? 'Suara Aktif' : 'Suara Bisu');
});

// Toggle Tema (Dark / Light)
themeToggleBtn.addEventListener('click', () => {
  const isDark = document.body.classList.contains('dark-theme');
  if (isDark) {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    themeToggleBtn.innerText = '☀️';
    localStorage.setItem('calc_theme', 'light');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    themeToggleBtn.innerText = '🌙';
    localStorage.setItem('calc_theme', 'dark');
  }
});

// Load Tema Tersimpan
const savedTheme = localStorage.getItem('calc_theme');
if (savedTheme === 'light') {
  document.body.classList.remove('dark-theme');
  document.body.classList.add('light-theme');
  themeToggleBtn.innerText = '☀️';
}

// Dukungan Keyboard Shortcut
window.addEventListener('keydown', (e) => {
  // Angka 0 - 9
  if (/^[0-9]$/.test(e.key)) {
    e.preventDefault();
    calculator.playClickSound(520);
    calculator.appendNumber(e.key);
    calculator.updateDisplay();
    highlightButton(`[data-number="${e.key}"]`);
    return;
  }

  // Desimal
  if (e.key === '.' || e.key === ',') {
    e.preventDefault();
    calculator.playClickSound(520);
    calculator.appendNumber('.');
    calculator.updateDisplay();
    highlightButton(`[data-number="."]`);
    return;
  }

  // Operator
  if (e.key === '+') {
    e.preventDefault();
    calculator.playClickSound(740);
    calculator.chooseOperation('+');
    calculator.updateDisplay();
    highlightButton(`[data-operator="+"]`);
    return;
  }
  if (e.key === '-') {
    e.preventDefault();
    calculator.playClickSound(740);
    calculator.chooseOperation('-');
    calculator.updateDisplay();
    highlightButton(`[data-operator="-"]`);
    return;
  }
  if (e.key === '*' || e.key.toLowerCase() === 'x') {
    e.preventDefault();
    calculator.playClickSound(740);
    calculator.chooseOperation('×');
    calculator.updateDisplay();
    highlightButton(`[data-operator="×"]`);
    return;
  }
  if (e.key === '/') {
    e.preventDefault();
    calculator.playClickSound(740);
    calculator.chooseOperation('÷');
    calculator.updateDisplay();
    highlightButton(`[data-operator="÷"]`);
    return;
  }
  if (e.key === '%') {
    e.preventDefault();
    calculator.playClickSound(740);
    calculator.chooseOperation('%');
    calculator.updateDisplay();
    highlightButton(`[data-operator="%"]`);
    return;
  }

  // Enter atau = untuk Hitung
  if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    calculator.playClickSound(880, 'triangle');
    calculator.compute();
    calculator.updateDisplay();
    highlightButton(`[data-action="calculate"]`);
    return;
  }

  // Backspace untuk Hapus satu karakter
  if (e.key === 'Backspace') {
    e.preventDefault();
    calculator.playClickSound(440);
    calculator.delete();
    calculator.updateDisplay();
    highlightButton(`[data-action="delete"]`);
    return;
  }

  // Escape untuk All Clear
  if (e.key === 'Escape') {
    e.preventDefault();
    calculator.playClickSound(380, 'triangle');
    calculator.clear();
    calculator.updateDisplay();
    highlightButton(`[data-action="all-clear"]`);
    return;
  }
});

// Efek Visual Tombol saat Shortcut ditekan
function highlightButton(selector) {
  const btn = document.querySelector(selector);
  if (!btn) return;
  btn.style.transform = 'scale(0.92)';
  setTimeout(() => {
    btn.style.transform = '';
  }, 120);
}

// Inisialisasi Tampilan Awal & Riwayat
calculator.updateDisplay();
renderHistory();
