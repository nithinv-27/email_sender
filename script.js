let parsedData = []; // To store the parsed CSV data

// Function to parse CSV data
function parseCSV(csvData) {
    const rows = csvData.split("\n");
    return rows.map(row => row.split(","));
}

// Function to create a table with input fields
function createTableWithInputs(data) {
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    // Create header row
    const headerRow = document.createElement("tr");
    data[0].push("Prompt"); // Add "Prompt" column to header
    data[0].forEach(header => {
        const th = document.createElement("th");
        th.textContent = header.trim();
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Create data rows with input fields
    data.slice(1).forEach((row, rowIndex) => {
        const tr = document.createElement("tr");
        if (row.length == 1 && row[0] === "") {
            return;
        }
        row.forEach((cell, cellIndex) => {
            const td = document.createElement("td");
            td.textContent = cell.trim();
            td.dataset.key = data[0][cellIndex].trim().toLowerCase(); // Store header as key
            tr.appendChild(td);
        });

        // Add "Prompt" input field
        const promptTd = document.createElement("td");
        const promptInput = document.createElement("input");
        promptInput.type = "text";
        promptInput.name = `row-${rowIndex}-prompt`;
        promptTd.appendChild(promptInput);
        tr.appendChild(promptTd);

        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    return table;
}

// Function to replace placeholders in a prompt
function replacePlaceholders(prompt, rowData) {
    // Expand regex to match placeholders with spaces
    return prompt.replace(/\{([\w\s]+)\}/g, (match, key) => {
        const normalizedKey = key.toLowerCase().trim(); // Normalize the key
        const value = rowData[normalizedKey] || match; // Replace or keep placeholder

        // Debugging logs
        console.log("Row Data:", rowData); 
        console.log("Key being searched:", normalizedKey);
        console.log("Match:", match);
        console.log("Replacement value:", value);

        return value;
    });
}

// Function to generate the list of processed prompts
function generateProcessedPrompts() {
    const table = document.querySelector("table");
    const rows = Array.from(table.rows);
    const prompts = [];

    // Extract headers and normalize to lowercase
    const headers = Array.from(rows[0].cells).map(cell => cell.textContent.trim().toLowerCase());

    console.log("<<>>:: ", headers)
    rows.slice(1).forEach(row => {
        const rowData = {};
        const cells = Array.from(row.cells);

        // Map cell data to normalized headers
        cells.forEach((cell, index) => {
            if (index < headers.length - 1) { // Exclude the "Prompt" column
                rowData[headers[index]] = cell.textContent.trim();
            }
        });

        // Get the prompt input value
        const promptInput = row.querySelector("input");
        const rawPrompt = promptInput ? promptInput.value.trim() : "";
        // console.log(">>> rowData:: ", rowData)
        const processedPrompt = replacePlaceholders(rawPrompt, rowData);

        // Add processed prompt to the list
        if (processedPrompt) {
            prompts.push(processedPrompt);
        }
    });

    return prompts;
}


// Handle file input change
document.getElementById("csvFileInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const csvData = e.target.result;
            parsedData = parseCSV(csvData);
            const table = createTableWithInputs(parsedData);
            document.getElementById("tableContainer").innerHTML = ""; // Clear previous table
            document.getElementById("tableContainer").appendChild(table);
            document.getElementById("submitBtn").disabled = false; // Enable submit button
        };
        reader.readAsText(file);
    }
});

// Handle the submit button click
document.getElementById("submitBtn").addEventListener("click", async function () {
    const processedPrompts = generateProcessedPrompts();

    try {
        // Send the prompts to the backend
        const response = await fetch("http://localhost:8000/answer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompts: processedPrompts }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const returnedPrompts = data.data;

        // Update the table with the returned prompts
        updateTableWithReturnedPrompts(returnedPrompts);
        alert("Prompts processed and displayed successfully!");
    } catch (error) {
        console.error("Error uploading prompts:", error);
        alert("An error occurred while uploading.");
    }
});

// Call this function whenever the table changes
function updateTableWithReturnedPrompts(returnedPrompts) {
    const table = document.querySelector("table");
    const rows = Array.from(table.rows).slice(1);

    rows.forEach((row, index) => {
        let promptCell = row.querySelector("td.processed-prompt");
        if (!promptCell) {
            promptCell = document.createElement("td");
            promptCell.classList.add("processed-prompt");

            // Create a rich text box (textarea) for the processed prompt
            const promptTextArea = document.createElement("textarea");
            promptTextArea.name = `row-${index}-processed-prompt`;
            promptTextArea.rows = 3;
            promptTextArea.cols = 50;
            promptTextArea.style.width = "100%";
            promptTextArea.value = returnedPrompts[index] || "";
            promptTextArea.addEventListener("input", updateSendEmailsButtonState); // Add listener to update button state
            promptCell.appendChild(promptTextArea);

            row.appendChild(promptCell);
        } else {
            // Update existing rich text box
            const promptTextArea = promptCell.querySelector("textarea");
            promptTextArea.value = returnedPrompts[index] || "";
        }
    });

    // Update the button state after modifying the table
    updateSendEmailsButtonState();
}

function getEmailColumnIndex(table) {
    const headers = table.querySelectorAll("th");
    const emailColumnIndex = Array.from(headers).findIndex(header => {
        return header.textContent.trim().toLowerCase() === "email";
    });

    if (emailColumnIndex === -1) {
        throw new Error("Email column not found");
    }

    return emailColumnIndex;
}

// Function to update the "Send Emails" button state
function updateSendEmailsButtonState() {
    const table = document.querySelector("table");
    const rows = Array.from(table.rows).slice(1); // Exclude header row

    let emailColumnIndex;

    try {
        emailColumnIndex = getEmailColumnIndex(table); // Dynamically find the email column index
    } catch (error) {
        alert(error.message); // Show alert if email column is not found
        return;
    }

    // Check if there are any rows with non-empty email and processed prompts
    const hasValidData = rows.some(row => {
        const cells = row.querySelectorAll("td");

        const email = cells[emailColumnIndex]?.textContent.trim(); // Using dynamic index for email column
        const processedPrompt = cells[cells.length - 1]?.querySelector("textarea")?.value.trim(); // Last column has processed prompt

        return email && processedPrompt;
    });

    document.getElementById("sendEmailsBtn").disabled = !hasValidData;
}

// Handle the Send Emails button click
document.getElementById("sendEmailsBtn").addEventListener("click", async function () {
    const emailData = collectEmailData();

    try {
        const response = await fetch("http://localhost:8000/send-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(emailData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        alert("Emails sent successfully!");
        console.log("Server response:", result);
    } catch (error) {
        console.error("Error sending emails:", error);
        alert("An error occurred while sending emails.");
    }
});

// Function to collect email data from the table
function collectEmailData() {
    const table = document.querySelector("table");
    const rows = Array.from(table.rows).slice(1); // Exclude header row
    const emailData = [];
    emailColIndex = getEmailColumnIndex(table);

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");

        // Extract email and processed prompt
        const email = cells[emailColIndex]?.textContent.trim(); // Assuming the email is in the first column


        const processedPrompt = cells[cells.length - 1]?.querySelector("textarea")?.value.trim(); // Assuming processed prompt is in the last column

        if (email && processedPrompt) {
            emailData.push({ email, prompt: processedPrompt });
        }
    });

    return emailData;
}