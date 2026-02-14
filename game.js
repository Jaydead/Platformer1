// ============================================================
// PIXEL QUEST - A Pixel Art Platformer
// ============================================================

// ============================================================
// 1. CONSTANTS & CONFIG
// ============================================================
const CANVAS_W = 480;
const CANVAS_H = 270;
const TILE = 16;
const GRAVITY = 0.55;
const MAX_FALL = 8;
const PLAYER_SPEED = 2.2;
const JUMP_FORCE = -7.5;
const COYOTE_TIME = 6;
const JUMP_BUFFER = 8;
const FPS = 60;
const FRAME_TIME = 1000 / FPS;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// ============================================================
// 2. COLOR PALETTE (16 colors)
// ============================================================
const PALETTE = [
    'transparent',   // 0
    '#0d1b2a',       // 1  dark navy
    '#1b2838',       // 2  dark blue
    '#2d4a3e',       // 3  dark green
    '#4a7c59',       // 4  green
    '#8fbc8f',       // 5  light green
    '#f0e68c',       // 6  yellow
    '#e8a735',       // 7  orange
    '#c0392b',       // 8  red
    '#8e44ad',       // 9  purple
    '#3498db',       // 10 blue
    '#ecf0f1',       // 11 white
    '#95a5a6',       // 12 gray
    '#5d4e37',       // 13 brown
    '#8b7355',       // 14 light brown
    '#f5cba7',       // 15 skin/peach
];

// ============================================================
// 3. UTILITY FUNCTIONS
// ============================================================
function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function rnd(min, max) { return Math.random() * (max - min) + min; }
function rndInt(min, max) { return Math.floor(rnd(min, max + 1)); }

function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
}

// Create offscreen canvas from pixel data
function createSprite(pixelData, scale) {
    scale = scale || 1;
    const h = pixelData.length;
    const w = pixelData[0].length;
    const c = document.createElement('canvas');
    c.width = w * scale;
    c.height = h * scale;
    const cx = c.getContext('2d');
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const ci = pixelData[y][x];
            if (ci === 0) continue;
            cx.fillStyle = PALETTE[ci];
            cx.fillRect(x * scale, y * scale, scale, scale);
        }
    }
    return c;
}

function createFlipped(spriteCanvas) {
    const c = document.createElement('canvas');
    c.width = spriteCanvas.width;
    c.height = spriteCanvas.height;
    const cx = c.getContext('2d');
    cx.translate(c.width, 0);
    cx.scale(-1, 1);
    cx.drawImage(spriteCanvas, 0, 0);
    return c;
}

// ============================================================
// 4. SPRITE DATA
// ============================================================
// Player sprites (20x24) - little adventurer
const PLAYER_IDLE_1 = [
    [0,0,0,0,0,0,0,8,8,8,8,8,8,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,8,8,8,8,8,8,8,8,0,0,0,0,0,0],
    [0,0,0,0,0,8,8,6,6,6,6,6,6,8,8,0,0,0,0,0],
    [0,0,0,0,0,8,6,6,6,6,6,6,6,6,8,0,0,0,0,0],
    [0,0,0,0,0,15,15,15,15,15,15,15,15,15,0,0,0,0,0,0],
    [0,0,0,0,15,15,15,15,15,15,15,15,15,15,15,0,0,0,0,0],
    [0,0,0,0,15,15,1,11,15,15,15,11,1,15,15,0,0,0,0,0],
    [0,0,0,0,15,15,1,1,15,15,15,1,1,15,15,0,0,0,0,0],
    [0,0,0,0,0,15,15,15,15,8,15,15,15,15,0,0,0,0,0,0],
    [0,0,0,0,0,15,15,15,8,8,8,15,15,15,0,0,0,0,0,0],
    [0,0,0,0,0,0,15,15,15,15,15,15,15,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,10,10,10,10,10,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,10,10,10,10,10,10,10,0,0,0,0,0,0,0],
    [0,0,0,0,0,10,10,10,10,10,10,10,10,10,0,0,0,0,0,0],
    [0,0,0,0,0,10,10,10,6,6,6,10,10,10,0,0,0,0,0,0],
    [0,0,0,0,15,15,10,10,10,10,10,10,10,15,15,0,0,0,0,0],
    [0,0,0,0,15,15,10,10,10,10,10,10,10,15,15,0,0,0,0,0],
    [0,0,0,0,0,0,10,10,10,10,10,10,10,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,10,10,0,0,0,10,10,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,2,2,0,0,0,2,2,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,13,13,0,0,0,13,13,0,0,0,0,0,0,0],
    [0,0,0,0,0,13,13,13,0,0,0,13,13,13,0,0,0,0,0,0],
    [0,0,0,0,0,13,13,13,0,0,0,13,13,13,0,0,0,0,0,0],
    [0,0,0,0,0,14,14,14,0,0,0,14,14,14,0,0,0,0,0,0],
];

const PLAYER_IDLE_2 = [
    [0,0,0,0,0,0,0,8,8,8,8,8,8,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,8,8,8,8,8,8,8,8,0,0,0,0,0,0],
    [0,0,0,0,0,8,8,6,6,6,6,6,6,8,8,0,0,0,0,0],
    [0,0,0,0,0,8,6,6,6,6,6,6,6,6,8,0,0,0,0,0],
    [0,0,0,0,0,15,15,15,15,15,15,15,15,15,0,0,0,0,0,0],
    [0,0,0,0,15,15,15,15,15,15,15,15,15,15,15,0,0,0,0,0],
    [0,0,0,0,15,15,1,11,15,15,15,11,1,15,15,0,0,0,0,0],
    [0,0,0,0,15,15,1,1,15,15,15,1,1,15,15,0,0,0,0,0],
    [0,0,0,0,0,15,15,15,15,8,15,15,15,15,0,0,0,0,0,0],
    [0,0,0,0,0,15,15,15,8,8,8,15,15,15,0,0,0,0,0,0],
    [0,0,0,0,0,0,15,15,15,15,15,15,15,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,10,10,10,10,10,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,10,10,10,10,10,10,10,0,0,0,0,0,0,0],
    [0,0,0,0,0,10,10,10,10,10,10,10,10,10,0,0,0,0,0,0],
    [0,0,0,0,0,10,10,10,6,6,6,10,10,10,0,0,0,0,0,0],
    [0,0,0,0,15,15,10,10,10,10,10,10,10,15,15,0,0,0,0,0],
    [0,0,0,0,15,15,10,10,10,10,10,10,10,15,15,0,0,0,0,0],
    [0,0,0,0,0,0,10,10,10,10,10,10,10,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,10,10,0,0,0,10,10,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,2,2,0,0,0,2,2,0,0,0,0,0,0,0],
    [0,0,0,0,0,13,13,13,0,0,0,13,13,13,0,0,0,0,0,0],
    [0,0,0,0,0,13,13,13,0,0,0,13,13,13,0,0,0,0,0,0],
    [0,0,0,0,0,14,14,14,0,0,0,14,14,14,0,0,0,0,0,0],
    [0,0,0,0,0,14,14,14,0,0,0,14,14,14,0,0,0,0,0,0],
];

const PLAYER_RUN_1 = [
    [0,0,0,0,0,0,0,8,8,8,8,8,8,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,8,8,8,8,8,8,8,8,0,0,0,0,0,0],
    [0,0,0,0,0,8,8,6,6,6,6,6,6,8,8,0,0,0,0,0],
    [0,0,0,0,0,8,6,6,6,6,6,6,6,6,8,0,0,0,0,0],
    [0,0,0,0,0,15,15,15,15,15,15,15,15,15,0,0,0,0,0,0],
    [0,0,0,0,15,15,15,15,15,15,15,15,15,15,15,0,0,0,0,0],
    [0,0,0,0,15,15,1,11,15,15,15,11,1,15,15,0,0,0,0,0],
    [0,0,0,0,15,15,1,1,15,15,15,1,1,15,15,0,0,0,0,0],
    [0,0,0,0,0,15,15,15,15,8,15,15,15,15,0,0,0,0,0,0],
    [0,0,0,0,0,15,15,15,8,8,8,15,15,15,0,0,0,0,0,0],
    [0,0,0,0,0,0,15,15,15,15,15,15,15,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,10,10,10,10,10,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,10,10,10,10,10,10,10,10,0,0,0,0,0,0,0],
    [0,0,0,0,10,10,10,10,10,10,10,10,10,10,0,0,0,0,0,0],
    [0,0,0,0,10,10,10,10,6,6,6,10,10,10,15,0,0,0,0,0],
    [0,0,0,15,15,10,10,10,10,10,10,10,10,0,0,0,0,0,0,0],
    [0,0,0,0,15,10,10,10,10,10,10,10,10,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,10,10,10,10,10,10,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,2,2,0,0,10,10,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,13,13,0,0,0,0,2,2,0,0,0,0,0,0,0],
    [0,0,0,0,13,13,13,0,0,0,0,0,13,13,0,0,0,0,0,0],
    [0,0,0,0,14,14,0,0,0,0,0,0,13,13,13,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,14,14,14,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0],
];

const PLAYER_RUN_2 = [
    [0,0,0,0,0,0,0,8,8,8,8,8,8,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,8,8,8,8,8,8,8,8,0,0,0,0,0,0],
    [0,0,0,0,0,8,8,6,6,6,6,6,6,8,8,0,0,0,0,0],
    [0,0,0,0,0,8,6,6,6,6,6,6,6,6,8,0,0,0,0,0],
    [0,0,0,0,0,15,15,15,15,15,15,15,15,15,0,0,0,0,0,0],
    [0,0,0,0,15,15,15,15,15,15,15,15,15,15,15,0,0,0,0,0],
    [0,0,0,0,15,15,1,11,15,15,15,11,1,15,15,0,0,0,0,0],
    [0,0,0,0,15,15,1,1,15,15,15,1,1,15,15,0,0,0,0,0],
    [0,0,0,0,0,15,15,15,15,8,15,15,15,15,0,0,0,0,0,0],
    [0,0,0,0,0,15,15,15,8,8,8,15,15,15,0,0,0,0,0,0],
    [0,0,0,0,0,0,15,15,15,15,15,15,15,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,10,10,10,10,10,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,10,10,10,10,10,10,10,0,0,0,0,0,0,0],
    [0,0,0,0,0,10,10,10,10,10,10,10,10,10,0,0,0,0,0,0],
    [0,0,0,0,0,10,10,10,6,6,6,10,10,10,0,0,0,0,0,0],
    [0,0,0,0,0,15,10,10,10,10,10,10,10,15,0,0,0,0,0,0],
    [0,0,0,0,0,0,10,10,10,10,10,10,10,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,10,10,0,10,10,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,13,13,0,0,0,13,13,0,0,0,0,0,0,0],
    [0,0,0,0,0,13,13,13,0,0,0,13,13,0,0,0,0,0,0,0],
    [0,0,0,0,0,14,14,0,0,0,0,14,14,14,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,14,14,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const PLAYER_JUMP = [
    [0,0,0,0,0,0,0,8,8,8,8,8,8,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,8,8,8,8,8,8,8,8,0,0,0,0,0,0],
    [0,0,0,0,0,8,8,6,6,6,6,6,6,8,8,0,0,0,0,0],
    [0,0,0,0,0,8,6,6,6,6,6,6,6,6,8,0,0,0,0,0],
    [0,0,0,0,0,15,15,15,15,15,15,15,15,15,0,0,0,0,0,0],
    [0,0,0,0,15,15,15,15,15,15,15,15,15,15,15,0,0,0,0,0],
    [0,0,0,0,15,15,1,11,15,15,15,11,1,15,15,0,0,0,0,0],
    [0,0,0,0,15,15,1,1,15,15,15,1,1,15,15,0,0,0,0,0],
    [0,0,0,0,0,15,15,15,15,8,15,15,15,15,0,0,0,0,0,0],
    [0,0,0,0,0,15,15,15,8,8,8,15,15,15,0,0,0,0,0,0],
    [0,0,0,0,0,0,15,15,15,15,15,15,15,0,0,0,0,0,0,0],
    [0,0,0,15,0,0,0,10,10,10,10,10,0,0,0,15,0,0,0,0],
    [0,0,15,15,0,0,10,10,10,10,10,10,10,0,0,15,15,0,0,0],
    [0,0,15,0,0,10,10,10,10,10,10,10,10,10,0,0,15,0,0,0],
    [0,0,0,0,0,10,10,10,6,6,6,10,10,10,0,0,0,0,0,0],
    [0,0,0,0,0,10,10,10,10,10,10,10,10,10,0,0,0,0,0,0],
    [0,0,0,0,0,0,10,10,10,10,10,10,10,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,10,10,10,10,10,10,10,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,2,2,0,0,0,2,2,0,0,0,0,0,0,0],
    [0,0,0,0,0,13,13,0,0,0,0,0,13,13,0,0,0,0,0,0],
    [0,0,0,0,13,13,0,0,0,0,0,0,0,13,13,0,0,0,0,0],
    [0,0,0,0,14,14,0,0,0,0,0,0,0,14,14,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const PLAYER_FALL = [
    [0,0,0,0,0,0,0,8,8,8,8,8,8,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,8,8,8,8,8,8,8,8,0,0,0,0,0,0],
    [0,0,0,0,0,8,8,6,6,6,6,6,6,8,8,0,0,0,0,0],
    [0,0,0,0,0,8,6,6,6,6,6,6,6,6,8,0,0,0,0,0],
    [0,0,0,0,0,15,15,15,15,15,15,15,15,15,0,0,0,0,0,0],
    [0,0,0,0,15,15,15,15,15,15,15,15,15,15,15,0,0,0,0,0],
    [0,0,0,0,15,15,1,11,15,15,15,11,1,15,15,0,0,0,0,0],
    [0,0,0,0,15,15,1,1,15,15,15,1,1,15,15,0,0,0,0,0],
    [0,0,0,0,0,15,15,15,15,15,15,15,15,15,0,0,0,0,0,0],
    [0,0,0,0,0,0,15,15,8,8,8,15,15,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,15,15,15,15,15,15,15,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,10,10,10,10,10,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,10,10,10,10,10,10,10,0,0,0,0,0,0,0],
    [0,0,0,15,0,10,10,10,10,10,10,10,10,10,0,15,0,0,0,0],
    [0,0,15,15,0,10,10,10,6,6,6,10,10,10,0,15,15,0,0,0],
    [0,0,0,15,0,10,10,10,10,10,10,10,10,10,0,15,0,0,0,0],
    [0,0,0,0,0,0,10,10,10,10,10,10,10,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,10,10,10,10,10,10,10,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,2,2,0,2,2,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,13,13,0,0,0,13,13,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,13,13,0,0,0,13,13,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,14,14,0,0,0,14,14,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Slime enemy (16x16)
const SLIME_1 = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,4,4,4,4,0,0,0,0,0,0],
    [0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0],
    [0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0],
    [0,0,0,4,4,4,4,4,4,4,4,4,4,0,0,0],
    [0,0,4,4,1,11,4,4,4,1,11,4,4,4,0,0],
    [0,0,4,4,1,1,4,4,4,1,1,4,4,4,0,0],
    [0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0],
    [0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0],
    [0,4,3,4,4,4,4,4,4,4,4,4,4,3,4,0],
    [0,0,3,3,4,4,4,4,4,4,4,4,3,3,0,0],
    [0,0,0,3,3,4,4,4,4,4,4,3,3,0,0,0],
    [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
];

const SLIME_2 = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0],
    [0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0],
    [0,0,0,4,4,4,4,4,4,4,4,4,4,0,0,0],
    [0,0,4,4,1,11,4,4,4,1,11,4,4,0,0,0],
    [0,0,4,4,1,1,4,4,4,1,1,4,4,0,0,0],
    [0,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0],
    [0,4,3,4,4,4,4,4,4,4,4,4,3,4,0,0],
    [4,4,3,3,4,4,4,4,4,4,4,3,3,4,4,0],
    [4,4,4,3,3,3,4,4,4,3,3,3,4,4,4,0],
    [4,4,4,4,4,3,3,3,3,3,4,4,4,4,4,0],
];

// Bat enemy (16x16)
const BAT_1 = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,9,9,0,0,0,0,0,0,0,0,0,0,9,9,0],
    [9,9,9,9,0,0,0,0,0,0,0,0,9,9,9,9],
    [9,9,9,9,9,0,0,0,0,0,0,9,9,9,9,9],
    [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],
    [0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0],
    [0,0,9,9,8,11,9,9,9,8,11,9,9,9,0,0],
    [0,0,0,9,9,9,9,9,9,9,9,9,9,0,0,0],
    [0,0,0,0,9,9,9,9,9,9,9,9,0,0,0,0],
    [0,0,0,0,0,9,9,11,11,9,9,0,0,0,0,0],
    [0,0,0,0,0,0,9,9,9,9,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const BAT_2 = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,9,9,9,9,9,9,0,0,0,0,0],
    [0,0,0,0,9,9,9,9,9,9,9,9,0,0,0,0],
    [0,0,0,9,9,9,9,9,9,9,9,9,9,0,0,0],
    [0,0,9,9,8,11,9,9,9,8,11,9,9,0,0,0],
    [0,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0],
    [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0],
    [9,9,0,0,0,9,9,11,11,9,9,0,0,9,9,0],
    [0,0,0,0,0,0,9,9,9,9,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Coin (12x12)
const COIN_1 = [
    [0,0,0,0,6,6,6,6,0,0,0,0],
    [0,0,0,6,6,7,7,6,6,0,0,0],
    [0,0,6,6,7,7,7,7,6,6,0,0],
    [0,6,6,7,7,6,6,7,7,6,6,0],
    [6,6,7,7,6,6,6,6,7,7,6,6],
    [6,7,7,6,6,6,6,6,6,7,7,6],
    [6,7,7,6,6,6,6,6,6,7,7,6],
    [6,6,7,7,6,6,6,6,7,7,6,6],
    [0,6,6,7,7,6,6,7,7,6,6,0],
    [0,0,6,6,7,7,7,7,6,6,0,0],
    [0,0,0,6,6,7,7,6,6,0,0,0],
    [0,0,0,0,6,6,6,6,0,0,0,0],
];

const COIN_2 = [
    [0,0,0,0,0,6,6,0,0,0,0,0],
    [0,0,0,0,6,7,7,6,0,0,0,0],
    [0,0,0,6,7,7,7,7,6,0,0,0],
    [0,0,0,6,7,6,6,7,6,0,0,0],
    [0,0,0,6,6,6,6,6,6,0,0,0],
    [0,0,0,6,6,6,6,6,6,0,0,0],
    [0,0,0,6,6,6,6,6,6,0,0,0],
    [0,0,0,6,6,6,6,6,6,0,0,0],
    [0,0,0,6,7,6,6,7,6,0,0,0],
    [0,0,0,6,7,7,7,7,6,0,0,0],
    [0,0,0,0,6,7,7,6,0,0,0,0],
    [0,0,0,0,0,6,6,0,0,0,0,0],
];

// Heart (12x12)
const HEART = [
    [0,0,8,8,0,0,0,0,8,8,0,0],
    [0,8,8,8,8,0,0,8,8,8,8,0],
    [8,8,8,11,8,8,8,8,8,8,8,8],
    [8,8,11,11,8,8,8,8,8,8,8,8],
    [8,8,8,8,8,8,8,8,8,8,8,8],
    [8,8,8,8,8,8,8,8,8,8,8,8],
    [0,8,8,8,8,8,8,8,8,8,8,0],
    [0,0,8,8,8,8,8,8,8,8,0,0],
    [0,0,0,8,8,8,8,8,8,0,0,0],
    [0,0,0,0,8,8,8,8,0,0,0,0],
    [0,0,0,0,0,8,8,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
];

const HEART_EMPTY = [
    [0,0,12,12,0,0,0,0,12,12,0,0],
    [0,12,2,2,12,0,0,12,2,2,12,0],
    [12,2,2,2,2,12,12,2,2,2,2,12],
    [12,2,2,2,2,2,2,2,2,2,2,12],
    [12,2,2,2,2,2,2,2,2,2,2,12],
    [12,2,2,2,2,2,2,2,2,2,2,12],
    [0,12,2,2,2,2,2,2,2,2,12,0],
    [0,0,12,2,2,2,2,2,2,12,0,0],
    [0,0,0,12,2,2,2,2,12,0,0,0],
    [0,0,0,0,12,2,2,12,0,0,0,0],
    [0,0,0,0,0,12,12,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
];

// Key (12x16)
const KEY_SPRITE = [
    [0,0,0,0,6,6,6,6,0,0,0,0],
    [0,0,0,6,6,7,7,6,6,0,0,0],
    [0,0,6,6,7,0,0,7,6,6,0,0],
    [0,0,6,7,0,0,0,0,7,6,0,0],
    [0,0,6,7,0,0,0,0,7,6,0,0],
    [0,0,6,6,7,0,0,7,6,6,0,0],
    [0,0,0,6,6,7,7,6,6,0,0,0],
    [0,0,0,0,6,6,6,6,0,0,0,0],
    [0,0,0,0,0,6,6,0,0,0,0,0],
    [0,0,0,0,0,6,6,0,0,0,0,0],
    [0,0,0,0,0,6,6,6,6,0,0,0],
    [0,0,0,0,0,6,6,0,0,0,0,0],
    [0,0,0,0,0,6,6,0,0,0,0,0],
    [0,0,0,0,0,6,6,6,0,0,0,0],
    [0,0,0,0,0,6,6,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
];

// Tiles (16x16)
const TILE_GRASS_TOP = [
    [0,4,5,4,0,0,4,5,5,4,0,0,0,4,5,4],
    [4,4,4,4,4,4,4,5,4,4,4,4,4,4,4,4],
    [13,13,4,4,4,4,4,4,4,4,13,4,4,4,13,13],
    [13,13,13,13,4,13,13,13,13,13,13,13,4,13,13,13],
    [13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13],
    [13,14,13,13,13,13,14,13,13,13,13,13,13,14,13,13],
    [13,13,13,14,13,13,13,13,13,14,13,13,13,13,13,13],
    [13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,14],
    [14,13,13,13,13,14,13,13,13,13,13,14,13,13,13,13],
    [13,13,13,13,13,13,13,14,13,13,13,13,13,13,13,13],
    [13,13,14,13,13,13,13,13,13,13,14,13,13,13,14,13],
    [13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13],
    [13,14,13,13,14,13,13,13,14,13,13,13,13,14,13,13],
    [13,13,13,13,13,13,14,13,13,13,13,14,13,13,13,13],
    [13,13,13,14,13,13,13,13,13,14,13,13,13,13,14,13],
    [14,13,13,13,13,13,13,13,13,13,13,13,14,13,13,13],
];

const TILE_DIRT = [
    [13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13],
    [13,14,13,13,13,13,14,13,13,13,13,13,13,14,13,13],
    [13,13,13,14,13,13,13,13,13,14,13,13,13,13,13,13],
    [13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,14],
    [14,13,13,13,13,14,13,13,13,13,13,14,13,13,13,13],
    [13,13,13,13,13,13,13,14,13,13,13,13,13,13,13,13],
    [13,13,14,13,13,13,13,13,13,13,14,13,13,13,14,13],
    [13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13],
    [13,14,13,13,14,13,13,13,14,13,13,13,13,14,13,13],
    [13,13,13,13,13,13,14,13,13,13,13,14,13,13,13,13],
    [13,13,13,14,13,13,13,13,13,14,13,13,13,13,14,13],
    [14,13,13,13,13,13,13,13,13,13,13,13,14,13,13,13],
    [13,13,13,13,14,13,13,14,13,13,13,13,13,13,13,13],
    [13,14,13,13,13,13,13,13,13,13,14,13,13,14,13,13],
    [13,13,13,13,13,14,13,13,14,13,13,13,13,13,13,14],
    [13,13,14,13,13,13,13,13,13,13,13,14,13,13,13,13],
];

const TILE_STONE = [
    [12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12],
    [12,12,12,12,12,1,12,12,12,12,12,12,1,12,12,12],
    [12,12,12,1,12,12,12,12,12,1,12,12,12,12,12,12],
    [12,1,12,12,12,12,12,12,12,12,12,12,12,12,1,12],
    [12,12,12,12,12,12,1,12,12,12,12,1,12,12,12,12],
    [12,12,12,12,12,12,12,12,1,12,12,12,12,12,12,12],
    [1,12,12,12,1,12,12,12,12,12,12,12,12,1,12,12],
    [12,12,12,12,12,12,12,12,12,12,1,12,12,12,12,12],
    [12,12,1,12,12,12,12,1,12,12,12,12,12,12,12,1],
    [12,12,12,12,12,12,12,12,12,12,12,12,1,12,12,12],
    [12,12,12,12,1,12,12,12,12,1,12,12,12,12,12,12],
    [1,12,12,12,12,12,12,12,12,12,12,12,12,12,1,12],
    [12,12,12,1,12,12,1,12,12,12,12,1,12,12,12,12],
    [12,12,12,12,12,12,12,12,1,12,12,12,12,12,12,12],
    [12,1,12,12,12,12,12,12,12,12,12,12,12,1,12,12],
    [12,12,12,12,12,1,12,12,12,12,1,12,12,12,12,12],
];

const TILE_SPIKE = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,12,0,0,0,0,0,0,0,12,0,0,0,0],
    [0,0,0,12,0,0,0,12,0,0,0,12,0,0,0,0],
    [0,0,12,12,0,0,12,12,12,0,0,12,12,0,0,0],
    [0,0,12,11,12,0,12,11,12,0,12,11,12,0,0,0],
    [0,12,12,11,12,0,12,11,12,0,12,11,12,12,0,0],
    [0,12,11,11,12,12,12,11,12,12,12,11,11,12,0,0],
    [12,12,11,11,12,12,12,11,12,12,12,11,11,12,12,0],
    [12,11,11,11,12,12,11,11,11,12,12,11,11,11,12,0],
    [12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12],
];

const TILE_PLATFORM = [
    [13,14,13,14,13,14,13,14,13,14,13,14,13,14,13,14],
    [14,13,14,13,14,13,14,13,14,13,14,13,14,13,14,13],
    [13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Door (16x32 - two tiles tall)
const DOOR_TOP = [
    [0,0,0,13,13,13,13,13,13,13,13,13,13,0,0,0],
    [0,0,13,13,2,2,2,2,2,2,2,2,13,13,0,0],
    [0,13,13,2,2,2,2,2,2,2,2,2,2,13,13,0],
    [0,13,2,2,2,2,2,2,2,2,2,2,2,2,13,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,6,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,6,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
];

const DOOR_BOTTOM = [
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,2,2,10,10,10,10,10,10,10,2,2,13,0,0],
    [0,13,13,2,2,2,2,2,2,2,2,2,2,13,13,0],
    [0,13,13,13,13,13,13,13,13,13,13,13,13,13,0,0],
];

// Castle tile
const TILE_CASTLE = [
    [12,12,1,12,12,12,12,1,12,12,12,12,1,12,12,12],
    [12,12,1,12,12,12,12,1,12,12,12,12,1,12,12,12],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [12,12,12,12,1,12,12,12,12,1,12,12,12,12,1,12],
    [12,12,12,12,1,12,12,12,12,1,12,12,12,12,1,12],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [12,12,1,12,12,12,12,1,12,12,12,12,1,12,12,12],
    [12,12,1,12,12,12,12,1,12,12,12,12,1,12,12,12],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [12,12,12,12,1,12,12,12,12,1,12,12,12,12,1,12],
    [12,12,12,12,1,12,12,12,12,1,12,12,12,12,1,12],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [12,12,1,12,12,12,12,1,12,12,12,12,1,12,12,12],
    [12,12,1,12,12,12,12,1,12,12,12,12,1,12,12,12],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [12,12,12,12,1,12,12,12,12,1,12,12,12,12,1,12],
];

// Boss enemy (24x24)
const BOSS_1 = [
    [0,0,0,0,0,0,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0],
    [0,0,0,0,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0],
    [0,0,0,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0],
    [0,0,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0],
    [0,0,8,8,8,1,1,11,8,8,8,8,8,8,8,1,1,11,8,8,8,0,0,0],
    [0,0,8,8,8,1,1,1,8,8,8,8,8,8,8,1,1,1,8,8,8,0,0,0],
    [0,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0],
    [0,0,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0],
    [0,0,0,0,8,8,8,8,11,11,11,11,11,11,8,8,8,8,0,0,0,0],
    [0,0,0,0,0,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0],
    [0,0,0,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0,0,0],
    [0,0,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0,0],
    [0,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0],
    [0,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0],
    [0,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0],
    [0,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0],
    [0,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0],
    [0,0,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0,0],
    [0,0,0,0,9,9,9,9,9,0,0,0,0,9,9,9,9,9,0,0,0,0,0,0],
    [0,0,0,0,9,9,9,9,0,0,0,0,0,0,9,9,9,9,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,1,1,9,9,1,1,0,0,0,0,1,1,9,9,1,1,0,0,0,0,0],
    [0,0,0,1,1,9,9,1,1,0,0,0,0,1,1,9,9,1,1,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
];

// ============================================================
// 5. SPRITE CACHE
// ============================================================
const sprites = {};

function initSprites() {
    sprites.playerIdle = [createSprite(PLAYER_IDLE_1), createSprite(PLAYER_IDLE_2)];
    sprites.playerRun = [createSprite(PLAYER_RUN_1), createSprite(PLAYER_RUN_2)];
    sprites.playerJump = [createSprite(PLAYER_JUMP)];
    sprites.playerFall = [createSprite(PLAYER_FALL)];

    sprites.playerIdleL = sprites.playerIdle.map(createFlipped);
    sprites.playerRunL = sprites.playerRun.map(createFlipped);
    sprites.playerJumpL = sprites.playerJump.map(createFlipped);
    sprites.playerFallL = sprites.playerFall.map(createFlipped);

    sprites.slime = [createSprite(SLIME_1), createSprite(SLIME_2)];
    sprites.slimeL = sprites.slime.map(createFlipped);
    sprites.bat = [createSprite(BAT_1), createSprite(BAT_2)];
    sprites.boss = [createSprite(BOSS_1)];
    sprites.bossL = sprites.boss.map(createFlipped);

    sprites.coin = [createSprite(COIN_1), createSprite(COIN_2)];
    sprites.heart = createSprite(HEART);
    sprites.heartEmpty = createSprite(HEART_EMPTY);
    sprites.key = createSprite(KEY_SPRITE);

    sprites.grassTop = createSprite(TILE_GRASS_TOP);
    sprites.dirt = createSprite(TILE_DIRT);
    sprites.stone = createSprite(TILE_STONE);
    sprites.spike = createSprite(TILE_SPIKE);
    sprites.platform = createSprite(TILE_PLATFORM);
    sprites.doorTop = createSprite(DOOR_TOP);
    sprites.doorBottom = createSprite(DOOR_BOTTOM);
    sprites.castle = createSprite(TILE_CASTLE);
}

// ============================================================
// 6. AUDIO SYSTEM (Web Audio API)
// ============================================================
let audioCtx = null;

function initAudio() {
    if (audioCtx) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
}

function playTone(freq, dur, type, vol, ramp) {
    if (!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, audioCtx.currentTime);
    if (ramp) o.frequency.linearRampToValueAtTime(ramp, audioCtx.currentTime + dur);
    g.gain.setValueAtTime(vol || 0.15, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + dur);
}

function sfxJump() { playTone(250, 0.15, 'square', 0.1, 500); }
function sfxCoin() {
    playTone(800, 0.1, 'square', 0.1);
    setTimeout(() => playTone(1200, 0.15, 'square', 0.1), 60);
}
function sfxHurt() { playTone(150, 0.2, 'sawtooth', 0.15, 50); }
function sfxEnemyHit() { playTone(100, 0.15, 'square', 0.12, 50); }
function sfxKey() {
    playTone(600, 0.1, 'square', 0.1);
    setTimeout(() => playTone(900, 0.1, 'square', 0.1), 80);
    setTimeout(() => playTone(1200, 0.15, 'square', 0.1), 160);
}
function sfxLevelComplete() {
    [523, 659, 784, 1047].forEach((f, i) => {
        setTimeout(() => playTone(f, 0.2, 'square', 0.12), i * 120);
    });
}
function sfxDeath() {
    playTone(400, 0.1, 'sawtooth', 0.15, 200);
    setTimeout(() => playTone(200, 0.3, 'sawtooth', 0.12, 50), 100);
}
function sfxSelect() { playTone(600, 0.08, 'square', 0.08); }

// Simple background music
let musicOscs = [];
let musicPlaying = false;
let musicInterval = null;

function startMusic() {
    if (!audioCtx || musicPlaying) return;
    musicPlaying = true;
    const bassNotes = [130, 165, 110, 146];
    let noteIdx = 0;
    musicInterval = setInterval(() => {
        if (!audioCtx) return;
        const freq = bassNotes[noteIdx % bassNotes.length];
        playTone(freq, 0.3, 'triangle', 0.06);
        playTone(freq * 2, 0.15, 'square', 0.03);
        noteIdx++;
    }, 400);
}

function stopMusic() {
    musicPlaying = false;
    if (musicInterval) { clearInterval(musicInterval); musicInterval = null; }
}

// ============================================================
// 7. INPUT SYSTEM
// ============================================================
const keys = {};
let keysThisFrame = {};
let jumpHeld = false;
let jumpReleasedSinceLastJump = true;

window.addEventListener('keydown', (e) => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Enter','Escape','KeyW','KeyA','KeyS','KeyD'].includes(e.code)) {
        e.preventDefault();
    }
    if (!keys[e.code]) keysThisFrame[e.code] = true;
    keys[e.code] = true;
    if (e.code === 'Space') jumpHeld = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    if (e.code === 'Space') {
        jumpHeld = false;
        jumpReleasedSinceLastJump = true;
    }
});

function isLeft() { return keys['ArrowLeft'] || keys['KeyA']; }
function isRight() { return keys['ArrowRight'] || keys['KeyD']; }
function isUp() { return keys['ArrowUp'] || keys['KeyW']; }
function isJumpHeld() { return jumpHeld; }
function justPressed(code) { return keysThisFrame[code]; }
function isJumpPressed() { return keysThisFrame['Space']; }
function isEnterPressed() { return keysThisFrame['Enter'] || keysThisFrame['Space']; }
function isEscapePressed() { return keysThisFrame['Escape']; }

// ============================================================
// 8. CAMERA
// ============================================================
const camera = { x: 0, y: 0 };

function updateCamera(target, levelW, levelH) {
    const tx = target.x + target.w / 2 - CANVAS_W / 2;
    const ty = target.y + target.h / 2 - CANVAS_H / 2;
    camera.x = lerp(camera.x, tx, 0.1);
    camera.y = lerp(camera.y, ty, 0.1);
    camera.x = clamp(camera.x, 0, Math.max(0, levelW - CANVAS_W));
    camera.y = clamp(camera.y, 0, Math.max(0, levelH - CANVAS_H));
}

// ============================================================
// 9. PARTICLE SYSTEM
// ============================================================
let particles = [];

function spawnParticle(x, y, color, dx, dy, life, size) {
    particles.push({ x, y, color, dx, dy, life, maxLife: life, size: size || 2 });
}

function spawnDust(x, y) {
    for (let i = 0; i < 4; i++) {
        spawnParticle(x + rnd(-4, 4), y, '#d4c5a9', rnd(-1, 1), rnd(-2, -0.5), rndInt(10, 20), 2);
    }
}

function spawnCoinParticles(x, y) {
    for (let i = 0; i < 8; i++) {
        spawnParticle(x + rnd(-4, 4), y + rnd(-4, 4), PALETTE[6], rnd(-2, 2), rnd(-3, -0.5), rndInt(15, 25), rndInt(1, 3));
    }
}

function spawnHitParticles(x, y) {
    for (let i = 0; i < 6; i++) {
        spawnParticle(x + rnd(-4, 4), y + rnd(-4, 4), PALETTE[11], rnd(-2, 2), rnd(-2, 2), rndInt(8, 15), 2);
    }
}

function spawnDeathParticles(x, y) {
    for (let i = 0; i < 15; i++) {
        const c = [PALETTE[8], PALETTE[7], PALETTE[11]][rndInt(0, 2)];
        spawnParticle(x + rnd(-8, 8), y + rnd(-8, 8), c, rnd(-3, 3), rnd(-4, 1), rndInt(20, 40), rndInt(2, 4));
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.1;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    for (const p of particles) {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(p.x - camera.x), Math.floor(p.y - camera.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;
}

// Screen shake
let shakeTimer = 0;
let shakeMagnitude = 0;

function screenShake(mag, dur) {
    shakeMagnitude = mag;
    shakeTimer = dur;
}

// ============================================================
// 10. TILE MAP & COLLISION
// ============================================================
// Tile types: 0=air, 1=grassTop, 2=dirt, 3=stone, 4=spike, 5=platform, 6=doorTop, 7=doorBottom, 8=castle
const TILE_SOLID = { 1: true, 2: true, 3: true, 8: true };
const TILE_ONEWAY = { 5: true };
const TILE_DEADLY = { 4: true };

function getTile(level, col, row) {
    if (!level.map[row] || col < 0 || col >= level.map[0].length) return 0;
    return level.map[row][col];
}

function isSolid(level, col, row) {
    const t = getTile(level, col, row);
    return TILE_SOLID[t] || false;
}

function tileCollision(entity, level, axis) {
    const map = level.map;
    const rows = map.length;
    const cols = map[0].length;

    const left = Math.floor(entity.x / TILE);
    const right = Math.floor((entity.x + entity.w - 1) / TILE);
    const top = Math.floor(entity.y / TILE);
    const bottom = Math.floor((entity.y + entity.h - 1) / TILE);

    for (let row = top; row <= bottom; row++) {
        for (let col = left; col <= right; col++) {
            if (row < 0 || row >= rows || col < 0 || col >= cols) continue;
            const t = map[row][col];

            if (TILE_SOLID[t]) {
                const tileX = col * TILE;
                const tileY = row * TILE;

                if (axis === 'x') {
                    if (entity.vx > 0) {
                        entity.x = tileX - entity.w;
                    } else if (entity.vx < 0) {
                        entity.x = tileX + TILE;
                    }
                    entity.vx = 0;
                    return true;
                } else {
                    if (entity.vy > 0) {
                        entity.y = tileY - entity.h;
                        entity.vy = 0;
                        entity.onGround = true;
                    } else if (entity.vy < 0) {
                        entity.y = tileY + TILE;
                        entity.vy = 0;
                    }
                    return true;
                }
            }

            // One-way platforms
            if (TILE_ONEWAY[t] && axis === 'y' && entity.vy > 0) {
                const tileY = row * TILE;
                const prevBottom = entity.y + entity.h - entity.vy;
                if (prevBottom <= tileY + 2) {
                    entity.y = tileY - entity.h;
                    entity.vy = 0;
                    entity.onGround = true;
                    return true;
                }
            }

            // Deadly tiles — use a smaller hitbox (only bottom 8px of tile)
            if (TILE_DEADLY[t] && entity.isPlayer) {
                const spikeRect = {
                    x: col * TILE + 2,
                    y: row * TILE + 8,
                    w: TILE - 4,
                    h: 8
                };
                const playerRect = entity.getRect();
                if (aabb(playerRect, spikeRect)) {
                    entity.hurt();
                }
            }
        }
    }
    return false;
}

function drawTileSprite(tileType) {
    switch (tileType) {
        case 1: return sprites.grassTop;
        case 2: return sprites.dirt;
        case 3: return sprites.stone;
        case 4: return sprites.spike;
        case 5: return sprites.platform;
        case 6: return sprites.doorTop;
        case 7: return sprites.doorBottom;
        case 8: return sprites.castle;
        default: return null;
    }
}

// ============================================================
// 11. ENTITY CLASSES
// ============================================================

// --- PLAYER ---
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 14;
        this.h = 22;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.facing = 1; // 1=right, -1=left
        this.isPlayer = true;

        this.health = 3;
        this.maxHealth = 3;
        this.lives = 3;
        this.coins = 0;
        this.score = 0;
        this.hasKey = false;
        this.dead = false;

        this.coyoteTimer = 0;
        this.jumpBuffer = 0;
        this.invincible = 0;
        this.hurtTimer = 0;

        this.animState = 'idle';
        this.animFrame = 0;
        this.animTimer = 0;

        this.jumpHoldTimer = 0;

        this.spawnX = x;
        this.spawnY = y;

        this.drawOffX = -3; // offset to center 20px sprite on 14px hitbox
        this.drawOffY = -2;
    }

    update(level) {
        if (this.dead) return;

        // Invincibility timer
        if (this.invincible > 0) this.invincible--;
        if (this.hurtTimer > 0) this.hurtTimer--;

        // Horizontal movement
        let moveX = 0;
        if (isLeft()) moveX = -1;
        if (isRight()) moveX = 1;

        if (this.hurtTimer > 0) moveX = 0;

        this.vx = moveX * PLAYER_SPEED;
        if (moveX !== 0) this.facing = moveX;

        // Coyote time
        if (this.onGround) {
            this.coyoteTimer = COYOTE_TIME;
        } else {
            this.coyoteTimer--;
        }

        // Jump buffer
        if (isJumpPressed()) this.jumpBuffer = JUMP_BUFFER;
        else if (this.jumpBuffer > 0) this.jumpBuffer--;

        // Jump
        if (this.jumpBuffer > 0 && this.coyoteTimer > 0 && jumpReleasedSinceLastJump) {
            this.vy = JUMP_FORCE;
            this.coyoteTimer = 0;
            this.jumpBuffer = 0;
            this.onGround = false;
            this.jumpHoldTimer = 12; // frames of boosted jump
            jumpReleasedSinceLastJump = false;
            sfxJump();
            spawnDust(this.x + this.w / 2, this.y + this.h);
        }

        // Variable jump height: hold Space longer = jump higher
        if (this.jumpHoldTimer > 0) {
            if (isJumpHeld()) {
                this.jumpHoldTimer--;
            } else {
                // Released early — cut upward velocity
                this.jumpHoldTimer = 0;
                if (this.vy < -2) this.vy = -2;
            }
        }

        // Gravity
        this.vy += GRAVITY;
        if (this.vy > MAX_FALL) this.vy = MAX_FALL;

        // Move X then Y with collision
        this.onGround = false;
        this.x += this.vx;
        tileCollision(this, level, 'x');
        this.y += this.vy;
        tileCollision(this, level, 'y');

        // Fell off bottom
        if (this.y > level.map.length * TILE + 32) {
            this.die();
        }

        // Animation state
        if (this.hurtTimer > 0) {
            this.animState = 'hurt';
        } else if (!this.onGround) {
            this.animState = this.vy < 0 ? 'jump' : 'fall';
        } else if (Math.abs(this.vx) > 0.1) {
            this.animState = 'run';
        } else {
            this.animState = 'idle';
        }

        // Animation timer
        this.animTimer++;
        const spd = this.animState === 'run' ? 8 : 20;
        if (this.animTimer >= spd) {
            this.animTimer = 0;
            this.animFrame++;
        }

        // Land dust
        if (this.onGround && this.vy === 0 && this.animState !== 'run') {
            // only on first landing frame (handled by vy check above)
        }
    }

    hurt() {
        if (this.invincible > 0 || this.dead) return;
        this.health--;
        this.invincible = 60;
        this.hurtTimer = 15;
        this.vy = -4;
        this.vx = -this.facing * 3;
        sfxHurt();
        screenShake(3, 10);
        spawnHitParticles(this.x + this.w / 2, this.y + this.h / 2);

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        if (this.dead) return;
        this.dead = true;
        sfxDeath();
        spawnDeathParticles(this.x + this.w / 2, this.y + this.h / 2);
        screenShake(5, 15);
    }

    respawn() {
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.vx = 0;
        this.vy = 0;
        this.health = this.maxHealth;
        this.dead = false;
        this.invincible = 60;
        this.hurtTimer = 0;
        this.hasKey = false;
    }

    draw() {
        if (this.dead) return;
        if (this.invincible > 0 && Math.floor(this.invincible / 3) % 2 === 0) return; // flash

        let frameSet;
        const right = this.facing === 1;
        switch (this.animState) {
            case 'run': frameSet = right ? sprites.playerRun : sprites.playerRunL; break;
            case 'jump': frameSet = right ? sprites.playerJump : sprites.playerJumpL; break;
            case 'fall': frameSet = right ? sprites.playerFall : sprites.playerFallL; break;
            default: frameSet = right ? sprites.playerIdle : sprites.playerIdleL; break;
        }
        const frame = frameSet[this.animFrame % frameSet.length];
        const dx = Math.floor(this.x + this.drawOffX - camera.x);
        const dy = Math.floor(this.y + this.drawOffY - camera.y);
        ctx.drawImage(frame, dx, dy);
    }

    getRect() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
}

// --- ENEMY BASE ---
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'slime', 'bat', 'boss'
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.facing = 1;
        this.alive = true;
        this.animFrame = 0;
        this.animTimer = 0;
        this.deathTimer = 0;

        switch (type) {
            case 'slime':
                this.w = 14;
                this.h = 12;
                this.drawOffX = -1;
                this.drawOffY = -4;
                this.vx = 0.5;
                this.health = 1;
                this.patrolDist = 0;
                this.patrolMax = 80;
                break;
            case 'bat':
                this.w = 14;
                this.h = 12;
                this.drawOffX = -1;
                this.drawOffY = -2;
                this.health = 1;
                this.baseY = y;
                this.phase = rnd(0, Math.PI * 2);
                this.vx = 0.8;
                break;
            case 'boss':
                this.w = 20;
                this.h = 22;
                this.drawOffX = -2;
                this.drawOffY = -2;
                this.health = 5;
                this.maxHealth = 5;
                this.attackTimer = 0;
                this.state = 'idle';
                this.stateTimer = 60;
                break;
        }
    }

    update(level, player) {
        if (!this.alive) {
            this.deathTimer--;
            return;
        }

        this.animTimer++;
        if (this.animTimer >= 12) {
            this.animTimer = 0;
            this.animFrame++;
        }

        switch (this.type) {
            case 'slime': this.updateSlime(level); break;
            case 'bat': this.updateBat(level); break;
            case 'boss': this.updateBoss(level, player); break;
        }
    }

    updateSlime(level) {
        this.vy += GRAVITY;
        if (this.vy > MAX_FALL) this.vy = MAX_FALL;

        this.x += this.vx;
        this.onGround = false;

        // Check wall collision
        const nextCol = Math.floor((this.vx > 0 ? this.x + this.w : this.x) / TILE);
        const row = Math.floor((this.y + this.h - 1) / TILE);
        if (isSolid(level, nextCol, row) || isSolid(level, nextCol, row - 1)) {
            this.vx *= -1;
            this.facing *= -1;
        }

        // Check edge (don't walk off)
        const checkCol = Math.floor((this.vx > 0 ? this.x + this.w + 2 : this.x - 2) / TILE);
        const belowRow = Math.floor((this.y + this.h + 2) / TILE);
        if (this.onGround && !isSolid(level, checkCol, belowRow)) {
            this.vx *= -1;
            this.facing *= -1;
        }

        this.y += this.vy;
        // Simple ground check
        const footRow = Math.floor((this.y + this.h) / TILE);
        const footCol = Math.floor((this.x + this.w / 2) / TILE);
        if (isSolid(level, footCol, footRow)) {
            this.y = footRow * TILE - this.h;
            this.vy = 0;
            this.onGround = true;
        }

        this.patrolDist += Math.abs(this.vx);
        if (this.patrolDist > this.patrolMax) {
            this.patrolDist = 0;
            this.vx *= -1;
            this.facing *= -1;
        }
    }

    updateBat(level) {
        this.phase += 0.05;
        this.y = this.baseY + Math.sin(this.phase) * 20;
        this.x += this.vx;

        // Reverse at edges
        const col = Math.floor((this.vx > 0 ? this.x + this.w : this.x) / TILE);
        const row = Math.floor(this.y / TILE);
        if (isSolid(level, col, row)) {
            this.vx *= -1;
            this.facing *= -1;
        }
    }

    updateBoss(level, player) {
        if (!player || player.dead) return;

        this.stateTimer--;
        this.vy += GRAVITY;
        if (this.vy > MAX_FALL) this.vy = MAX_FALL;

        switch (this.state) {
            case 'idle':
                this.vx = 0;
                if (this.stateTimer <= 0) {
                    this.state = 'chase';
                    this.stateTimer = 90;
                }
                break;
            case 'chase':
                const dir = player.x > this.x ? 1 : -1;
                this.vx = dir * 1.5;
                this.facing = dir;
                if (this.stateTimer <= 0) {
                    this.state = 'jump';
                    this.vy = -9;
                    this.stateTimer = 60;
                    sfxEnemyHit();
                }
                break;
            case 'jump':
                const dir2 = player.x > this.x ? 1 : -1;
                this.vx = dir2 * 2;
                this.facing = dir2;
                if (this.onGround && this.stateTimer < 40) {
                    this.state = 'idle';
                    this.stateTimer = 40;
                    screenShake(3, 8);
                }
                break;
        }

        this.onGround = false;
        this.x += this.vx;
        tileCollision(this, level, 'x');
        this.y += this.vy;
        tileCollision(this, level, 'y');
    }

    hit() {
        this.health--;
        sfxEnemyHit();
        spawnHitParticles(this.x + this.w / 2, this.y + this.h / 2);
        if (this.health <= 0) {
            this.alive = false;
            this.deathTimer = 30;
            spawnDeathParticles(this.x + this.w / 2, this.y + this.h / 2);
        }
    }

    draw() {
        if (!this.alive) return;

        let frameSet;
        const right = this.facing === 1;
        switch (this.type) {
            case 'slime':
                frameSet = right ? sprites.slime : sprites.slimeL;
                break;
            case 'bat':
                frameSet = sprites.bat;
                break;
            case 'boss':
                frameSet = right ? sprites.boss : sprites.bossL;
                break;
        }
        const frame = frameSet[this.animFrame % frameSet.length];
        const dx = Math.floor(this.x + (this.drawOffX || 0) - camera.x);
        const dy = Math.floor(this.y + (this.drawOffY || 0) - camera.y);
        ctx.drawImage(frame, dx, dy);

        // Boss health bar
        if (this.type === 'boss') {
            const bx = dx;
            const by = dy - 8;
            const bw = 24;
            ctx.fillStyle = '#333';
            ctx.fillRect(bx, by, bw, 3);
            ctx.fillStyle = '#c0392b';
            ctx.fillRect(bx, by, bw * (this.health / this.maxHealth), 3);
        }
    }

    getRect() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
}

// --- COLLECTIBLE ---
class Collectible {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'coin', 'heart', 'key'
        this.collected = false;
        this.animFrame = 0;
        this.animTimer = 0;
        this.bobPhase = rnd(0, Math.PI * 2);

        switch (type) {
            case 'coin': this.w = 12; this.h = 12; break;
            case 'heart': this.w = 12; this.h = 12; break;
            case 'key': this.w = 12; this.h = 16; break;
        }
    }

    update() {
        if (this.collected) return;
        this.bobPhase += 0.06;
        this.animTimer++;
        if (this.animTimer >= 10) {
            this.animTimer = 0;
            this.animFrame++;
        }
    }

    collect(player) {
        if (this.collected) return;
        this.collected = true;
        switch (this.type) {
            case 'coin':
                player.coins++;
                player.score += 100;
                sfxCoin();
                spawnCoinParticles(this.x + this.w / 2, this.y + this.h / 2);
                break;
            case 'heart':
                if (player.health < player.maxHealth) player.health++;
                sfxCoin();
                spawnHitParticles(this.x + this.w / 2, this.y + this.h / 2);
                break;
            case 'key':
                player.hasKey = true;
                sfxKey();
                spawnCoinParticles(this.x + this.w / 2, this.y + this.h / 2);
                break;
        }
    }

    draw() {
        if (this.collected) return;
        const bobY = Math.sin(this.bobPhase) * 3;
        const dx = Math.floor(this.x - camera.x);
        const dy = Math.floor(this.y + bobY - camera.y);

        switch (this.type) {
            case 'coin':
                const cf = sprites.coin[this.animFrame % sprites.coin.length];
                ctx.drawImage(cf, dx, dy);
                break;
            case 'heart':
                ctx.drawImage(sprites.heart, dx, dy);
                break;
            case 'key':
                ctx.drawImage(sprites.key, dx, dy);
                break;
        }
    }

    getRect() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
}

// ============================================================
// 12. LEVEL DATA
// ============================================================
// Tile legend: 0=air, 1=grass, 2=dirt, 3=stone, 4=spike, 5=platform, 6=doorTop, 7=doorBottom, 8=castle

function createLevel(mapStrings, entities, bgColor, name, coinTarget) {
    const map = mapStrings.map(row => row.split('').map(c => {
        switch (c) {
            case '1': return 1; case '2': return 2; case '3': return 3;
            case '4': return 4; case '5': return 5; case '6': return 6;
            case '7': return 7; case '8': return 8;
            default: return 0;
        }
    }));
    return { map, entities, bgColor, name, coinTarget };
}

// Level 1: Grasslands — tutorial level, moderate difficulty
//  Cols: 0         1         2         3         4         5
//        0123456789012345678901234567890123456789012345678901234567890
const LEVEL_1_MAP = [
//  0     ground run      platforms       climb section        door
    '000000000000000000000000000000000000000000000000000000000000',
    '000000000000000000000000000000000000000000000000000000000000',
    '000000000000000000000000000000000000000000000000000067000000',
    '000000000000000000000000000000000000000000000000001117000000',
    '000000000000000000000000000000000000000000000055501112000000',
    '000000000000000000000000000000000000000000000000001112000000',
    '000000000000000000000000000000000005550000055555501112000000',
    '000000000000000000000000000000000000000000000000001112000000',
    '000000000000000000000555000000000000000005550055501112000000',
    '000000000000000000000000000005550000000000000000001112000000',
    '000000000000055500000000000000000000000000000055501112000000',
    '000000000000000000000000000000000000040000000000001112000000',
    '000000000000000000000000001110000000000000000055501112000000',
    '000000000000000000000000000000000001110000000000001112000000',
    '000000000000000000000011100000011000000011111111111112000000',
    '111111111111111111111111211111111111111112222222222222000000',
    '222222222222222222222222222222222222222222222222222222000000',
];

const LEVEL_1_ENTITIES = [
    { type: 'player', x: 2, y: 14 },
    { type: 'coin', x: 8, y: 14 },
    { type: 'coin', x: 10, y: 14 },
    { type: 'coin', x: 14, y: 9 },
    { type: 'coin', x: 22, y: 7 },
    { type: 'coin', x: 24, y: 7 },
    { type: 'coin', x: 30, y: 8 },
    { type: 'coin', x: 36, y: 5 },
    { type: 'coin', x: 37, y: 5 },
    { type: 'coin', x: 42, y: 7 },
    { type: 'coin', x: 47, y: 3 },
    { type: 'coin', x: 48, y: 3 },
    { type: 'heart', x: 43, y: 7 },
    { type: 'key', x: 52, y: 1 },
    { type: 'slime', x: 16, y: 14 },
    { type: 'slime', x: 30, y: 14 },
    { type: 'slime', x: 37, y: 14 },
];

// Level 2: Cave — more enemies, tighter platforming
const LEVEL_2_MAP = [
//  0     cave interior   platforms+enemies   climb to door
    '333333333333333333333333333333333333333333333333333333333333',
    '300000000000000000000000000000000000000000000000000000000033',
    '300000000000000000000000000000000000000000000000000006700033',
    '300000000000000000000000000000000000000000000000000011700033',
    '300000000000000000000000000000000000000000000005550111200033',
    '300000000000000000000000000000000000000000000000001111200033',
    '300000000000000000000000000000000000055000005550001111200033',
    '300000000000000000005550000000000000000000000000001111200033',
    '300000000000000000000000000005500000000005550005551111200033',
    '300000000000555000000000000000000000000000000000001111200033',
    '300000000000000000000000003110000000000000000005551111200033',
    '300000000000000000000000000000000000000000000000001111200033',
    '300000005500000000000000000000005500000000000005551111200033',
    '300000000000000000000000000000000000000000000000001111200033',
    '300000000000000033311330000011100331133000011100001111200033',
    '311111111331111133311113333111133311113333111133311111200033',
    '322222222332222233322223333222233322223333222233322222200033',
];

const LEVEL_2_ENTITIES = [
    { type: 'player', x: 2, y: 14 },
    { type: 'coin', x: 6, y: 14 },
    { type: 'coin', x: 8, y: 14 },
    { type: 'coin', x: 12, y: 8 },
    { type: 'coin', x: 22, y: 6 },
    { type: 'coin', x: 23, y: 6 },
    { type: 'coin', x: 30, y: 7 },
    { type: 'coin', x: 38, y: 7 },
    { type: 'coin', x: 39, y: 7 },
    { type: 'coin', x: 43, y: 5 },
    { type: 'coin', x: 49, y: 3 },
    { type: 'coin', x: 50, y: 3 },
    { type: 'heart', x: 10, y: 11 },
    { type: 'key', x: 53, y: 1 },
    { type: 'slime', x: 15, y: 14 },
    { type: 'slime', x: 25, y: 14 },
    { type: 'slime', x: 41, y: 14 },
    { type: 'bat', x: 20, y: 5 },
    { type: 'bat', x: 35, y: 4 },
    { type: 'bat', x: 48, y: 3 },
];

// Level 3: Castle — hardest, boss fight, spikes
const LEVEL_3_MAP = [
//  0     castle interior  platforms+hazards   climb to door
    '888888888888888888888888888888888888888888888888888888888888',
    '800000000000000000000000000000000000000000000000000000000088',
    '800000000000000000000000000000000000000000000000000067000088',
    '800000000000000000000000000000000000000000000000001117000088',
    '800000000000000000000000000000000000000000000555011120000088',
    '800000000000000000000000000000000000000000000000011120000088',
    '800000000000000000000000000000000005500005550555011120000088',
    '800000000000000000000000000000000000000000000000011120000088',
    '800000000000000000005500000055000000000555000555011120000088',
    '800000000000000000000000000000008800000000000000011120000088',
    '800000000000000000000000000000000000000000000555011120000088',
    '800000000000005500000000000000000000000000000000011120000088',
    '800000005500000000000000088800000055000000000555011120000088',
    '800000000000000000000000000000000000000000000000011120000088',
    '800000000000000088111880008800000011100088800000011120000088',
    '811111111881111188111118888118888111111888111888811120000088',
    '822222222882222288222228888228888222222888222888822220000088',
];

const LEVEL_3_ENTITIES = [
    { type: 'player', x: 2, y: 14 },
    { type: 'coin', x: 6, y: 14 },
    { type: 'coin', x: 8, y: 14 },
    { type: 'coin', x: 14, y: 10 },
    { type: 'coin', x: 21, y: 7 },
    { type: 'coin', x: 27, y: 7 },
    { type: 'coin', x: 36, y: 5 },
    { type: 'coin', x: 37, y: 5 },
    { type: 'coin', x: 42, y: 7 },
    { type: 'coin', x: 47, y: 2 },
    { type: 'coin', x: 48, y: 2 },
    { type: 'heart', x: 15, y: 10 },
    { type: 'heart', x: 37, y: 7 },
    { type: 'key', x: 53, y: 1 },
    { type: 'slime', x: 15, y: 14 },
    { type: 'slime', x: 32, y: 14 },
    { type: 'bat', x: 10, y: 5 },
    { type: 'bat', x: 25, y: 4 },
    { type: 'bat', x: 40, y: 3 },
    { type: 'bat', x: 47, y: 1 },
    { type: 'boss', x: 38, y: 14 },
];

const LEVELS = [
    createLevel(LEVEL_1_MAP, LEVEL_1_ENTITIES, '#87ceeb', 'Grasslands', 8),
    createLevel(LEVEL_2_MAP, LEVEL_2_ENTITIES, '#1a1a2e', 'Dark Cave', 8),
    createLevel(LEVEL_3_MAP, LEVEL_3_ENTITIES, '#2c1810', 'Castle', 8),
];

// ============================================================
// 13. GAME STATE MANAGER
// ============================================================
const game = {
    state: 'title',
    currentLevel: 0,
    player: null,
    enemies: [],
    collectibles: [],
    level: null,
    totalScore: 0,
    titleTimer: 0,
    transitionTimer: 0,
    deathDelay: 0,
    levelCompleteTimer: 0,
    selectedLevel: 0,
};

function loadLevel(idx) {
    const lvl = LEVELS[idx];
    game.currentLevel = idx;
    game.level = lvl;
    game.enemies = [];
    game.collectibles = [];
    particles = [];
    camera.x = 0;
    camera.y = 0;

    for (const e of lvl.entities) {
        const px = e.x * TILE + 2;
        const py = e.y * TILE;
        switch (e.type) {
            case 'player':
                if (!game.player) {
                    game.player = new Player(px, py);
                } else {
                    game.player.spawnX = px;
                    game.player.spawnY = py;
                    game.player.respawn();
                    game.player.coins = 0;
                    game.player.hasKey = false;
                }
                break;
            case 'slime': game.enemies.push(new Enemy(px, py + 4, 'slime')); break;
            case 'bat': game.enemies.push(new Enemy(px, py, 'bat')); break;
            case 'boss': game.enemies.push(new Enemy(px, py, 'boss')); break;
            case 'coin': game.collectibles.push(new Collectible(e.x * TILE + 2, py + 2, 'coin')); break;
            case 'heart': game.collectibles.push(new Collectible(e.x * TILE + 2, py + 2, 'heart')); break;
            case 'key': game.collectibles.push(new Collectible(e.x * TILE + 2, py, 'key')); break;
        }
    }
}

function startGame(levelIdx) {
    game.state = 'playing';
    game.player = null;
    game.totalScore = 0;
    loadLevel(levelIdx);
    startMusic();
}

function updatePlaying() {
    const p = game.player;
    const lvl = game.level;

    if (p.dead) {
        game.deathDelay++;
        if (game.deathDelay > 60) {
            p.lives--;
            if (p.lives <= 0) {
                game.state = 'gameOver';
                stopMusic();
            } else {
                p.respawn();
                game.deathDelay = 0;
                loadLevel(game.currentLevel);
            }
        }
        updateParticles();
        return;
    }

    game.deathDelay = 0;
    p.update(lvl);

    for (const e of game.enemies) {
        e.update(lvl, p);
    }

    for (const c of game.collectibles) {
        c.update();
    }

    // Player vs enemies
    for (const e of game.enemies) {
        if (!e.alive) continue;
        if (aabb(p.getRect(), e.getRect())) {
            if (p.vy > 0 && p.y + p.h - 6 < e.y + e.h / 2) {
                e.hit();
                p.vy = JUMP_FORCE * 0.6;
                p.score += 200;
            } else {
                p.hurt();
            }
        }
    }

    // Player vs collectibles
    for (const c of game.collectibles) {
        if (c.collected) continue;
        if (aabb(p.getRect(), c.getRect())) {
            c.collect(p);
        }
    }

    // Check door exit
    if (p.hasKey) {
        const map = lvl.map;
        for (let row = 0; row < map.length; row++) {
            for (let col = 0; col < map[0].length; col++) {
                if (map[row][col] === 6 || map[row][col] === 7) {
                    const doorRect = { x: col * TILE + 4, y: row * TILE, w: 8, h: TILE };
                    if (aabb(p.getRect(), doorRect)) {
                        game.state = 'levelComplete';
                        game.levelCompleteTimer = 0;
                        game.totalScore += p.score;
                        sfxLevelComplete();
                        stopMusic();
                        return;
                    }
                }
            }
        }
    }

    updateCamera(p, lvl.map[0].length * TILE, lvl.map.length * TILE);
    updateParticles();
    if (shakeTimer > 0) shakeTimer--;
}

// ============================================================
// 14. RENDERER & HUD
// ============================================================
function drawBackground(bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    if (bgColor === '#87ceeb') {
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 5; i++) {
            const cx = ((i * 120 + 30) - camera.x * 0.3) % (CANVAS_W + 100) - 50;
            const cy = 20 + i * 15;
            ctx.fillRect(cx, cy, 40, 8);
            ctx.fillRect(cx + 5, cy - 4, 30, 6);
            ctx.fillRect(cx + 10, cy + 8, 20, 4);
        }
    } else if (bgColor === '#1a1a2e') {
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 30; i++) {
            const sx = (i * 47 + 13) % CANVAS_W;
            const sy = (i * 31 + 7) % CANVAS_H;
            ctx.fillRect(sx, sy, 1, 1);
        }
    }
}

function drawTiles(level) {
    const map = level.map;
    const startCol = Math.floor(camera.x / TILE);
    const endCol = Math.ceil((camera.x + CANVAS_W) / TILE);
    const startRow = Math.floor(camera.y / TILE);
    const endRow = Math.ceil((camera.y + CANVAS_H) / TILE);

    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) continue;
            const t = map[row][col];
            if (t === 0) continue;
            const spr = drawTileSprite(t);
            if (spr) {
                ctx.drawImage(spr, Math.floor(col * TILE - camera.x), Math.floor(row * TILE - camera.y));
            }
        }
    }
}

function drawHUD(player) {
    for (let i = 0; i < player.maxHealth; i++) {
        const spr = i < player.health ? sprites.heart : sprites.heartEmpty;
        ctx.drawImage(spr, 4 + i * 14, 4);
    }

    ctx.drawImage(sprites.coin[0], 4, 20);
    ctx.fillStyle = '#fff';
    ctx.font = '8px monospace';
    ctx.fillText('x' + player.coins, 18, 28);
    ctx.fillText('Score: ' + player.score, CANVAS_W - 80, 12);
    ctx.fillText(LEVELS[game.currentLevel].name, CANVAS_W / 2 - 30, 12);

    if (player.hasKey) {
        ctx.drawImage(sprites.key, CANVAS_W - 20, 20);
    }
    ctx.fillText('Lives: ' + player.lives, 4, 42);
}

function drawText(text, x, y, size, color, align) {
    ctx.fillStyle = color || '#fff';
    ctx.font = (size || 8) + 'px monospace';
    ctx.textAlign = align || 'center';
    ctx.fillText(text, x, y);
    ctx.textAlign = 'left';
}

function drawTitleScreen() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
        const sx = (i * 47 + 13) % CANVAS_W;
        const sy = (i * 31 + 7) % CANVAS_H;
        const blink = Math.sin(game.titleTimer * 0.05 + i) > 0;
        if (blink) ctx.fillRect(sx, sy, 2, 2);
    }

    game.titleTimer++;
    const bounce = Math.sin(game.titleTimer * 0.05) * 5;

    drawText('PIXEL QUEST', CANVAS_W / 2, 80 + bounce, 16, '#f0e68c');
    drawText('A Platformer Adventure', CANVAS_W / 2, 110, 8, '#8fbc8f');

    if (Math.floor(game.titleTimer / 30) % 2 === 0) {
        drawText('Press ENTER to Start', CANVAS_W / 2, 160, 8, '#ecf0f1');
    }

    drawText('Arrow Keys / WASD to Move', CANVAS_W / 2, 200, 7, '#95a5a6');
    drawText('Space to Jump', CANVAS_W / 2, 215, 7, '#95a5a6');
    drawText('Escape to Pause', CANVAS_W / 2, 230, 7, '#95a5a6');
}

function drawLevelSelect() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    drawText('SELECT LEVEL', CANVAS_W / 2, 40, 12, '#f0e68c');

    for (let i = 0; i < LEVELS.length; i++) {
        const y = 80 + i * 50;
        const selected = i === game.selectedLevel;
        const color = selected ? '#f0e68c' : '#95a5a6';
        const prefix = selected ? '> ' : '  ';
        drawText(prefix + (i + 1) + '. ' + LEVELS[i].name, CANVAS_W / 2, y, 10, color);
    }

    drawText('Press ENTER to Start', CANVAS_W / 2, 230, 7, '#95a5a6');
    drawText('Up/Down to Select', CANVAS_W / 2, 245, 7, '#95a5a6');
}

function drawPauseScreen() {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    drawText('PAUSED', CANVAS_W / 2, 100, 16, '#f0e68c');
    drawText('Press ESCAPE to Resume', CANVAS_W / 2, 140, 8, '#ecf0f1');
    drawText('Press ENTER for Title', CANVAS_W / 2, 160, 8, '#95a5a6');
}

function drawGameOver() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    drawText('GAME OVER', CANVAS_W / 2, 80, 16, '#c0392b');
    drawText('Score: ' + (game.totalScore + (game.player ? game.player.score : 0)), CANVAS_W / 2, 120, 10, '#ecf0f1');
    if (Math.floor(game.titleTimer / 30) % 2 === 0) {
        drawText('Press ENTER to Continue', CANVAS_W / 2, 170, 8, '#ecf0f1');
    }
    game.titleTimer++;
}

function drawLevelComplete() {
    game.levelCompleteTimer++;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    drawText('LEVEL COMPLETE!', CANVAS_W / 2, 60, 14, '#f0e68c');

    const p = game.player;
    const lvl = LEVELS[game.currentLevel];
    const stars = p.coins >= lvl.coinTarget ? 3 : p.coins >= lvl.coinTarget / 2 ? 2 : 1;

    drawText('Coins: ' + p.coins + ' / ' + lvl.coinTarget, CANVAS_W / 2, 100, 8, '#ecf0f1');
    drawText('Score: ' + p.score, CANVAS_W / 2, 120, 8, '#ecf0f1');

    let starDisplay = '';
    for (let i = 0; i < 3; i++) {
        starDisplay += i < stars ? '* ' : '. ';
    }
    drawText(starDisplay, CANVAS_W / 2, 145, 12, '#f0e68c');

    if (game.levelCompleteTimer > 60) {
        if (game.currentLevel < LEVELS.length - 1) {
            drawText('Press ENTER for Next Level', CANVAS_W / 2, 190, 8, '#ecf0f1');
        } else {
            drawText('You Won! Press ENTER', CANVAS_W / 2, 190, 8, '#ecf0f1');
        }
    }
}

// ============================================================
// 15. MAIN GAME LOOP
// ============================================================
function update() {
    switch (game.state) {
        case 'title':
            if (isEnterPressed()) {
                initAudio();
                game.state = 'levelSelect';
                game.selectedLevel = 0;
                sfxSelect();
            }
            break;

        case 'levelSelect':
            if (justPressed('ArrowUp') || justPressed('KeyW')) {
                game.selectedLevel = (game.selectedLevel - 1 + LEVELS.length) % LEVELS.length;
                sfxSelect();
            }
            if (justPressed('ArrowDown') || justPressed('KeyS')) {
                game.selectedLevel = (game.selectedLevel + 1) % LEVELS.length;
                sfxSelect();
            }
            if (isEnterPressed()) {
                startGame(game.selectedLevel);
                sfxSelect();
            }
            break;

        case 'playing':
            if (isEscapePressed()) {
                game.state = 'paused';
                stopMusic();
            }
            updatePlaying();
            break;

        case 'paused':
            if (isEscapePressed()) {
                game.state = 'playing';
                startMusic();
            }
            if (isEnterPressed()) {
                game.state = 'title';
                stopMusic();
            }
            break;

        case 'levelComplete':
            if (game.levelCompleteTimer > 60 && isEnterPressed()) {
                if (game.currentLevel < LEVELS.length - 1) {
                    loadLevel(game.currentLevel + 1);
                    game.state = 'playing';
                    startMusic();
                } else {
                    game.state = 'title';
                    game.titleTimer = 0;
                }
            }
            break;

        case 'gameOver':
            if (isEnterPressed()) {
                game.state = 'title';
                game.titleTimer = 0;
            }
            break;
    }
}

function render() {
    ctx.save();
    if (shakeTimer > 0) {
        ctx.translate(rnd(-shakeMagnitude, shakeMagnitude), rnd(-shakeMagnitude, shakeMagnitude));
    }

    switch (game.state) {
        case 'title':
            drawTitleScreen();
            break;
        case 'levelSelect':
            drawLevelSelect();
            break;
        case 'playing':
        case 'paused':
            drawBackground(game.level.bgColor);
            drawTiles(game.level);
            for (const c of game.collectibles) c.draw();
            for (const e of game.enemies) e.draw();
            if (game.player) game.player.draw();
            drawParticles();
            drawHUD(game.player);
            if (game.state === 'paused') drawPauseScreen();
            break;
        case 'levelComplete':
            drawBackground(game.level.bgColor);
            drawTiles(game.level);
            for (const c of game.collectibles) c.draw();
            if (game.player) game.player.draw();
            drawParticles();
            drawLevelComplete();
            break;
        case 'gameOver':
            drawGameOver();
            break;
    }

    ctx.restore();
}

// Fixed timestep game loop
let lastTime = 0;
let accumulator = 0;

function gameLoop(timestamp) {
    if (lastTime === 0) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;
    accumulator += delta;

    if (accumulator > 200) accumulator = 200;

    while (accumulator >= FRAME_TIME) {
        update();
        keysThisFrame = {};
        accumulator -= FRAME_TIME;
    }

    render();
    requestAnimationFrame(gameLoop);
}

function init() {
    initSprites();
    game.state = 'title';
    game.titleTimer = 0;
    requestAnimationFrame(gameLoop);
}

init();
