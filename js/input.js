const keys = {};
const prevKeys = {};
let mouseX = 0;
let mouseY = 0;
let mouseDown = false;
let mouseJustClicked = false;

let btnDynamitePressed = false;
let btnFreezePressed = false;

function setupInput(canvas) {
  window.addEventListener('keydown', e => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    keys[key] = true;
    if (key === ' ' || key === 'arrowup') {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', e => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    keys[key] = false;
  });

  function updateMouseFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    mouseX = (e.clientX - rect.left) * scaleX;
    mouseY = (e.clientY - rect.top) * scaleY;
  }

  // Mouse events
  canvas.addEventListener('mousemove', e => {
    updateMouseFromEvent(e);
  });
  canvas.addEventListener('mousedown', e => {
    updateMouseFromEvent(e);
    mouseDown = true;
    mouseJustClicked = true;
  });
  canvas.addEventListener('mouseup', () => {
    mouseDown = false;
  });

  // Touch events
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touch = e.touches[0];
    updateMouseFromEvent(touch);
    mouseDown = true;
    mouseJustClicked = true;
  }, { passive: false });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const touch = e.touches[0];
    updateMouseFromEvent(touch);
  }, { passive: false });
  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    mouseDown = false;
  }, { passive: false });

  // Touch buttons
  const btnD = document.getElementById('btnDynamite');
  const btnF = document.getElementById('btnFreeze');
  if (btnD) {
    btnD.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      btnDynamitePressed = true;
    });
  }
  if (btnF) {
    btnF.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      btnFreezePressed = true;
    });
  }
}

function justPressed(key) {
  const result = keys[key] && !prevKeys[key];
  return result;
}

function updateInputState() {
  for (const k in keys) {
    prevKeys[k] = keys[k];
  }
}

function isInRect(mx, my, x, y, w, h) {
  return mx >= x && mx <= x + w && my >= y && my <= y + h;
}
