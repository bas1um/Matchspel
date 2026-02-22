// --- Referenser ---
const nameInput = document.getElementById("nameInput");
const addNameBtn = document.getElementById("addNameBtn");
const nameList = document.getElementById("nameList");
const generateSinglesBtn = document.getElementById("generateSinglesBtn");
const generateDoublesBtn = document.getElementById("generateDoublesBtn");
const clearBtn = document.getElementById("clearBtn");
const pairsList = document.getElementById("pairsList");

let names = [];
let groupCount = 0;

// --- Namnhantering ---
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

// --- Skapa Grupper ---
generateSinglesBtn.addEventListener("click", () => {
    if (names.length < 2) return alert("Lägg till minst två namn!");
    createMatchGroup(2);
});

generateDoublesBtn.addEventListener("click", () => {
    if (names.length < 2) return alert("Lägg till minst två namn!");
    createMatchGroup(4);
});

function createMatchGroup(size) {
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const matches = generateMatchStrings(shuffled, size);

    groupCount++;
    const groupDiv = createGroupElement(groupCount, matches);
    pairsList.appendChild(groupDiv);

    names = [];
    updateNameList();
    saveState();
}

// Hjälpfunktion för att bygga textsträngarna (Nu enbart med ↔)
function generateMatchStrings(nameArray, size) {
    const res = [];
    for (let i = 0; i < nameArray.length; i += size) {
        if (size === 2) {
            res.push(nameArray[i + 1] ? `${nameArray[i]} ↔ ${nameArray[i+1]}` : `${nameArray[i]} (ingen partner)`);
        } else {
            if (i + 3 < nameArray.length) {
                res.push(`${nameArray[i]} & ${nameArray[i+1]} ↔ ${nameArray[i+2]} & ${nameArray[i+3]}`);
            } else if (i + 1 < nameArray.length) {
                res.push(`${nameArray[i]} & ${nameArray[i+1]} (väntar på motstånd)`);
            } else {
                res.push(`${nameArray[i]} (behöver partner)`);
            }
        }
    }
    return res;
}

// --- Grupp-elementet ---
function createGroupElement(number, pairs) {
    const groupDiv = document.createElement("div");
    groupDiv.classList.add("group");

    const title = document.createElement("h3");
    title.innerHTML = `
    <button class="shuffleBtn" title="Blanda om gruppen">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
    </button> 
    <span>Grupp ${number}</span> 
    <button class="editBtn" title="Redigera namn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
    </button>
`;
    groupDiv.appendChild(title);

    const listContainer = document.createElement("div");
    listContainer.classList.add("list-container");
    pairs.forEach(p => {
        const div = document.createElement("div");
        div.classList.add("pair-item");
        div.textContent = p;
        listContainer.appendChild(div);
    });
    groupDiv.appendChild(listContainer);

    // Event Listeners
    title.querySelector(".shuffleBtn").addEventListener("click", () => shuffleExistingGroup(groupDiv));
    title.querySelector(".editBtn").addEventListener("click", () => toggleEditMode(groupDiv));

    return groupDiv;
}

// --- Blanda existerande grupp ---
function shuffleExistingGroup(groupDiv) {
    const items = [...groupDiv.querySelectorAll(".pair-item")];
    const allNames = items.flatMap(el => 
        el.textContent.split(/[↔&]/) // Splittar nu enbart på ↔ och &
        .map(n => n.replace(/\(.*\)/, "").trim())
        .filter(n => n !== "")
    );
    
    const reshuffled = allNames.sort(() => Math.random() - 0.5);
    const isDouble = items[0].textContent.includes("&");
    const newMatches = generateMatchStrings(reshuffled, isDouble ? 4 : 2);
    
    const container = groupDiv.querySelector(".list-container");
    container.innerHTML = "";
    newMatches.forEach(m => {
        const div = document.createElement("div");
        div.classList.add("pair-item");
        div.textContent = m;
        container.appendChild(div);
    });
    saveState();
}

// --- REDIGERINGSLOGIK ---
function toggleEditMode(groupDiv) {
    let editSection = groupDiv.querySelector(".edit-section");
    if (editSection) {
        editSection.remove();
        saveState();
        return;
    }

    editSection = document.createElement("div");
    editSection.classList.add("edit-section");

    const items = [...groupDiv.querySelectorAll(".pair-item")];
    const namesInGroup = items.flatMap(el => 
        el.textContent.split(/[↔&]/)
        .map(n => n.replace(/\(.*\)/, "").trim())
        .filter(n => n !== "")
    );

    const editList = document.createElement("div");
    namesInGroup.forEach(name => {
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
    input.placeholder = "Nytt namn...";

    const addBtn = document.createElement("button");
    addBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5V19M5 12H19"/>
        </svg>`;
    addBtn.title = "Lägg till";
    addBtn.classList.add("icon-btn");
    
    addBtn.onclick = () => {
        if (input.value.trim()) {
            const item = document.createElement("div");
            item.classList.add("edit-item");
            item.textContent = input.value.trim();
            const delBtn = document.createElement("button");
            delBtn.textContent = "❌";
            delBtn.onclick = () => item.remove();
            item.appendChild(delBtn);
            editList.appendChild(item);
            input.value = "";
        }
    };

    const saveBtn = document.createElement("button");
    saveBtn.title = "Spara";
    saveBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    `;
    saveBtn.onclick = () => {
        const updatedNames = [...editList.querySelectorAll(".edit-item")].map(el => el.childNodes[0].textContent);
        const isDouble = items.length > 0 && items[0].textContent.includes("&");
        const newMatches = generateMatchStrings(updatedNames, isDouble ? 4 : 2);
        
        const container = groupDiv.querySelector(".list-container");
        container.innerHTML = "";
        newMatches.forEach(m => {
            const div = document.createElement("div");
            div.classList.add("pair-item");
            div.textContent = m;
            container.appendChild(div);
        });
        editSection.remove();
        saveState();
    };

    editSection.append(editList, input, addBtn, saveBtn);
    groupDiv.appendChild(editSection);
}

// --- Persistence ---
function saveState() {
    localStorage.setItem("pairsList", pairsList.innerHTML);
    localStorage.setItem("groupCount", groupCount);
}

clearBtn.addEventListener("click", () => {
    if (confirm("Rensa allt?")) {
        pairsList.innerHTML = "";
        groupCount = 0;
        localStorage.clear();
    }
});

window.addEventListener("load", () => {
    const savedPairs = localStorage.getItem("pairsList");
    if (savedPairs) {
        pairsList.innerHTML = savedPairs;
        groupCount = parseInt(localStorage.getItem("groupCount")) || 0;
        
        pairsList.querySelectorAll(".group").forEach(groupDiv => {
            const eb = groupDiv.querySelector(".editBtn");
            const sb = groupDiv.querySelector(".shuffleBtn");
            if(eb) eb.onclick = () => toggleEditMode(groupDiv);
            if(sb) sb.onclick = () => shuffleExistingGroup(groupDiv);
        });
    }
});