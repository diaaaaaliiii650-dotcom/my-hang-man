const wordBank = [
    { word: "COMPUTER", category: "Technology", hint: "You are using one right now" },
    { word: "JAVASCRIPT", category: "Technology", hint: "The language powering this game" },
    { word: "GITHUB", category: "Technology", hint: "Where developers store their code" },
    { word: "KEYBOARD", category: "Technology", hint: "You type on this every day" },
    { word: "MOUNTAIN", category: "Nature", hint: "Very tall landform covered in snow" },
    { word: "OCEAN", category: "Nature", hint: "Covers most of Earth's surface" },
    { word: "PLANET", category: "Space", hint: "Earth is one of these" },
    { word: "ROCKET", category: "Space", hint: "Flies to the moon and beyond" },
    { word: "ELEPHANT", category: "Animals", hint: "Largest land animal with a trunk" },
    { word: "BUTTERFLY", category: "Animals", hint: "Colorful insect that starts as a caterpillar" },
    { word: "CHOCOLATE", category: "Food", hint: "Sweet brown treat loved worldwide" },
    { word: "RAINBOW", category: "Nature", hint: "Colorful arc after rain" },
    { word: "ADVENTURE", category: "General", hint: "An exciting journey or experience" },
    { word: "MYSTERY", category: "General", hint: "Something unknown waiting to be solved" },
    { word: "FESTIVAL", category: "Events", hint: "A celebration with music and fun" }
];

let selectedWord = "";
let selectedEntry = null;
let guessedWord = [];
let mistakes = 0;
let guessedLetters = [];
let maxMistakes = 6;
let hintsLeft = 2;
let gameOver = false;

let wins = parseInt(localStorage.getItem("hangmanWins") || "0");
let streak = parseInt(localStorage.getItem("hangmanStreak") || "0");
let score = parseInt(localStorage.getItem("hangmanScore") || "0");

const wordDisplay = document.getElementById("word-display");
const mistakesEl = document.getElementById("mistakes");
const keyboardEl = document.getElementById("keyboard");
const messageEl = document.getElementById("message");
const categoryBadge = document.getElementById("category-badge");
const hintText = document.getElementById("hint-text");
const hintsLeftEl = document.getElementById("hints-left");
const hintBtn = document.getElementById("hint-btn");
const livesBar = document.getElementById("lives-bar");
const difficultySelect = document.getElementById("difficulty");
const bodyParts = ["head", "body", "arm1", "arm2", "leg1", "leg2"];

function updateStats() {
    document.getElementById("wins").textContent = wins;
    document.getElementById("streak").textContent = streak;
    document.getElementById("score").textContent = score;
}

function getWordsForDifficulty() {
    const diff = difficultySelect.value;
    if (diff === "easy") return wordBank.filter(w => w.word.length <= 7);
    if (diff === "hard") return wordBank.filter(w => w.word.length >= 9);
    return wordBank.filter(w => w.word.length >= 7 && w.word.length <= 9);
}

function startGame() {
    const pool = getWordsForDifficulty();
    const source = pool.length > 0 ? pool : wordBank;
    selectedEntry = source[Math.floor(Math.random() * source.length)];
    selectedWord = selectedEntry.word;
    guessedWord = Array(selectedWord.length).fill("_");
    mistakes = 0;
    guessedLetters = [];
    hintsLeft = 2;
    gameOver = false;

    messageEl.textContent = "";
    messageEl.className = "message";
    categoryBadge.textContent = "📂 " + selectedEntry.category;
    hintText.textContent = "";
    hintsLeftEl.textContent = hintsLeft;
    hintBtn.disabled = false;

    bodyParts.forEach(part => {
        document.getElementById(part).style.visibility = "hidden";
    });

    updateDisplay();
    renderLivesBar();
    createKeyboard();
}

function renderLivesBar() {
    livesBar.innerHTML = "";
    for (let i = 0; i < maxMistakes; i++) {
        const heart = document.createElement("span");
        heart.className = "life-heart" + (i < mistakes ? " lost" : "");
        heart.textContent = "❤️";
        livesBar.appendChild(heart);
    }
    mistakesEl.textContent = mistakes + " / " + maxMistakes;
}

function createKeyboard() {
    keyboardEl.innerHTML = "";
    for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i);
        const btn = document.createElement("button");
        btn.textContent = letter;
        btn.classList.add("key");
        btn.dataset.letter = letter;
        btn.onclick = () => guessLetter(letter, btn);
        keyboardEl.appendChild(btn);
    }
}

function renderWordDisplay() {
    wordDisplay.innerHTML = "";
    guessedWord.forEach((letter, i) => {
        const slot = document.createElement("div");
        slot.className = "letter-slot";
        if (letter === "_") {
            slot.textContent = "·";
            slot.classList.add("empty");
        } else {
            slot.textContent = letter;
            slot.classList.add("revealed");
        }
        wordDisplay.appendChild(slot);
    });
}

function guessLetter(letter, btn) {
    if (gameOver || guessedLetters.includes(letter)) return;

    btn.disabled = true;
    guessedLetters.push(letter);

    if (selectedWord.includes(letter)) {
        btn.classList.add("correct");
        for (let i = 0; i < selectedWord.length; i++) {
            if (selectedWord[i] === letter) guessedWord[i] = letter;
        }
    } else {
        btn.classList.add("wrong");
        mistakes++;
        document.getElementById(bodyParts[mistakes - 1]).style.visibility = "visible";
    }

    updateDisplay();
    checkGameStatus();
}

function useHint() {
    if (gameOver || hintsLeft <= 0) return;

    const unrevealed = [];
    for (let i = 0; i < selectedWord.length; i++) {
        if (guessedWord[i] === "_") unrevealed.push(i);
    }
    if (unrevealed.length === 0) return;

    hintsLeft--;
    hintsLeftEl.textContent = hintsLeft;
    if (hintsLeft <= 0) hintBtn.disabled = true;

    hintText.textContent = "💡 " + selectedEntry.hint;

    const idx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    const letter = selectedWord[idx];
    guessedWord[idx] = letter;

    const keyBtn = keyboardEl.querySelector(`[data-letter="${letter}"]`);
    if (keyBtn && !keyBtn.disabled) {
        keyBtn.disabled = true;
        keyBtn.classList.add("correct");
        if (!guessedLetters.includes(letter)) guessedLetters.push(letter);
    }

    renderWordDisplay();
    const slots = wordDisplay.querySelectorAll(".letter-slot");
    if (slots[idx]) slots[idx].classList.add("hint-revealed");

    score = Math.max(0, score - 5);
    updateStats();
    checkGameStatus();
}

function updateDisplay() {
    renderWordDisplay();
    renderLivesBar();
}

function checkGameStatus() {
    if (!guessedWord.includes("_")) {
        gameOver = true;
        const bonus = (maxMistakes - mistakes) * 10 + hintsLeft * 5;
        score += 20 + bonus;
        wins++;
        streak++;
        localStorage.setItem("hangmanWins", wins);
        localStorage.setItem("hangmanStreak", streak);
        localStorage.setItem("hangmanScore", score);
        updateStats();

        messageEl.textContent = "🎉 You Win! +" + (20 + bonus) + " points";
        messageEl.classList.add("win");
        disableKeyboard();
        launchConfetti();
        return;
    }

    if (mistakes >= maxMistakes) {
        gameOver = true;
        streak = 0;
        localStorage.setItem("hangmanStreak", 0);
        updateStats();

        messageEl.textContent = "😢 Game Over! The word was: " + selectedWord;
        messageEl.classList.add("lose");
        guessedWord = selectedWord.split("");
        updateDisplay();
        disableKeyboard();
    }
}

function disableKeyboard() {
    document.querySelectorAll(".key").forEach(btn => (btn.disabled = true));
}

document.addEventListener("keydown", e => {
    if (gameOver) return;
    const letter = e.key.toUpperCase();
    if (letter.length === 1 && letter >= "A" && letter <= "Z") {
        const btn = keyboardEl.querySelector(`[data-letter="${letter}"]`);
        if (btn && !btn.disabled) guessLetter(letter, btn);
    }
});

difficultySelect.addEventListener("change", startGame);

function launchConfetti() {
    const canvas = document.getElementById("confetti");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ["#f5a623", "#e94560", "#a855f7", "#10b981", "#00d2ff", "#fcd34d"];

    for (let i = 0; i < 120; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 8 + 4,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * 360,
            spin: Math.random() * 6 - 3
        });
    }

    let frame = 0;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.y += p.speed;
            p.angle += p.spin;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.angle * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });
        frame++;
        if (frame < 150) requestAnimationFrame(draw);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    draw();
}

updateStats();
startGame();
