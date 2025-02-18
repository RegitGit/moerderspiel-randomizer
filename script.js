//const { default: jsPDF } = require("jspdf");


let isTableVisible = false;

const handleNameInput = () => {
    const nameFields = document.querySelectorAll('.name-field');
    const lastField = nameFields[nameFields.length - 1];

    if (lastField.value.trim() !== '') {
        const newContainer = document.createElement('div');
        newContainer.className = 'name-container';

        const newNameField = document.createElement('input');
        newNameField.type = 'text';
        newNameField.placeholder = 'Name hinzufügen';
        newNameField.className = 'name-field';
        newNameField.oninput = handleNameInput;
        newContainer.appendChild(newNameField);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.tabIndex = "-1";
        deleteButton.classList.add("delete-button");
        deleteButton.onclick = () => deleteNameField(deleteButton);
        newContainer.appendChild(deleteButton);

        document.getElementById('name-column').appendChild(newContainer);

        if (nameFields.length > 1) {
            document.getElementById("randomizeButton").disabled = false;
        }
    }
};

const deleteNameField = (button) => {
    const container = button.parentElement;
    const inputField = container.querySelector('.name-field');

    const nameContainers = document.querySelectorAll('.name-container');
    if (nameContainers[nameContainers.length - 1] !== container) {
        container.remove();
        if (document.querySelectorAll('.name-container').length < 3) {
            document.getElementById("randomizeButton").disabled = true;
        }
    }
    else {
        inputField.value = '';
    }
};

var names;

const randomizeNames = () => {
    const nameFields = document.querySelectorAll('.name-field');
    names = Array.from(nameFields)
        .map(field => field.value.trim())
        .filter(name => name !== ''); // Filter out empty inputs

    if (names.length < 2) {
        alert('Bitte geben Sie mindestens zwei Namen ein!');
        return;
    }

    // Shuffle the names array
    names = shuffleArray(names);

    // Get all prompts and prepare for randomizing
    var allPrompts = getPrompts();
    allPrompts = shuffleArray(allPrompts);
    const length = allPrompts.length;
    var distributionArray = new Int16Array(length);
    const amount = Math.floor(names.length / length);
    var rest = names.length % length;

    var randomPrompts = [];
    for (let i = 0; i < distributionArray.length; i++) {
        distributionArray[i] = amount;
        if (rest > 0) {
            distributionArray[i] += 1;
            rest--;
        }
        for (let j = 0; j < distributionArray[i]; j++) {
            randomPrompts.push(allPrompts[i]);           
        }
    }

    // Generate the table
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = ''; // Clear previous table content

    for (let i = 0; i < names.length; i++) {
        const row = document.createElement('tr');

        const cell0 = document.createElement('td');
        cell0.textContent = i + 1 + "."; // Row number
        row.appendChild(cell0);

        const cell1 = document.createElement('td');
        cell1.textContent = names[i];
        row.appendChild(cell1);

        const cell2 = document.createElement('td');
        cell2.textContent = names[(i + 1) % names.length]; // Circular pairing
        row.appendChild(cell2);

        var prompt = "";
        if (length > 0) {
            var randomSelect = Math.floor(Math.random() * (randomPrompts.length - 1));
            prompt = randomPrompts[randomSelect];
            randomPrompts.splice(randomSelect, 1);
        }

        const cell3 = document.createElement('td');
        cell3.textContent = prompt;
        row.appendChild(cell3);

        tableBody.appendChild(row);
    }

    document.getElementById('generate-btn').disabled = false;
    document.getElementById('generate-btn').title = "";

    if (isTableVisible) {
        document.getElementById('table-container').style.display = 'block';
    }
};

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const setTableVisibility = (isVisible) => {
    isTableVisible = isVisible;
    const table = document.getElementById('table-body');
    if (!isVisible) {
        table.classList.add("hide-table");
    }
    else {
        table.classList.remove("hide-table");
    }
};


const savePromptFile = () => {
    if (document.getElementById("prompt-input").value.trim() === "") {
        return;
    }
    
    let name = prompt("Speichere als:").trim();
    if (name !== "" && name !== null) {
        let nameFound = true;
        let concat = "";
        let x = 0;
        while(nameFound) {
            nameFound = nameAlreadyTaken(name + concat);
            if (nameFound) {
                concat = "";
                x += 1;
                concat += x;
            }
            else {
                name += concat;
            }
        }
        localStorage.setItem(name, document.getElementById("prompt-input").value);
        createLoadElement(name);
    }
}

const createLoadElement = (name) => {
    const newLoadButton = document.createElement('button');
    newLoadButton.innerHTML = name;
    newLoadButton.className = 'load-btn';
    document.getElementById('load-container').appendChild(newLoadButton);
    newLoadButton.onclick = () => loadPromptFile(name);
    newLoadButton.ondblclick = () => deletePromptFile(name);
}

for (let i = 0; i < localStorage.length; i++) {
    let item = localStorage.getItem(localStorage.key(i));

    if (localStorage.key(i) === "loglevel" || item.charAt(0) === "\"" && item.substring(item.length - 3, item.length) === "==\"") {
        continue;
    }
    createLoadElement(localStorage.key(i));     
}

const nameAlreadyTaken = (name) => {
    let children = document.getElementById("load-container").children;
    for (let i = 1; i < children.length; i++) {
        if(children[i].innerHTML == name) {
            return true;
        }
    }
    return false;
}

const loadPromptFile = (key) => {
    let text = localStorage.getItem(key);
    if (text !== null) {
        document.getElementById('prompt-input').value = text;
    }
}

const deletePromptFile = (key) => {
    if(confirm("Soll " + key + " gelöscht werden?")) {
        localStorage.removeItem(key);
        let children = document.getElementById("load-container").children;
        for (let i = 1; i < children.length; i++) {
            if(children[i].innerHTML === key) {
                children[i].remove();
            }
        }
    }
}



var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

// PDF GENERATION
const generatePDF = () => {
    const pdf = new jsPDF();

    clearCanvasImg();

    const table = document.getElementById("table-body");

    let murderNames = [];
    // Murderer Text
    ctx.font = "bold " + murdererFontSize + " Arial";
    ctx.textAlign = "center";
    for (var i = 0; i < table.children.length; i++) {
        if (i !== 0 && i % 16 === 0) {
            if (doublesided) {
                addBackside(pdf, 16);
            }
            pdf.addPage();
        }

        var murderName = "";
        var victimName = "";
        var prompt = "";
        const tr = table.children[i];
        murderName = tr.children[1].innerHTML;
        murderNames.push(murderName);
        victimName = tr.children[2].innerHTML;
        prompt = tr.children[3].innerHTML;

        setCanvasImg(murderName, victimName, prompt);
        
        var imgData = c.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 12 + (92 * ((i % 16) % 2)), 8 + 35 * Math.floor((i % 16) / 2));
    }
    if (doublesided) {
        addBackside(pdf, murderNames);
    }
    else {
        clearCanvasImg();
    }
    defaultCanvas();
    pdf.save("murdergame_druck")
}

var doublesided = false;

const toggleDoublesided = () => {
    doublesided = !doublesided;
    let parent = document.getElementById("name-backside-toggle");
    parent.children[0].disabled = !doublesided;
    
    if (doublesided) {
    parent.style.opacity = "1";

    }
    else {
        parent.style.opacity = "0.5";
        parent.children[0].checked = false;
    }

}

var nameOnBackside = false;

const toggleBacksideName = () => {
    nameOnBackside = !nameOnBackside;
}


const getPrompts = () => {
    const seperator = document.getElementById("seperator-input").value;
    const promptsText = document.getElementById("prompt-input").value;

    var allPrompts = promptsText.split(seperator);
    for (let i = 0; i < allPrompts.length; i++) {
        var prompt = allPrompts[i].trimStart().trimEnd();
        if (prompt === '') {
            allPrompts.splice(i, 1);
        }
    }
    return allPrompts;
}

const addBackside = (pdf, murderNames) => {
    pdf.addPage();
    clearCanvasImg();
    var imgData = c.toDataURL("image/png");
    for (var d = 0; d < murderNames.length; d++) {
        if (nameOnBackside) {
            addTextToCanvas(murdererFontStyle + " " + murdererFontSize + " " + murdererFontType, murdererValueText + murderNames[d], [murdererValueX, 133 - murdererValueY])
            imgData = c.toDataURL("image/png");
        }
        pdf.addImage(imgData, "PNG", 12 + (92 * (((d % 16) + 1) % 2)), 8 + 35 * Math.floor((d % 16) / 2));
        if (nameOnBackside) clearCanvasImg();
    }
}

const clearCanvasImg = () => {
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.clearRect(1, 1, c.width - 2, c.height - 2)
}

const addTextToCanvas = (font, text, coords) => {
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, coords[0], coords[1]);
}

const setCanvasImg = (murderName, victimName, prompt) => {
    clearCanvasImg();

    addTextToCanvas(murdererFontStyle + " " + murdererFontSize + " " + murdererFontType, murdererValueText + murderName, [murdererValueX, 133 - murdererValueY])

    if (prompt !== "") {
        const { height } = drawText(ctx, promptValueText + prompt, {
            x: Number(promptValueX),
            y: 133 - Number(promptValueY),
            width: promptWidth,
            height: promptHeight,
            font: promptFontType,
            fontSize: Number(promptFontSize),
            fontStyle: promptFontStyle,
            align: "center",
            vAlign: "middle",
            debug:false
        })
    }
    
    addTextToCanvas(victimFontStyle + " " + victimFontSize + " " + victimFontType, victimValueText + victimName, [victimValueX, 133 - victimValueY])
}

const { drawText, getTextHeight, splitText } = window.canvasTxt;

const promptWidth = 280;
const promptHeight = 50;

const defaultCanvas = () => {
    adjustedCanvas();
}

const adjustedCanvas = () => {
    switch(currentlyAdjusting) {
        // 0 = Murderer
        case 0:
            murdererValueText = document.getElementById("prefix-text-field").value;
            murdererValueX = document.getElementById("text-x-axis").value;
            murdererValueY = document.getElementById("text-y-axis").value;
            murdererFontStyle = (document.getElementById("bold-toggle").checked ? "bold " : "") + (document.getElementById("italic-toggle").checked ? "italic " : "");
            murdererFontType = document.getElementById("font").value;
            murdererFontSize = document.getElementById("font-size-slider").value + "px";
            break;
        // 1 = Victim
        case 1:
            victimValueText = document.getElementById("prefix-text-field").value;
            victimValueX = document.getElementById("text-x-axis").value;
            victimValueY = document.getElementById("text-y-axis").value;
            victimFontStyle = (document.getElementById("bold-toggle").checked ? "bold " : "") + (document.getElementById("italic-toggle").checked ? "italic " : "");
            victimFontType = document.getElementById("font").value;
            victimFontSize = document.getElementById("font-size-slider").value + "px";
            break;
        // 2 = Prompt
        case 2:
            promptValueText = document.getElementById("prefix-text-field").value;
            promptValueX = document.getElementById("text-x-axis").value - (promptWidth / 2);
            promptValueY = Number(document.getElementById("text-y-axis").value) + (promptHeight / 2);
            promptFontStyle = (document.getElementById("bold-toggle").checked ? "bold " : "") + (document.getElementById("italic-toggle").checked ? "italic " : "");
            promptFontType = document.getElementById("font").value;
            promptFontSize = document.getElementById("font-size-slider").value;
            break;
    }
    setCanvasImg("\"Mördername\"", "\"Opfername\"", "Hier steht die Aufgabe oder ein Gegenstand, falls welche zugeordnet sind");
}

const resetSlider = (slider) => {
    if (currentlyAdjusting == 0) {
        slider.value = slider.getAttribute("defaultM");
    }
    else if (currentlyAdjusting == 1) {
        slider.value = slider.getAttribute("defaultV");
    }
    else if (currentlyAdjusting == 2) {
        slider.value = Number(slider.getAttribute("defaultP") - (promptHeight / 2));
    }
    adjustedCanvas();
}

let currentlyAdjusting = 0;
let murdererValueText = "";
let murdererValueX = c.width / 2;
let murdererValueY = 103;
let murdererFontStyle = "bold";
let murdererFontType = "Arial";
let murdererFontSize = "14px";
let victimValueText = "Opfer: ";
let victimValueX = c.width / 2;
let victimValueY = 18;
let victimFontStyle = "bold";
let victimFontType = "Arial";
let victimFontSize = "14px";
let promptValueText = "";
let promptValueX = (c.width / 2) - (promptWidth / 2);
let promptValueY = 62 + (promptHeight / 2);
let promptFontStyle = "";
let promptFontType = "Arial";
let promptFontSize = 12;

document.getElementById("text-x-axis").value = murdererValueX;
document.getElementById("text-y-axis").setAttribute("defaultM", murdererValueY);
document.getElementById("text-y-axis").setAttribute("defaultV", victimValueY);
document.getElementById("text-y-axis").setAttribute("defaultP", promptValueY);
defaultCanvas();

const switchAdjustingText = (btn) => {
    currentlyAdjusting = Number(btn.getAttribute("caseId"));
    let adjustParent = document.getElementById("adjust-parent");
    for (let i = 0; i < adjustParent.children.length; i++) {
        let element = adjustParent.children[i];
        if (Number(element.getAttribute("caseId")) !== currentlyAdjusting) {
            element.disabled = false;
        }
        else {
            element.disabled = true;
        }
    }
    switch (currentlyAdjusting) {
        // 0 = Murderer
        case 0:
            document.getElementById("prefix-text-field").value = murdererValueText;
            document.getElementById("text-x-axis").value = murdererValueX;
            document.getElementById("text-y-axis").value = murdererValueY;
            document.getElementById("bold-toggle").checked = murdererFontStyle.includes("bold");
            document.getElementById("italic-toggle").checked = murdererFontStyle.includes("italic");
            document.getElementById("font").value = murdererFontType;
            document.getElementById("font-size-slider").value = murdererFontSize.replace("px", "");
            break;
        // 1 = Victim
        case 1:
            document.getElementById("prefix-text-field").value = victimValueText;
            document.getElementById("text-x-axis").value = victimValueX;
            document.getElementById("text-y-axis").value = victimValueY;
            document.getElementById("bold-toggle").checked = victimFontStyle.includes("bold");
            document.getElementById("italic-toggle").checked = victimFontStyle.includes("italic");
            document.getElementById("font").value = victimFontType;
            document.getElementById("font-size-slider").value = victimFontSize.replace("px", "");
            break;
        // 2 = Prompt
        case 2:
            document.getElementById("prefix-text-field").value = promptValueText;
            document.getElementById("text-x-axis").value = promptValueX + (promptWidth / 2);
            document.getElementById("text-y-axis").value = promptValueY - (promptHeight / 2);
            document.getElementById("bold-toggle").checked = promptFontStyle.includes("bold");
            document.getElementById("italic-toggle").checked = promptFontStyle.includes("italic");
            document.getElementById("font").value = promptFontType;
            document.getElementById("font-size-slider").value = promptFontSize;
            break;
    }
}