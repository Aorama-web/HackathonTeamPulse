const noteInput = document.getElementById('note-input');
const generateBtn = document.getElementById('generate-btn');
const loading = document.getElementById('ai-loading');
const controls = document.getElementById('controls');
const charCount = document.getElementById('char-count');

let deck = [];
let masteredCount = 0;

// Update character count as user types
noteInput.addEventListener('input', () => {
    charCount.innerText = `${noteInput.value.length} characters`;
});

generateBtn.addEventListener('click', async () => {
    const text = noteInput.value.trim();
    if (text.length < 10) return alert("Please paste more notes first!");

    loading.classList.remove('hidden'); // Start scan line and loader

    try {
        const response = await fetch('YOUR_API_ENDPOINT/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });

        const data = await response.json();
        deck = data.flashcards;

        loading.classList.add('hidden');
        controls.classList.remove('hidden');
        renderCard();
    } catch (err) {
        console.error("Backend Error:", err);
        // Fallback for demo
        setTimeout(() => {
            deck = [{q: "Sample Question?", a: "Sample Answer"}];
            loading.classList.add('hidden');
            controls.classList.remove('hidden');
            renderCard();
        }, 2000);
    }
});

function renderCard() {
    if (deck.length === 0) {
        document.getElementById('q-text').innerText = "All cards Mastered!";
        return;
    }
    document.getElementById('card').classList.remove('is-flipped');
    document.getElementById('q-text').innerText = deck[0].q;
    document.getElementById('a-text').innerText = deck[0].a;
    document.getElementById('count-practice').innerText = deck.length;
}

document.getElementById('card').addEventListener('click', function() {
    this.classList.toggle('is-flipped');
});

function handleFeedback(success) {
    const current = deck.shift();
    if (success) {
        masteredCount++;
        document.getElementById('count-mastered').innerText = masteredCount;
    } else {
        deck.push(current);
    }
    renderCard();
}