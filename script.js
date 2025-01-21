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
        deleteButton.onclick = () => deleteNameField(deleteButton);
        newContainer.appendChild(deleteButton);

        document.getElementById('name-column').appendChild(newContainer);
    }
};

const deleteNameField = (button) => {
    const container = button.parentElement;
    const inputField = container.querySelector('.name-field');

    const nameContainers = document.querySelectorAll('.name-container');
    if (nameContainers[nameContainers.length - 1] !== container) {
        container.remove();
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
    console.log("am: " + amount)
    var rest = names.length % length;
    console.log("rest: " + rest)

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
        var fileName = "Aufgaben.txt";
        var fileContent = "";
        var myFile;

        var dlBtn = document.getElementById("save-prompt-button");
        window.URL = window.URL || window.webkitURL;
        fileContent = document.getElementById("prompt-input").value;
        console.log(fileContent)
        myFile = new Blob([fileContent], {type: 'text/plain'});
        dlBtn.setAttribute("href", window.URL.createObjectURL(myFile));
        dlBtn.setAttribute("download", fileName);
    }

    



var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");


// PDF GENERATION
const generatePDF = (doublesided = false) => {
    const pdf = new jsPDF();

    clearCanvasImg();

    const table = document.getElementById("table-body");

    // Murderer Text
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    for (var i = 0; i < table.children.length; i++) {
        if (i !== 0 && i % 16 === 0) {
            if (doublesided) {
                addBackside(pdf, 16);
            }
            pdf.addPage();
        }

        var victimText = document.getElementById("victim-text-field").value;
        if (victimText !== "") {
            victimText += ": ";
        }

        var murderName = "";
        var victimName = "";
        var prompt = "";
        const tr = table.children[i];
        murderName = tr.children[1].innerHTML;
        victimName = tr.children[2].innerHTML;
        prompt = tr.children[3].innerHTML;

        setCanvasImg(murderName, [c.width / 2, 30], victimText + victimName, [c.width / 2, 120], prompt, [c.width / 2 - promptWidth / 2, 70 - promptHeight / 2]);
        
        var imgData = c.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 12 + (92 * ((i % 16) % 2)), 8 + 35 * Math.floor((i % 16) / 2));
    }
    if (doublesided) {
        addBackside(pdf, names.length);
    }
    else {
        clearCanvasImg();
    }
    defaultCanvas();
    pdf.save("abc")
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

const addBackside = (pdf, rectAmount) => {
    pdf.addPage();
    clearCanvasImg();
    var imgData = c.toDataURL("image/png");
    for (var d = 0; d < rectAmount; d++) {
        pdf.addImage(imgData, "PNG", 12 + (92 * (((d % 16) + 1) % 2)), 8 + 35 * Math.floor((d % 16) / 2));
    }
}

const clearCanvasImg = () => {
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.clearRect(1, 1, c.width - 2, c.height - 2)
}

const setCanvasImg = (murderName, murderCoords, victimName, victimCoords, prompt, promptCoords) => {
    clearCanvasImg();

    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(murderName, murderCoords[0], murderCoords[1]);
    
    ctx.font = "bold 12px Arial";
    ctx.fillText(victimName, victimCoords[0], victimCoords[1]);

    if (prompt !== "") {
        ctx.font = "10px Arial";
        const { height } = drawText(ctx, prompt, {
            x: promptCoords[0],
            y: promptCoords[1],
            width: promptWidth,
            height: promptHeight,
            fontSize: 12,
            align: "center",
            vAlign: "middle",
            debug:false
          })
    }
}

const { drawText, getTextHeight, splitText } = window.canvasTxt;

var promptWidth = 280;
var promptHeight = 50;

const defaultCanvas = () => {
    setCanvasImg("Mördername", [c.width / 2, 30], "Opfername", [c.width / 2, 120], "Hier steht die Aufgabe oder ein Gegenstand", [c.width / 2 - promptWidth / 2, 70 - promptHeight / 2]);
}

defaultCanvas();