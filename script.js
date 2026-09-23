const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const scoreDisplay = document.getElementById("score");
const portfolioDisplay = document.getElementById("portfolio");
const levelDisplay = document.getElementById("level");
const livesDisplay = document.getElementById("lives");

const finalPortfolio = document.getElementById("finalPortfolio");
const highScoreDisplay = document.getElementById("highScore");
const marketStatus = document.getElementById("marketStatus");

let score = 0;
let portfolio = 0;
let level = 1;
let lives = 3;

let gameRunning = false;

let playerX = 0;
let playerSpeed = 8;

let keys = {};

let fallingItems = [];

let lastSpawn = 0;
let spawnRate = 900;

let lastTime = 0;

let highScore = Number(localStorage.getItem("wallStreetRushHighScore")) || 0;


// ----------------------------
// KEYBOARD CONTROLS
// ----------------------------

document.addEventListener("keydown", (event) => {

    if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
    ) {
        event.preventDefault();
    }

    keys[event.key.toLowerCase()] = true;

});


document.addEventListener("keyup", (event) => {

    keys[event.key.toLowerCase()] = false;

});


// ----------------------------
// START BUTTONS
// ----------------------------

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);


// ----------------------------
// START GAME
// ----------------------------

function startGame() {

    score = 0;
    portfolio = 0;
    level = 1;
    lives = 3;

    spawnRate = 900;

    gameRunning = true;

    lastSpawn = 0;
    lastTime = 0;

    fallingItems.forEach(item => item.element.remove());
    fallingItems = [];

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    player.style.display = "flex";

    playerX =
        gameArea.clientWidth / 2 -
        player.offsetWidth / 2;

    player.style.left = playerX + "px";

    marketStatus.textContent = "MARKET OPEN";

    updateStats();

    requestAnimationFrame(gameLoop);

}


// ----------------------------
// MAIN GAME LOOP
// ----------------------------

function gameLoop(timestamp) {

    if (!gameRunning) {
        return;
    }

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    movePlayer();

    if (timestamp - lastSpawn > spawnRate) {

        createFallingItem();

        lastSpawn = timestamp;

    }

    moveItems(deltaTime);

    requestAnimationFrame(gameLoop);

}


// ----------------------------
// PLAYER MOVEMENT
// ----------------------------

function movePlayer() {

    if (
        keys["arrowleft"] ||
        keys["a"]
    ) {
        playerX -= playerSpeed;
    }

    if (
        keys["arrowright"] ||
        keys["d"]
    ) {
        playerX += playerSpeed;
    }

    const maxX =
        gameArea.clientWidth -
        player.offsetWidth;

    playerX = Math.max(
        0,
        Math.min(playerX, maxX)
    );

    player.style.left = playerX + "px";

}


// ----------------------------
// CREATE FALLING OBJECT
// ----------------------------

function createFallingItem() {

    const element = document.createElement("div");

    element.classList.add("falling-item");

    const random = Math.random();

    let type;

    if (random < 0.60) {

        type = "stock";

        element.classList.add("stock");
        element.textContent = "📈";

    }

    else if (random < 0.88) {

        type = "crash";

        element.classList.add("crash");
        element.textContent = "📉";

    }

    else {

        type = "bonus";

        element.classList.add("bonus");
        element.textContent = "💎";

    }

    const size = 58;

    const x =
        Math.random() *
        (gameArea.clientWidth - size);

    element.style.left = x + "px";
    element.style.top = "-60px";

    gameArea.appendChild(element);

    const speed =
        0.18 +
        level * 0.025 +
        Math.random() * 0.08;

    fallingItems.push({

        element: element,

        type: type,

        x: x,

        y: -60,

        speed: speed

    });

}


// ----------------------------
// MOVE FALLING OBJECTS
// ----------------------------

function moveItems(deltaTime) {

    for (
        let i = fallingItems.length - 1;
        i >= 0;
        i--
    ) {

        const item = fallingItems[i];

        item.y += item.speed * deltaTime;

        item.element.style.top =
            item.y + "px";

        if (checkCollision(item)) {

            handleCollision(item);

            item.element.remove();

            fallingItems.splice(i, 1);

            continue;

        }

        if (item.y > gameArea.clientHeight) {

            item.element.remove();

            fallingItems.splice(i, 1);

        }

    }

}


// ----------------------------
// COLLISION DETECTION
// ----------------------------

function checkCollision(item) {

    const itemRect =
        item.element.getBoundingClientRect();

    const playerRect =
        player.getBoundingClientRect();

    return !(
        itemRect.right < playerRect.left ||
        itemRect.left > playerRect.right ||
        itemRect.bottom < playerRect.top ||
        itemRect.top > playerRect.bottom
    );

}


// ----------------------------
// HANDLE CATCH
// ----------------------------

function handleCollision(item) {

    if (item.type === "stock") {

        score += 100;
        portfolio += 100;

        showPopup("+$100", item.x);

    }

    else if (item.type === "bonus") {

        score += 500;
        portfolio += 500;

        showPopup("BONUS +$500", item.x);

    }

    else if (item.type === "crash") {

        lives--;

        portfolio = Math.max(
            0,
            portfolio - 250
        );

        showPopup(
            "MARKET CRASH!",
            item.x
        );

        flashCrash();

    }

    updateLevel();
    updateStats();

    if (lives <= 0) {
        endGame();
    }

}


// ----------------------------
// LEVEL SYSTEM
// ----------------------------

function updateLevel() {

    const newLevel =
        Math.floor(score / 1000) + 1;

    if (newLevel > level) {

        level = newLevel;

        spawnRate = Math.max(
            350,
            900 - (level - 1) * 75
        );

        marketStatus.textContent =
            "LEVEL " + level;

    }

}


// ----------------------------
// UPDATE SCREEN STATS
// ----------------------------

function updateStats() {

    scoreDisplay.textContent =
        score.toLocaleString();

    portfolioDisplay.textContent =
        "$" + portfolio.toLocaleString();

    levelDisplay.textContent =
        level;

    if (lives > 0) {

        livesDisplay.textContent =
            "❤️".repeat(lives);

    }

    else {

        livesDisplay.textContent = "💀";

    }

}


// ----------------------------
// POPUP TEXT
// ----------------------------

function showPopup(text, x) {

    const popup =
        document.createElement("div");

    popup.textContent = text;

    popup.style.position = "absolute";

    popup.style.left = x + "px";

    popup.style.bottom = "90px";

    popup.style.fontWeight = "bold";

    popup.style.color =
        text.includes("CRASH")
            ? "#ff4d5e"
            : "#35ff8a";

    popup.style.zIndex = "8";

    popup.style.pointerEvents = "none";

    popup.style.transition =
        "all 0.7s ease";

    gameArea.appendChild(popup);

    requestAnimationFrame(() => {

        popup.style.transform =
            "translateY(-50px)";

        popup.style.opacity = "0";

    });

    setTimeout(() => {
        popup.remove();
    }, 700);

}


// ----------------------------
// MARKET CRASH EFFECT
// ----------------------------

function flashCrash() {

    gameArea.style.boxShadow =
        "inset 0 0 60px rgba(255, 77, 94, 0.5)";

    setTimeout(() => {

        gameArea.style.boxShadow =
            "none";

    }, 180);

}


// ----------------------------
// GAME OVER
// ----------------------------

function endGame() {

    gameRunning = false;

    player.style.display = "none";

    marketStatus.textContent =
        "MARKET CLOSED";

    fallingItems.forEach(
        item => item.element.remove()
    );

    fallingItems = [];

    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "wallStreetRushHighScore",
            highScore
        );

    }

    finalPortfolio.textContent =
        "$" + portfolio.toLocaleString();

    highScoreDisplay.textContent =
        highScore.toLocaleString();

    gameOverScreen.classList.remove(
        "hidden"
    );

}
