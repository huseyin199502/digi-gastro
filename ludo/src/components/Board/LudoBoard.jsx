/**
 * LudoVerse 3D — Ludo Board
 * Red=top-left, Green=top-right, Yellow=bottom-right, Blue=bottom-left
 * Large white squares inside quadrants with 4 colored circular spots.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';

const N = 15;

// ─── Colors ───────────────────────────────────────────────────────────────────
const CLR = {
  red:      '#e02020',
  green:    '#18aa36',
  yellow:   '#d9a800',
  blue:     '#1a6ece',
  // Home column paths (vivid, solid tones)
  redLt:    '#e85050',
  greenLt:  '#4ccc6a',
  yellowLt: '#e8c020',
  blueLt:   '#5aaae8',
};

function buildBoardTexture() {
  const C   = 136; // 136px per cell
  const PX  = N * C; // 2040px total size
  const MID = PX / 2; // 1020px center

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = PX;
  const ctx = canvas.getContext('2d');

  const R = (c, r, w, h, col) => {
    ctx.fillStyle = col;
    ctx.fillRect(c * C, r * C, w * C, h * C);
  };
  const rc = (c, r, col) => R(c, r, 1, 1, col);
  
  const arc = (cx, cy, radius, col) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
  };

  const tri = ([x1, y1], [x2, y2], [x3, y3], col) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
  };

  // ── 1. WHITE BASE ──────────────────────────────────────────────────────────
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, PX, PX);

  // ── 2. COLORED QUADRANTS ──────────────────────────────────────────────────
  R(0, 0, 6, 6, CLR.red);       // top-left  → Red
  R(9, 0, 6, 6, CLR.green);     // top-right → Green
  R(9, 9, 6, 6, CLR.yellow);    // bot-right → Yellow
  R(0, 9, 6, 6, CLR.blue);      // bot-left  → Blue

  // ── 3. LARGE WHITE SQUARES INSIDE QUADRANTS ────────────────────────────────
  // leaves a nice 1-cell border of the quadrant's primary color
  R(1, 1, 4, 4, '#ffffff');
  R(10, 1, 4, 4, '#ffffff');
  R(10, 10, 4, 4, '#ffffff');
  R(1, 10, 4, 4, '#ffffff');

  // ── 4. 4 COLORED CIRCULAR SPOTS INSIDE WHITE SQUARES ───────────────────────
  const spotRadius = 0.42 * C;
  // Red quadrant circles (top-left)
  arc(1.9 * C, 1.9 * C, spotRadius, CLR.red);
  arc(1.9 * C, 4.1 * C, spotRadius, CLR.red);
  arc(4.1 * C, 1.9 * C, spotRadius, CLR.red);
  arc(4.1 * C, 4.1 * C, spotRadius, CLR.red);

  // Green quadrant circles (top-right)
  arc(10.9 * C, 1.9 * C, spotRadius, CLR.green);
  arc(10.9 * C, 4.1 * C, spotRadius, CLR.green);
  arc(13.1 * C, 1.9 * C, spotRadius, CLR.green);
  arc(13.1 * C, 4.1 * C, spotRadius, CLR.green);

  // Yellow quadrant circles (bottom-right)
  arc(10.9 * C, 10.9 * C, spotRadius, CLR.yellow);
  arc(10.9 * C, 13.1 * C, spotRadius, CLR.yellow);
  arc(13.1 * C, 10.9 * C, spotRadius, CLR.yellow);
  arc(13.1 * C, 13.1 * C, spotRadius, CLR.yellow);

  // Blue quadrant circles (bottom-left)
  arc(1.9 * C, 10.9 * C, spotRadius, CLR.blue);
  arc(1.9 * C, 13.1 * C, spotRadius, CLR.blue);
  arc(4.1 * C, 10.9 * C, spotRadius, CLR.blue);
  arc(4.1 * C, 13.1 * C, spotRadius, CLR.blue);

  // ── 5. HOME COLUMN STRIPS ──────────────────────────────────────────────────
  for (let c = 1; c <= 5; c++) rc(c, 7, CLR.redLt);     // Red    left→center
  for (let r = 1; r <= 5; r++) rc(7, r, CLR.greenLt);   // Green  top→center
  for (let c = 9; c <= 13; c++) rc(c, 7, CLR.yellowLt); // Yellow right→center
  for (let r = 9; r <= 13; r++) rc(7, r, CLR.blueLt);   // Blue   bot→center

  // ── 5a. START SQUARES COLORING ─────────────────────────────────────────────
  rc(1, 6, CLR.red);
  rc(8, 1, CLR.green);
  rc(13, 8, CLR.yellow);
  rc(6, 13, CLR.blue);

  // ── 6. CENTER TRIANGLES (Home Area) ────────────────────────────────────────
  const L = 6 * C, R2 = 9 * C, T = 6 * C, B = 9 * C;
  tri([MID, MID], [L, T], [L, B], CLR.red);       // Left   → Red
  tri([MID, MID], [L, T], [R2, T], CLR.green);    // Top    → Green
  tri([MID, MID], [R2, T], [R2, B], CLR.yellow);  // Right  → Yellow
  tri([MID, MID], [L, B], [R2, B], CLR.blue);     // Bottom → Blue

  // Center star disc
  arc(MID, MID, 0.65 * C, '#ffffff');
  ctx.fillStyle = '#cccccc';
  ctx.font = `bold ${Math.round(0.72 * C)}px serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('★', MID, MID + 3);

  // ── 7. SAFE SQUARE STAR MARKERS ───────────────────────────────────────────
  [[1, 6], [6, 2], [8, 0], [13, 6], [14, 8], [8, 13], [6, 14], [0, 8]].forEach(([c, r]) => {
    const cx = c * C + C / 2, cy = r * C + C / 2;
    const isStart = (c === 1 && r === 6) || (c === 8 && r === 1) || (c === 13 && r === 8) || (c === 6 && r === 13);
    if (isStart) {
      arc(cx, cy, 0.38 * C, 'rgba(255, 255, 255, 0.35)');
      ctx.fillStyle = '#ffffff';
    } else {
      arc(cx, cy, 0.38 * C, '#ebebeb');
      ctx.fillStyle = '#aaaaaa';
    }
    ctx.font = `${Math.round(0.4 * C)}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('★', cx, cy + 2);
  });

  // ── 8. DIRECTION ARROWS ────────────────────────────────────────────────────
  const arrow = (c, r, ch) => {
    ctx.fillStyle = '#888888';
    ctx.font = `${Math.round(0.36 * C)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(ch, c * C + C / 2, r * C + C / 2 + 2);
  };
  const arrowWhite = (c, r, ch) => {
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(0.38 * C)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(ch, c * C + C / 2, r * C + C / 2 + 2);
  };

  arrow(6, 7, '▶'); arrow(7, 6, '▼'); arrow(8, 7, '◀'); arrow(7, 8, '▲');
  arrow(6, 1, '▲'); arrow(8, 13, '▼'); arrow(1, 8, '◀'); arrow(13, 6, '▶');
  arrowWhite(1, 6, '▶');
  arrowWhite(8, 1, '▼');
  arrowWhite(13, 8, '◀');
  arrowWhite(6, 13, '▲');

  // ── 9. GRID LINES (Main path white squares) ────────────────────────────────
  ctx.strokeStyle = '#777777'; ctx.lineWidth = 6;

  // Horizontal path strips (row 6–8): full width grid
  for (let c = 0; c <= N; c++) {
    ctx.beginPath(); ctx.moveTo(c * C, 6 * C); ctx.lineTo(c * C, 9 * C); ctx.stroke();
  }
  // Vertical path strips (col 6–8): full height grid
  for (let r = 0; r <= N; r++) {
    ctx.beginPath(); ctx.moveTo(6 * C, r * C); ctx.lineTo(9 * C, r * C); ctx.stroke();
  }
  // Top/bottom path column (col 6–9, rows 0–5 and 9–14)
  for (let c = 6; c <= 9; c++) {
    ctx.beginPath(); ctx.moveTo(c * C, 0); ctx.lineTo(c * C, 6 * C); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(c * C, 9 * C); ctx.lineTo(c * C, N * C); ctx.stroke();
  }
  // Left/right path rows (row 6–9, cols 0–5 and 9–14)
  for (let r = 6; r <= 9; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * C); ctx.lineTo(6 * C, r * C); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(9 * C, r * C); ctx.lineTo(N * C, r * C); ctx.stroke();
  }

  // ── 10. BORDERS ────────────────────────────────────────────────────────────
  // Outer board border
  ctx.strokeStyle = '#222222'; ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, N * C - 4, N * C - 4);
  // Section dividers (path from home yards)
  ctx.strokeStyle = '#333333'; ctx.lineWidth = 2;
  [[6, 0, 6, N], [9, 0, 9, N], [0, 6, N, 6], [0, 9, N, 9]].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath(); ctx.moveTo(x1 * C, y1 * C); ctx.lineTo(x2 * C, y2 * C); ctx.stroke();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 16;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

export default function LudoBoard() {
  const boardTex = useMemo(() => buildBoardTexture(), []);
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[N, N]} />
        <meshStandardMaterial map={boardTex} roughness={0.3} metalness={0.0} />
      </mesh>
      <mesh receiveShadow position={[0, -0.04, 0]}>
        <boxGeometry args={[N + 0.05, 0.08, N + 0.05]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.8} />
      </mesh>
    </group>
  );
}
