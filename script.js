let setCell, getCell, solve, cleanGrid;

window.onload = () => {
  setCell = Module.cwrap('set_cell', null, ['number', 'number']);
  getCell = Module.cwrap('get_cell', 'number', ['number']);
  solve = Module.cwrap('solve', 'number', []);
  cleanGrid = Module.cwrap('clean_grid', null, []);
};

function clearAlerta(){
  document.querySelectorAll(".cell").forEach(cell => cell.classList.remove("alerta"));
}

window.pressBlock = function(i){
    clearAlerta();
    document.getElementById("message").textContent = "";
    const id = 'cell' + String(i);
    const cell = document.getElementById(id);
    var content = cell.textContent;

    if (content == '') {
        content = '1';
    } else if (parseInt(content) >= 1 && parseInt(content) < 9){
        content = String(parseInt(content) + 1);
    } else if (content == '9'){
        content = '';
    }

    cell.textContent = content;

    if (content == ''){
        content = '0';
    }

    setCell(i, parseInt(content));
};

window.clearGrid = function(){
  cleanGrid();
  for (let i = 0; i < 81; i++){
    let id = 'cell' + String(i);
    document.getElementById(id).textContent = '';
  }
  document.getElementById("message").textContent = "";
  clearAlerta();
}

window.solveGrid = function(){
  console.log("Resolviendo...");
  var solved = solve();
  if (solved == 1){
    for (let i = 0; i < 81; i++){
      let id = 'cell' + String(i);
      document.getElementById(id).textContent = String(getCell(i));
    }
  } else{
    document.getElementById("message").textContent = "🚨Este sudoku no se puede resolver🚨";
    document.querySelectorAll(".cell").forEach(cell => cell.classList.add("alerta"));
  }
}
