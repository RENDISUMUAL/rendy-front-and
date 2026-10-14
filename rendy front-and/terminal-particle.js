const cols = 100;
const rows = 28;
const chars = ['.', '•', 'o', '*', '+'];

const particles = Array.from({ length: 170 }, () => {
  const angle = Math.random() * Math.PI * 2;
  const radius = 4 + Math.random() * 10;
  const centerX = cols / 2;
  const centerY = rows / 2;

  return {
    x: Math.random() * cols,
    y: Math.random() * rows,
    baseX: centerX + Math.cos(angle) * radius,
    baseY: centerY + Math.sin(angle) * radius,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    char: chars[Math.floor(Math.random() * chars.length)],
    hue: 160 + Math.random() * 120,
    size: 0.8 + Math.random() * 1.8,
  };
});

function renderFrame(time) {
  const frame = Array.from({ length: rows }, () => Array(cols).fill(' '));

  for (const p of particles) {
    const dx = p.baseX - p.x;
    const dy = p.baseY - p.y;
    p.x += dx * 0.08 + p.vx;
    p.y += dy * 0.08 + p.vy;

    const swayX = Math.sin(time * 0.002 + p.baseY) * 0.7;
    const swayY = Math.cos(time * 0.0025 + p.baseX) * 0.7;

    const nx = Math.min(cols - 1, Math.max(0, Math.round(p.x + swayX)));
    const ny = Math.min(rows - 1, Math.max(0, Math.round(p.y + swayY)));

    frame[ny][nx] = p.char;
  }

  const header = '  REACT PARTICLE FIELD  ';
  const output = [header, ''];

  for (let y = 0; y < rows; y += 1) {
    let line = '';
    for (let x = 0; x < cols; x += 1) {
      const ch = frame[y][x];
      if (ch === ' ') {
        line += ' ';
      } else {
        const color = 30 + ((Math.floor((x + y + time) % 7) + 1) * 10);
        line += `\x1b[38;5;${color}m${ch}\x1b[0m`;
      }
    }
    output.push(line);
  }

  process.stdout.write('\x1b[H\x1b[2J');
  process.stdout.write(output.join('\n'));
}

process.stdout.write('\x1b[?25l');

setInterval(() => {
  renderFrame(Date.now());
}, 45);

process.on('SIGINT', () => {
  process.stdout.write('\x1b[?25h\x1b[0m');
  process.exit(0);
});
