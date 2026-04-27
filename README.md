# Sudoku Solver

Proyecto web simple para ingresar un Sudoku y resolverlo desde el navegador. La interfaz esta hecha con HTML/CSS/JavaScript y la parte que resuelve el tablero esta escrita en C, compilada a WebAssembly con Emscripten.

No es una aplicacion gigante ni con framework: la idea es que se pueda abrir, probar y entender rapido.

## Que hace

- Muestra un tablero de Sudoku de 9x9.
- Permite ingresar numeros haciendo click sobre cada casilla.
- Resuelve el Sudoku usando una funcion en WebAssembly.
- Limpia el tablero para probar otro caso.
- Marca el tablero si el Sudoku no tiene solucion.

## Archivos principales

- `index.html`: contiene la pantalla, estilos y crea la grilla.
- `script.js`: conecta la interfaz con las funciones exportadas desde WebAssembly.
- `sodoku_solver.c`: version base del solver en C.
- `sudoku_solver2.c`: version optimizada con bitmasks y MRV.
- `sodoku_solver.js` y `sodoku_solver.wasm`: archivos generados por Emscripten que usa el navegador.

Ojo: algunos archivos se llaman `sodoku` en vez de `sudoku`. Se mantiene asi porque el `index.html` ya esta apuntando a esos nombres.

## Como ejecutarlo

Como el proyecto carga un archivo `.wasm`, conviene levantar un servidor local en la carpeta del proyecto.

Con Python:

```bash
python -m http.server 8000
```

Despues abrir:

```text
http://localhost:8000
```

Tambien se puede usar cualquier servidor estatico, por ejemplo Live Server de VS Code.

## Como se usa

1. Abrir la pagina.
2. Hacer click en una casilla para ir cambiando entre `1` y `9`.
3. Dejar la casilla vacia si no tiene numero.
4. Presionar **Resolver**.
5. Usar **Limpiar** para reiniciar el tablero.

## Recompilar el WebAssembly

Si se cambia el codigo C, hay que volver a generar los archivos `.js` y `.wasm`.

Ejemplo usando la version optimizada:

```bash
emcc sudoku_solver2.c -o sodoku_solver.js \
  -s WASM=1 \
  -s EXPORTED_RUNTIME_METHODS='["cwrap"]'
```

Tambien se puede compilar `sodoku_solver.c` si se quiere usar la version mas basica.

Para esto se necesita tener instalado Emscripten y tener disponible el comando `emcc`.

## Como funciona por dentro

El JavaScript llama funciones del modulo WebAssembly usando `Module.cwrap`:

- `set_cell`: guarda un numero en una posicion del tablero.
- `get_cell`: obtiene el numero de una posicion.
- `solve`: intenta resolver el Sudoku.
- `clean_grid`: limpia la grilla interna.

La version optimizada (`sudoku_solver2.c`) usa backtracking, pero elige primero la celda con menos candidatos posibles. Eso hace que no pruebe tantas combinaciones como un recorrido completamente naive.

## Cosas pendientes o mejorables

- Permitir escribir numeros con teclado, no solo con clicks.
- Mejorar los mensajes visuales cuando hay errores.
- Separar el CSS en un archivo aparte.
- Arreglar detalles de encoding si aparecen caracteres raros en el navegador.
- Agregar algunos Sudokus de ejemplo para probar mas rapido.
