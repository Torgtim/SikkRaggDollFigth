const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const GROUND = () => canvas.height - 120;

let players = [
  {
    x: 150,
    y: GROUND(),
    vx: 0,
    hp: 100,
    charge: 0,
    facing: 1,
    stun: 0
  },
  {
    x: canvas.width - 150,
    y: GROUND(),
    vx: 0,
    hp: 100,
    charge: 0,
    facing: -1,
    stun: 0
  }
];

let currentAbilityPlayer = null;
let startX = 0;
let activePlayer = null;

// 🎨 tegn bakgrunn (basket arena vibe)
function drawBackground() {
  ctx.fillStyle = "#c97b2e"; // gulv
  ctx.fillRect(0, GROUND(), canvas.width, 200);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;

  // midtlinje
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, GROUND());
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
}

// 🧍 spiller
function drawPlayer(p) {
  ctx.lineWidth = 6;
  ctx.strokeStyle = "black";

  // kropp
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x, p.y - 50);
  ctx.stroke();

  // hode
  ctx.beginPath();
  ctx.arc(p.x, p.y - 70, 15, 0, Math.PI * 2);
  ctx.stroke();

  // arm (retning)
  ctx.beginPath();
  ctx.moveTo(p.x, p.y - 40);
  ctx.lineTo(p.x + 35 * p.facing, p.y - 40);
  ctx.stroke();
}

// ⚙️ update
function update() {
  players.forEach((p, i) => {
    if (p.stun > 0) p.stun--;

    p.x += p.vx;
    p.vx *= 0.9;

    // hold på bakken
    p.y = GROUND();

    // snu mot motstander
    let enemy = players[1 - i];
    p.facing = enemy.x > p.x ? 1 : -1;

    // bounds
    if (p.x < 50) p.x = 50;
    if (p.x > canvas.width - 50) p.x = canvas.width - 50;
  });
}

// 👊 hit check
function hit(attacker, defender) {
  let dist = Math.abs(attacker.x - defender.x);

  if (dist < 80) {
    defender.hp -= 10;
    attacker.charge += 25;

    if (attacker.charge > 100) attacker.charge = 100;
  } else {
    attacker.charge = 0;
  }
}

// 🎮 touch start
canvas.addEventListener("touchstart", (e) => {
  let x = e.touches[0].clientX;

  activePlayer = x < canvas.width / 2 ? 0 : 1;
  startX = x;
});

// 🎮 touch end
canvas.addEventListener("touchend", (e) => {
  if (activePlayer === null) return;

  let p = players[activePlayer];
  let enemy = players[1 - activePlayer];

  if (p.stun > 0) return;

  // slag
  hit(p, enemy);

  // fling (drag bakover = boost frem)
  let drag = startX - p.x;
  p.vx += drag * 0.15;

  // ability klar
  if (p.charge >= 100) {
    currentAbilityPlayer = activePlayer;
    document.getElementById("abilities").classList.remove("hidden");
  }

  activePlayer = null;
});

// 💥 abilities
function useAbility(type) {
  let p = players[currentAbilityPlayer];
  let enemy = players[1 - currentAbilityPlayer];

  if (!p) return;

  if (type === "beam") {
    enemy.hp -= 30;
  }

  if (type === "stun") {
    enemy.stun = 180; // ~5 sek
  }

  if (type === "heal") {
    p.hp += 50;
    if (p.hp > 100) p.hp = 100;
  }

  p.charge = 0;
  currentAbilityPlayer = null;
  document.getElementById("abilities").classList.add("hidden");
}

// 🔄 game loop
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  update();

  players.forEach(drawPlayer);

  // UI
  document.getElementById("hp1").innerText = players[0].hp;
  document.getElementById("hp2").innerText = players[1].hp;
  document.getElementById("charge1").innerText = players[0].charge;
  document.getElementById("charge2").innerText = players[1].charge;

  requestAnimationFrame(loop);
}

loop();
