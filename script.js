
const nameInput = document.getElementById("nameInput");
const addNameBtn = document.getElementById("addNameBtn");
const nameList = document.getElementById("nameList");
const generateBtn = document.getElementById("generateBtn");
const clearBtn = document.getElementById("clearBtn");
const pairsList = document.getElementById("pairsList");

let names = [];
let groupCount = 0;

addNameBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (name && !names.includes(name)) {
    names.push(name);
    updateNameList();
    nameInput.value = "";
    nameInput.focus();
    }
});

function updateNameList() {
    nameList.innerHTML = "";
    names.forEach((n, i) => {
    const li = document.createElement("li");
    li.textContent = n;
    li.title = "Klicka för att ta bort";
    li.addEventListener("click", () => {
        names.splice(i, 1);
        updateNameList();
    });
    nameList.appendChild(li);
    });
}

generateBtn.addEventListener("click", () => {
    if (names.length < 2) {
    alert("Lägg till minst två namn för att skapa par!");
    return;
    }

    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const pairs = [];

    for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
        pairs.push(`${shuffled[i]} ↔ ${shuffled[i + 1]}`);
    } else {
        pairs.push(`${shuffled[i]} (ingen partner)`);
    }
    }

    groupCount++;
    const groupDiv = createGroupElement(groupCount, pairs);
    pairsList.appendChild(groupDiv);

    names = [];
    updateNameList();
    saveState();
});

function createGroupElement(number, pairs) {
    const groupDiv = document.createElement("div");
    groupDiv.classList.add("group");
    groupDiv.dataset.group = number;

    const title = document.createElement("h3");
    title.innerHTML = `Grupp ${number} <button class="editBtn">Redigera</button>`;
    groupDiv.appendChild(title);

    const list = document.createElement("div");
    pairs.forEach(p => {
    const div = document.createElement("div");
    div.classList.add("pair-item");
    div.textContent = p;
    list.appendChild(div);
    });
    groupDiv.appendChild(list);

    title.querySelector(".editBtn").addEventListener("click", () => {
    toggleEditMode(groupDiv, pairs);
    });

    return groupDiv;
}

function toggleEditMode(groupDiv) {
    let editSection = groupDiv.querySelector(".edit-section");
    if (editSection) {
    editSection.remove();
    saveState();
    return;
    }

    editSection = document.createElement("div");
    editSection.classList.add("edit-section");

    const items = [...groupDiv.querySelectorAll(".pair-item")].map(el => el.textContent);
    const existingNames = items.flatMap(p => {
    const parts = p.split("↔").map(s => s.replace("(ingen partner)", "").trim());
    return parts.filter(n => n);
    });

    const editList = document.createElement("div");
    existingNames.forEach(name => {
    const item = document.createElement("div");
    item.classList.add("edit-item");
    item.textContent = name;
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.addEventListener("click", () => item.remove());
    item.appendChild(delBtn);
    editList.appendChild(item);
    });

    const input = document.createElement("input");
    input.placeholder = "Lägg till namn...";
    const addBtn = document.createElement("button");
    addBtn.textContent = "Lägg till";
    addBtn.addEventListener("click", () => {
    const newName = input.value.trim();
    if (newName) {
        const newItem = document.createElement("div");
        newItem.classList.add("edit-item");
        newItem.textContent = newName;
        const delBtn = document.createElement("button");
        delBtn.textContent = "❌";
        delBtn.addEventListener("click", () => newItem.remove());
        newItem.appendChild(delBtn);
        editList.appendChild(newItem);
        input.value = "";
    }
    });

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Spara";
    saveBtn.addEventListener("click", () => {
    const updatedNames = [...editList.querySelectorAll(".edit-item")]
        .map(el => el.childNodes[0].textContent);

    // Behåll gamla parnamn som finns kvar
    const oldPairs = [...groupDiv.querySelectorAll(".pair-item")].map(p => p.textContent);
    const usedNames = oldPairs.flatMap(p => p.split("↔").map(s => s.replace("(ingen partner)", "").trim()));
    const newNames = updatedNames.filter(n => !usedNames.includes(n));

    // Skapa nya par av de nya namnen
    const shuffled = [...newNames].sort(() => Math.random() - 0.5);
    const newPairs = [];
    for (let i = 0; i < shuffled.length; i += 2) {
        if (i + 1 < shuffled.length) {
        newPairs.push(`${shuffled[i]} ↔ ${shuffled[i + 1]}`);
        } else {
        newPairs.push(`${shuffled[i]} (ingen partner)`);
        }
    }

    // Kombinera gamla par som fortfarande gäller + nya par
    const remainingPairs = [];
    for (const p of oldPairs) {
        const [a, b] = p.split("↔").map(s => s.replace("(ingen partner)", "").trim());
        if (updatedNames.includes(a) && (!b || updatedNames.includes(b))) {
        remainingPairs.push(p);
        }
    }

    const combinedPairs = [...remainingPairs, ...newPairs];

    const newList = document.createElement("div");
    combinedPairs.forEach(p => {
        const div = document.createElement("div");
        div.classList.add("pair-item");
        div.textContent = p;
        newList.appendChild(div);
    });

    groupDiv.querySelectorAll(".pair-item").forEach(el => el.remove());
    groupDiv.insertBefore(newList, editSection);
    editSection.remove();
    saveState();
    });

    editSection.appendChild(editList);
    editSection.appendChild(input);
    editSection.appendChild(addBtn);
    editSection.appendChild(saveBtn);
    groupDiv.appendChild(editSection);
}

function saveState() {
    localStorage.setItem("pairsList", pairsList.innerHTML);
    localStorage.setItem("groupCount", groupCount);
}

clearBtn.addEventListener("click", () => {
    if (confirm("Är du säker på att du vill rensa alla grupper?")) {
    localStorage.removeItem("pairsList");
    localStorage.removeItem("groupCount");
    pairsList.innerHTML = "";
    groupCount = 0;
    }
});

window.addEventListener("load", () => {
    const savedPairs = localStorage.getItem("pairsList");
    const savedCount = localStorage.getItem("groupCount");
    if (savedPairs) {
    pairsList.innerHTML = savedPairs;
    groupCount = parseInt(savedCount) || 0;
    pairsList.querySelectorAll(".editBtn").forEach(btn => {
        const groupDiv = btn.closest(".group");
        btn.addEventListener("click", () => toggleEditMode(groupDiv));
    });
    }
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
