// ELEMENTS
const input = document.getElementById("textarea");
const generateBtn = document.getElementById("generate");
const toggleBtn = document.getElementById("toggleview");
const notesView = document.querySelector(".notesview");
const flashView = document.querySelector(".flashview");

const prevCardBtn = document.getElementById("prevCard");
const flipBtn = document.getElementById("flipCard");
const nextCardBtn = document.getElementById("nextCard");
const markKnownBtn = document.getElementById("markKnown");
const cardProgress = document.getElementById("cardProgress");

const saveBtn = document.getElementById("savebtn");
const savedModal = document.getElementById("savedModal");
const savedList = document.getElementById("savedList");
const openSavedBtn = document.getElementById("opensaved");
const closeSaved = document.getElementById("closeSaved");
const clearAll = document.getElementById("clearAllSaved");

// DATA
let notesText = "";
let flashcards = [];
let currentCard = 0;
let knownCards = new Set();



//generate notes
generateBtn.addEventListener("click", async () => {
    const topic = input.value.trim();
    if (!topic) {
        alert("Enter a topic!");
        return;
    }

    notesView.innerHTML = "<p>⏳ Generating notes using AI...</p>";

    try {
        const res = await fetch("http://localhost:5000/api/ai/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ topic })
        });

        const data = await res.json();

        notesText = data.notes;
        flashcards = data.flashcards;

        notesView.innerHTML = notesText;
        notesView.style.display = "block";
        flashView.style.display = "none";

        currentCard = 0;
        updateFlashcard();

    } catch (err) {
        alert("Error generating notes.");
        console.error(err);
    }
});




//create flashcard
function createFlashcards(topic) {
    flashcards = [
        { front: `What is ${topic}?`, back: `${topic} is a concept used in...` },
        { front: `Why is ${topic} important?`, back: `It is important because...` },
        { front: `How does ${topic} work?`, back: `${topic} works by...` },
        { front: `Example of ${topic}`, back: `A simple example is...` }
    ];

    currentCard = 0;
    knownCards.clear();
    updateFlashcard();
}


toggleBtn.addEventListener("click", () => {
    if (notesView.style.display === "none") {
        // Switch to notes view
        notesView.style.display = "block";
        flashView.style.display = "none";
    } else {
        // Switch to flashcard view
        notesView.style.display = "none";
        flashView.style.display = "flex";
        updateFlashcard();
    }
});



function updateFlashcard() {
    const card = flashcards[currentCard];
    document.querySelector(".front").textContent = card.front;
    document.querySelector(".back").textContent = card.back;

    document.querySelector(".back").style.display = "none"; 
    cardProgress.textContent = `${currentCard + 1} / ${flashcards.length}`;
}


flipBtn.addEventListener("click", () => {
    const front = document.querySelector(".front");
    const back = document.querySelector(".back");

    if (back.style.display === "none") {
        back.style.display = "block";
        front.style.display = "none";
    } else {
        back.style.display = "none";
        front.style.display = "block";
    }
});


nextCardBtn.addEventListener("click", () => {
    if (currentCard < flashcards.length - 1) {
        currentCard++;
        updateFlashcard();
    }
});

prevCardBtn.addEventListener("click", () => {
    if (currentCard > 0) {
        currentCard--;
        updateFlashcard();
    }
});


markKnownBtn.addEventListener("click", () => {
    knownCards.add(currentCard);
    alert("Marked as known!");
});



saveBtn.addEventListener("click", () => {
    const saved = JSON.parse(localStorage.getItem("studify_notes") || "[]");
    saved.push(notesText);
    localStorage.setItem("studify_notes", JSON.stringify(saved));
    alert("Saved!");
});


openSavedBtn.addEventListener("click", () => {
    savedModal.classList.remove("hidden");

    const saved = JSON.parse(localStorage.getItem("studify_notes") || "[]");
    savedList.innerHTML = saved
        .map((item, i) => `<div class="saved-item"> <h4>Saved ${i + 1}</h4> ${item} </div>`)
        .join("");
});

closeSaved.addEventListener("click", () => {
    savedModal.classList.add("hidden");
});

clearAll.addEventListener("click", () => {
    localStorage.removeItem("studify_notes");
    savedList.innerHTML = "";
});



//export as pdf
const exportBtn = document.getElementById("exportbtn");

exportBtn.addEventListener("click", () => {
    if (!notesText) {
        alert("Generate notes first before exporting!");
        return;
    }

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
        unit: "pt",
        format: "a4"
    });

    pdf.setFont("Times", "normal");
    pdf.setFontSize(14);

    // Convert HTML to plain text for better PDF layout
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = notesText;
    const cleanText = tempDiv.innerText;

    const lines = pdf.splitTextToSize(cleanText, 500);

    pdf.text(lines, 50, 60);

    pdf.save("Studify_Notes.pdf");
});
