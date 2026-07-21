const words = [
    "COMPUTER", "JAVASCRIPT", "GITHUB", "KEYBOARD",
    "MOUNTAIN", "OCEAN", "PLANET", "ROCKET"
];

let selectedWord = "";
let guessedWord = [];
let mistakes = 0;
let guessedLetters = [];
const maxMistakes = 6;

const wordDisplay = document.getElementById('word-display');
const mistakesEl = document.getElementById('mistakes');
const keyboardEl = document.getElementById('keyboard');
const messageEl = document.getElementById('message');
const bodyParts = ["head", "body", "arm1", "arm2", "leg1", "leg2"];

function startGame() {
    // Reset everything
    selectedWord = words[Math.floor(Math.random() * words.length)];
    guessedWord = Array(selectedWord.length).fill("_");
    mistakes = 0;
    guessedLetters = [];
    messageEl.innerText = "";
    messageEl.className = "";

    // Hide body parts
    bodyParts.forEach(part => {
        document.getElementById(part).style.visibility = "hidden";
    });

    updateDisplay();
    createKeyboard();
}

function createKeyboard() {
    keyboardEl.innerHTML = "";
    for(let i = 65; i <= 90; i++) {
        let letter = String.fromCharCode(i);
        let btn = document.createElement('button');
        btn.innerText = letter;
        btn.classList.add('key');
        btn.onclick = () => guessLetter(letter, btn);
        keyboardEl.appendChild(btn);
    }
}

function guessLetter(letter, btn) {
    btn.disabled = true;
    guessedLetters.push(letter);

    if(selectedWord.includes(letter)) {
        // Correct guess
        for(let i = 0; i < selectedWord.length; i++) {
            if(selectedWord[i] === letter) {
                guessedWord[i] = letter;
            }
        }
    } else {
        // Wrong guess
        mistakes++;
        document.getElementById(bodyParts[mistakes-1]).style.visibility = "visible";
    }

    updateDisplay();
    checkGameStatus();
}

function updateDisplay() {
    wordDisplay.innerText = guessedWord.join(" ");
    mistakesEl.innerText = mistakes;
}

function checkGameStatus() {
    if(!guessedWord.includes("_")) {
        messageEl.innerText = "You Win! 🎉 The word was: " + selectedWord;
        messageEl.classList.add('win');
        disableKeyboard();
    }

    if(mistakes >= maxMistakes) {
        messageEl.innerText = "Game Over! 😢 The word was: " + selectedWord;
        messageEl.classList.add('lose');
        guessedWord = selectedWord.split("");
        updateDisplay();
        disableKeyboard();
    }
}

function disableKeyboard() {
    document.querySelectorAll('.key').forEach(btn => btn.disabled = true);
}

// Start game on load
startGame();