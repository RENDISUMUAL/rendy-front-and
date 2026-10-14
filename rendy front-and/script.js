const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

const particles = [];
const maxDistance = 88;
const textValue = 'REACT';

function setupCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles() {
  particles.length = 0;

  const fontSize = Math.min(window.innerWidth * 0.18, 240);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `700 ${fontSize}px Segoe UI, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(textValue, canvas.width / 2, canvas.height / 2);

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;

  for (let y = 0; y < canvas.height; y += 4) {
    for (let x = 0; x < canvas.width; x += 4) {
      const index = (x + y * canvas.width) * 4;
      const alpha = data[index + 3];

      if (alpha > 120) {
        particles.push({
          x: x + Math.random() * 2 - 1,
          y: y + Math.random() * 2 - 1,
          baseX: x + Math.random() * 2 - 1,
          baseY: y + Math.random() * 2 - 1,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2.4 + 1.2,
          hue: 180 + Math.random() * 120,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
  }
}

function drawBackground() {
  ctx.fillStyle = 'rgba(4, 8, 22, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function animate() {
  drawBackground();

  const time = performance.now() * 0.001;

  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i];
    const driftX = Math.sin(time * 0.8 + p.phase) * 1.5;
    const driftY = Math.cos(time * 0.9 + p.phase) * 1.5;

    p.x += (p.baseX + driftX - p.x) * 0.08 + p.vx;
    p.y += (p.baseY + driftY - p.y) * 0.08 + p.vy;
  }

  for (let i = 0; i < particles.length; i += 1) {
    const a = particles[i];

    for (let j = i + 1; j < particles.length; j += 1) {
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.hypot(dx, dy);

      if (distance < maxDistance) {
        const alpha = 1 - distance / maxDistance;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 90%, 65%, ${alpha * 0.4})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }

  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i];
    const pulse = 1 + Math.sin(time * 2 + p.phase) * 0.7;

    ctx.beginPath();
    ctx.fillStyle = `hsla(${p.hue}, 95%, 70%, 0.9)`;
    ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  setupCanvas();
  createParticles();
});

setupCanvas();
createParticles();
requestAnimationFrame(animate);
