const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let players = [
  {
    x: 200,
    y: canvas.height - 150,
    vx: 0,
    hp: 100,
    charge: 0,
    facing: 1,
    stun: 0
  },
  {
    x: canvas.width - 200,
    y: canvas.height - 150,
    vx: 0,
    hp: 100,
    charge: 0,
    facing: -1,
    stun: 0
  }
];

let dragging = [false, false];
let dragStart = [0, 0];
let activePlayer = null;

function drawPlayer(p) {
  ctx.strokeStyle = "black";
  ctx.lineWidth = 5;

  // body
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x, p.y - 50);
  ctx.stroke();

  // arms (punch)
  ctx.beginPath();
  ctx.moveTo(p.x, p.y - 40);
  ctx.lineTo(p.x + 30 * p.facing, p.y - 40);
  ctx.stroke();

  // head
  ctx.beginPath();
  ctx.arc(p.x, p.y - 70, 15, 0, Math.PI * 2);
  ctx.stroke();
}

function update() {
  players.forEach((p, i) => {
    if (p.stun > 0) p.stun--;

    p.x += p.vx;
    p.vx *= 0.9;

    // gravity-ish
    if (p.y < canvas.height - 150) p.y += 5;

    // bounds
    if (p.x < 50) p.x = 50;
    if (p.x > canvas.width - 50) p.x = canvas.width - 50;
  });
}

function checkHit(attacker, defender) {
  let dist = Math.abs(attacker.x - defender.x);

  if (dist < 80) {
    defender.hp -= 10;
    attacker.charge += 20;

    if (attacker.charge > 100) attacker.charge = 100;
  } else {
    attacker.charge = 0;
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();

  drawPlayer(players[0]);
  drawPlayer(players[1]);

  document.getElementById("hp1").innerText = players[0].hp;
  document.getElementById("hp2").innerText = players[1].hp;
  document.getElementById("charge1").innerText = players[0].charge;
  document.getElementById("charge2").innerText = players[1].charge;

  requestAnimationFrame(gameLoop);
}

canvas.addEventListener("touchstart", (e) => {
  let x = e.touches[0].clientX;

  activePlayer = x < canvas.width / 2 ? 0 : 1;
  dragging[activePlayer] = true;
  dragStart = [x, e.touches[0].clientY];
});

canvas.addEventListener("touchend", (e) => {
  if (activePlayer === null) return;

  let p = players[activePlayer];
  let enemy = players[1 - activePlayer];

  if (p.stun > 0) return;

  // punch
  checkHit(p, enemy);

  // fling
  let dx = dragStart[0] - p.x;
  p.vx += dx * 0.1;

  // abilities
  if (p.charge >= 100) {
    document.getElementById("abilities").classList.remove("hidden");
  }

  dragging[activePlayer] = false;
  activePlayer = null;
});

function useAbility(type) {
  let p = players[0].charge === 100 ? players[0] : players[1];
  let enemy = players[0] === p ? players[1] : players[0];

  if (type === "beam") {
    enemy.hp -= 30;
  }

  if (type === "stun") {
    enemy.stun = 300;
  }

  if (type === "heal") {
    p.hp += 50;
    if (p.hp > 100) p.hp = 100;
  }

  p.charge = 0;
  document.getElementById("abilities").classList.add("hidden");
}

gameLoop();
