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

        document.querySelector('.entry').appendChild(newContainer);
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
    for (let i = names.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [names[i], names[j]] = [names[j], names[i]];
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

        tableBody.appendChild(row);
    }

    if (isTableVisible) {
        document.getElementById('table-container').style.display = 'block';
    }
};

const setTableVisibility = (isVisible) => {
    isTableVisible = isVisible;
    document.getElementById('table-container').style.display = isVisible ? 'block' : 'none';
};


// PDF GENERATION
const generatePDF = () => {
    const pdf = new jsPDF();
    
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");

    // Border
    ctx.fillRect(0, 0, c.width, c.height)

    // Murderer Text
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    for (var i = 0; i < names.length; i++) {
        if (i !== 0 && i % 16 === 0) {
            pdf.addPage();
        }
        ctx.clearRect(1, 1, c.width - 2, c.height - 2)
        ctx.strokeText(names[i], c.width / 2, 30);

        // Victim Text
        ctx.font = "12px Arial";
        var victimText = document.getElementById("victim-text-field").value;
        if (victimText !== "") {
            victimText += ": ";
        }
        ctx.strokeText(victimText + names[(i + 1) % names.length], c.width / 2, 120);
        
        var imgData = c.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 12 + (92 * ((i % 16) % 2)), 8 + 35 * Math.floor((i % 16) / 2));
    }
    pdf.save("abc")
    
    
}