let setCell, getCell, solve, cleanGrid;

window.onload = () => {
  setCell = Module.cwrap('set_cell', null, ['number', 'number']);
  getCell = Module.cwrap('get_cell', 'number', ['number']);
  solve = Module.cwrap('solve', 'number', []);
  cleanGrid = Module.cwrap('clean_grid', null, []);
};

/* ── Helpers ── */

function clearAlerta(){
  document.querySelectorAll(".cell").forEach(cell => {
    cell.classList.remove("alerta", "conflict", "solved");
  });
  const wrapper = document.querySelector('.grid-wrapper');
  if (wrapper) wrapper.classList.remove('shake');
}

function setMessage(text, type) {
  const el = document.getElementById("message");
  el.textContent = text;
  el.className = type || '';  // 'error' | 'success' | ''
}

/* ── Cell click ── */

window.pressBlock = function(i){
    clearAlerta();
    setMessage('', '');

    const cell = document.getElementById('cell' + String(i));
    var content = cell.textContent;

    if (content == '') {
        content = '1';
    } else if (parseInt(content) >= 1 && parseInt(content) < 9){
        content = String(parseInt(content) + 1);
    } else if (content == '9'){
        content = '';
    }

    cell.textContent = content;

    // Track user-input cells visually
    if (content !== '') {
        cell.classList.add('user-input');
    } else {
        cell.classList.remove('user-input');
    }

    if (content == ''){
        content = '0';
    }

    setCell(i, parseInt(content));
};

/* ── Clear ── */

window.clearGrid = function(){
  cleanGrid();
  for (let i = 0; i < 81; i++){
    const cell = document.getElementById('cell' + String(i));
    cell.textContent = '';
    cell.classList.remove('user-input', 'solved', 'alerta', 'conflict');
  }
  setMessage('', '');
  clearAlerta();
}

/* ── Solve ── */

window.solveGrid = function(){
  clearAlerta();
  setMessage('', '');

  // Remember which cells the user filled
  const userCells = new Set();
  for (let i = 0; i < 81; i++){
    if (document.getElementById('cell' + String(i)).textContent !== '') {
      userCells.add(i);
    }
  }

  console.log("Resolviendo...");
  var solved = solve();

  if (solved == 1){
    for (let i = 0; i < 81; i++){
      const cell = document.getElementById('cell' + String(i));
      cell.textContent = String(getCell(i));
      if (!userCells.has(i)) {
        cell.classList.add('solved');
        // Stagger the animation for a wave effect
        cell.style.animationDelay = (i * 12) + 'ms';
      }
    }
    setMessage('✅ ¡Sudoku resuelto exitosamente!', 'success');
  } else {
    setMessage('🚨 Este Sudoku no se puede resolver', 'error');
    document.querySelectorAll(".cell").forEach(cell => cell.classList.add("alerta"));
    // Shake the grid
    const wrapper = document.querySelector('.grid-wrapper');
    if (wrapper) {
      wrapper.classList.add('shake');
      wrapper.addEventListener('animationend', () => wrapper.classList.remove('shake'), { once: true });
    }
  }
}
