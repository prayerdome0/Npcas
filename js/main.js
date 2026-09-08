import { initGame } from './game.js';
import { initUI, hideLoader } from './ui.js';
import { audio } from './audio.js';

const canvas = document.getElementById('game');
try {
  initGame(canvas);
  initUI();
  setTimeout(hideLoader, 600);
} catch (err) {
  console.error(err);
  const l = document.getElementById('load-msg');
  if (l) l.textContent = 'Failed to start the city. Check the console.';
}

window.addEventListener('pointerdown', () => audio.unlock(), { once: true });
