// Sudoku solver optimizado: bitmasks + MRV (Minimum Remaining Values)

#include <stdio.h>
#include <stdlib.h>
#include <emscripten/emscripten.h>

#define N 9

int grid[N][N];

static int rowMask[N];
static int colMask[N];
static int boxMask[N];

static inline int boxIndex(int r, int c) {
    return (r / 3) * 3 + (c / 3);
}

static void buildMasks(void) {
    for (int i = 0; i < N; i++) {
        rowMask[i] = 0;
        colMask[i] = 0;
        boxMask[i] = 0;
    }
    for (int r = 0; r < N; r++) {
        for (int c = 0; c < N; c++) {
            int v = grid[r][c];
            if (v > 0) {
                int bit = 1 << (v - 1);
                rowMask[r] |= bit;
                colMask[c] |= bit;
                boxMask[boxIndex(r, c)] |= bit;
            }
        }
    }
}

// Cuenta bits encendidos (popcount)
static inline int popcount(int x) {
    int count = 0;
    while (x) { x &= x - 1; count++; }
    return count;
}

/* Backtracking con MRV: en cada paso buscamos la celda vacía con menos
   candidatos posibles. Eso poda el arbol drasticamente frente al enfoque
   naive que recorre las celdas en orden. */
static int solveMRV(void) {
    int bestR = -1, bestC = -1;
    int bestMask = 0;
    int bestCount = 10;

    for (int r = 0; r < N && bestCount > 1; r++) {
        for (int c = 0; c < N; c++) {
            if (grid[r][c] != 0) continue;
            int used = rowMask[r] | colMask[c] | boxMask[boxIndex(r, c)];
            int available = (~used) & 0x1FF; // 9 bits
            int cnt = popcount(available);
            if (cnt == 0) return 0; // sin candidatos -> fallo
            if (cnt < bestCount) {
                bestCount = cnt;
                bestMask = available;
                bestR = r;
                bestC = c;
                if (cnt == 1) break; // no hay mejor que 1
            }
        }
    }

    if (bestR == -1) return 1; // no quedan vacias -> resuelto

    int b = boxIndex(bestR, bestC);
    int mask = bestMask;
    while (mask) {
        int bit = mask & -mask; // bit mas bajo
        mask ^= bit;

        // num en base 1 (no se usa directo, pero lo guardamos en la grid)
        int num = 0;
        int tmp = bit;
        while (tmp > 1) { tmp >>= 1; num++; }
        num++;

        grid[bestR][bestC] = num;
        rowMask[bestR] |= bit;
        colMask[bestC] |= bit;
        boxMask[b] |= bit;

        if (solveMRV()) return 1;

        grid[bestR][bestC] = 0;
        rowMask[bestR] ^= bit;
        colMask[bestC] ^= bit;
        boxMask[b] ^= bit;
    }
    return 0;
}

EMSCRIPTEN_KEEPALIVE
void set_cell(int i, int value) {
    grid[i / 9][i % 9] = value;
}

EMSCRIPTEN_KEEPALIVE
int get_cell(int i) {
    return grid[i / 9][i % 9];
}

EMSCRIPTEN_KEEPALIVE
int solve() {
    buildMasks();
    // Validar que el puzzle de entrada no tenga conflictos obvios
    for (int r = 0; r < N; r++) {
        for (int c = 0; c < N; c++) {
            int v = grid[r][c];
            if (v > 0) {
                int bit = 1 << (v - 1);
                int other = (rowMask[r] | colMask[c] | boxMask[boxIndex(r, c)]) ^ bit;
                // verificar que no haya duplicado: quitamos este bit y si aparece de nuevo hay conflicto
                int dupRow = 0, dupCol = 0, dupBox = 0;
                for (int x = 0; x < N; x++) {
                    if (x != c && grid[r][x] == v) dupRow = 1;
                    if (x != r && grid[x][c] == v) dupCol = 1;
                }
                int sr = (r/3)*3, sc = (c/3)*3;
                for (int i = 0; i < 3; i++)
                    for (int j = 0; j < 3; j++) {
                        int rr = sr+i, cc = sc+j;
                        if ((rr != r || cc != c) && grid[rr][cc] == v) dupBox = 1;
                    }
                if (dupRow || dupCol || dupBox) return 0;
                (void)other;
            }
        }
    }
    return solveMRV();
}

EMSCRIPTEN_KEEPALIVE
void clean_grid(){
    for (int i = 0; i < 81; i++){
        set_cell(i,0);
    }
}
