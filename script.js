let currentData = [];
let userAnswers = [];

async function loadCSV(path) {
    try {
        const response = await fetch(path);
        const text = await response.text();
        return text.trim().split('\n').map(row => {
            // Split by comma, ensuring we handle potential commas in quotes if needed
            return row.split(',').map(cell => cell.trim());
        });
    } catch (error) {
        alert("Error loading CSV file. Ensure the path is correct.");
        return [];
    }
}

async function loadContent(mode) {
    const std = document.getElementById('stdSelect').value;
    const sub = document.getElementById('subjectSelect').value;
    const unit = document.getElementById('unitSelect').value;

    if(!std || !sub || !unit) return alert("Please select all options");

    const filePath = `CSV_FILES/${std}/${sub}/${unit}`;
    currentData = await loadCSV(filePath);
    
    if (mode === 'notes') renderNotes();
}

function renderNotes() {
    const area = document.getElementById('displayArea');
    area.classList.remove('hidden');
    let html = `<h2 class="text-xl font-bold mb-4 text-emerald-800">Revision Notes</h2>`;
    
    currentData.forEach((q, idx) => {
        html += `
            <div class="bg-white p-5 rounded-lg shadow-sm mb-4 border-l-4 border-emerald-500">
                <p class="font-bold text-gray-800 mb-3">${idx + 1}. ${q[0]}</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div class="p-2 border rounded ${q[5] === q[1] ? 'bg-emerald-100 border-emerald-500 font-bold' : 'bg-gray-50 text-gray-400'}">${q[1]}</div>
                    <div class="p-2 border rounded ${q[5] === q[2] ? 'bg-emerald-100 border-emerald-500 font-bold' : 'bg-gray-50 text-gray-400'}">${q[2]}</div>
                    <div class="p-2 border rounded ${q[5] === q[3] ? 'bg-emerald-100 border-emerald-500 font-bold' : 'bg-gray-50 text-gray-400'}">${q[3]}</div>
                    <div class="p-2 border rounded ${q[5] === q[4] ? 'bg-emerald-100 border-emerald-500 font-bold' : 'bg-gray-50 text-gray-400'}">${q[4]}</div>
                </div>
            </div>`;
    });
    area.innerHTML = html;
}

function prepareTest() {
    toggleModal('testModal', true);
}

function toggleModal(id, show) {
    document.getElementById(id).style.display = show ? 'flex' : 'none';
}

async function startTest() {
    const std = document.getElementById('stdSelect').value;
    const sub = document.getElementById('subjectSelect').value;
    const unit = document.getElementById('unitSelect').value;
    const count = parseInt(document.getElementById('qCount').value);

    toggleModal('testModal', false);
    const filePath = `CSV_FILES/${std}/${sub}/${unit}`;
    const allData = await loadCSV(filePath);
    
    // Shuffle and slice
    currentData = allData.sort(() => 0.5 - Math.random()).slice(0, count);
    userAnswers = new Array(currentData.length).fill(null);
    renderTest();
}

function renderTest() {
    const area = document.getElementById('displayArea');
    area.classList.remove('hidden');
    let html = `<h2 class="text-xl font-bold mb-6 text-indigo-800">Mock Assessment</h2>`;
    
    currentData.forEach((q, qIdx) => {
        html += `
            <div class="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100">
                <p class="font-bold text-gray-800 mb-4 text-lg">${qIdx + 1}. ${q[0]}</p>
                <div class="space-y-2">
                    ${[1, 2, 3, 4].map(optIdx => `
                        <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-indigo-50 transition">
                            <input type="radio" name="q${qIdx}" value="${q[optIdx]}" class="mr-3 h-4 w-4" onchange="userAnswers[${qIdx}] = this.value">
                            <span>${q[optIdx]}</span>
                        </label>
                    `).join('')}
                </div>
            </div>`;
    });

    html += `<button onclick="submitTest()" class="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700">Submit Assessment</button>`;
    area.innerHTML = html;
    window.scrollTo(0, 0);
}

function submitTest() {
    let score = 0;
    const area = document.getElementById('displayArea');
    
    let resultHtml = `<div class="bg-indigo-900 text-white p-8 rounded-xl mb-8 text-center">
        <h2 class="text-3xl font-bold mb-2 text-white">Results Found</h2>`;
    
    let detailsHtml = "";

    currentData.forEach((q, idx) => {
        const isCorrect = userAnswers[idx] === q[5];
        if(isCorrect) score++;
        
        detailsHtml += `
            <div class="bg-white p-5 rounded-lg shadow-sm mb-4 border-l-4 ${isCorrect ? 'border-emerald-500' : 'border-red-500'}">
                <p class="font-bold text-gray-800 mb-2">${idx + 1}. ${q[0]}</p>
                <p class="text-sm">Your Answer: <span class="${isCorrect ? 'text-emerald-600' : 'text-red-600'} font-bold">${userAnswers[idx] || 'Skipped'}</span></p>
                ${!isCorrect ? `<p class="text-sm text-emerald-600 font-bold">Correct Answer: ${q[5]}</p>` : ''}
            </div>`;
    });

    resultHtml += `<p class="text-5xl font-black">${score} / ${currentData.length}</p></div>`;
    area.innerHTML = resultHtml + detailsHtml + `<button onclick="location.reload()" class="w-full bg-gray-800 text-white py-3 rounded-lg font-bold mt-4">Return to Dashboard</button>`;
    window.scrollTo(0, 0);
}
