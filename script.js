// 1. DYNAMIC MAPPING: Add your filenames here as you create them on GitHub
const repoData = {
    "6TH": {
        "HISTORY": [
            { id: "Unit1.csv", title: "Unit 1: What is History?" },
            { id: "Unit2.csv", title: "Unit 2: Human Evolution" },
            { id: "Unit3.csv", title: "Unit 3: Indus Civilisation" }
        ]
    },
    "7TH": {
        "HISTORY": [
            { id: "Unit1.csv", title: "Unit 1: Sources of Medieval India" }
        ]
    }
};

let currentQuestions = [];
let userAnswers = [];

// Update dropdowns based on selection
function updateUnits() {
    const std = document.getElementById('stdSelect').value;
    const sub = document.getElementById('subjectSelect').value;
    const unitDropdown = document.getElementById('unitSelect');
    
    unitDropdown.innerHTML = '<option value="">-- Select Unit --</option>';
    
    if(repoData[std] && repoData[std][sub]) {
        repoData[std][sub].forEach(unit => {
            const opt = document.createElement('option');
            opt.value = unit.id;
            opt.textContent = unit.title;
            unitDropdown.appendChild(opt);
        });
    }
}

async function loadAction(mode) {
    const std = document.getElementById('stdSelect').value;
    const sub = document.getElementById('subjectSelect').value;
    const file = document.getElementById('unitSelect').value;

    if(!file) return alert("Please select a Unit first!");

    const path = `CSV_FILES/${std}/${sub}/${file}`;
    document.getElementById('statusIndicator').textContent = "Fetching Data...";

    try {
        const response = await fetch(path);
        if(!response.ok) throw new Error("File not found");
        const rawText = await response.text();
        
        // Clean CSV parsing: splits rows then splits by comma
        currentQuestions = rawText.trim().split('\n')
            .filter(line => line.length > 10) // Ignore empty lines
            .map(line => line.split(',').map(item => item.trim()));

        if(mode === 'notes') {
            renderNotes();
        } else {
            closeModal();
            startMockTest();
        }
        document.getElementById('statusIndicator').textContent = "Data Loaded";
    } catch (err) {
        alert("Error: Check if file exists in: " + path);
        console.error(err);
    }
}

function renderNotes() {
    const area = document.getElementById('displayArea');
    let html = `<div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-black text-emerald-700 uppercase tracking-widest">Revision Notes</h2>
                    <span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm font-bold">${currentQuestions.length} Items</span>
                </div>`;
    
    currentQuestions.forEach((q, idx) => {
        html += `
        <div class="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-emerald-500 mb-4 animate-in fade-in duration-500">
            <p class="text-lg font-bold text-slate-800 mb-4">${idx + 1}. ${q[0]}</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${[1,2,3,4].map(i => `
                    <div class="p-3 rounded-xl border-2 ${q[5] === q[i] ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold' : 'bg-slate-50 border-slate-100 text-slate-400'}">
                        ${q[i]}
                    </div>
                `).join('')}
            </div>
        </div>`;
    });
    area.innerHTML = html;
}

function startMockTest() {
    const count = parseInt(document.getElementById('qCount').value) || 10;
    // Shuffle and pick questions
    const shuffled = [...currentQuestions].sort(() => 0.5 - Math.random()).slice(0, count);
    currentQuestions = shuffled;
    userAnswers = new Array(shuffled.length).fill(null);
    
    const area = document.getElementById('displayArea');
    let html = `<h2 class="text-2xl font-black text-indigo-700 mb-6 uppercase">Mock Assessment</h2>`;
    
    currentQuestions.forEach((q, qIdx) => {
        html += `
        <div class="bg-white p-8 rounded-2xl shadow-md border border-slate-100 mb-6">
            <p class="text-xl font-bold text-slate-800 mb-6">${qIdx + 1}. ${q[0]}</p>
            <div class="space-y-3">
                ${[1,2,3,4].map(i => `
                    <label class="flex items-center p-4 border-2 border-slate-100 rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                        <input type="radio" name="q${qIdx}" value="${q[i]}" onchange="userAnswers[${qIdx}] = this.value" class="w-5 h-5 text-indigo-600">
                        <span class="ml-4 text-slate-700 group-hover:text-indigo-900 font-medium">${q[i]}</span>
                    </label>
                `).join('')}
            </div>
        </div>`;
    });

    html += `<button onclick="submitTest()" class="w-full bg-indigo-700 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-indigo-800 transition-all transform active:scale-95 mb-20">SUBMIT FINAL ANSWERS</button>`;
    area.innerHTML = html;
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function submitTest() {
    let score = 0;
    currentQuestions.forEach((q, i) => { if(userAnswers[i] === q[5]) score++; });

    const area = document.getElementById('displayArea');
    let html = `
        <div class="bg-indigo-900 rounded-3xl p-10 text-center text-white mb-10 shadow-2xl animate-in zoom-in duration-300">
            <h2 class="text-2xl font-bold opacity-80 mb-2">Assessment Complete</h2>
            <div class="text-7xl font-black mb-4">${score} <span class="text-3xl opacity-50">/ ${currentQuestions.length}</span></div>
            <p class="text-indigo-200">Review your performance below</p>
        </div>
    `;

    currentQuestions.forEach((q, i) => {
        const isCorrect = userAnswers[i] === q[5];
        html += `
        <div class="bg-white p-6 rounded-2xl border-l-8 ${isCorrect ? 'border-emerald-500' : 'border-red-500'} mb-4 shadow-sm">
            <p class="font-bold text-slate-800 mb-2">${i+1}. ${q[0]}</p>
            <div class="flex flex-col gap-1 text-sm">
                <span class="${isCorrect ? 'text-emerald-600' : 'text-red-600'} font-bold">Your Choice: ${userAnswers[i] || 'No answer'}</span>
                ${!isCorrect ? `<span class="text-emerald-600 font-bold">Correct Answer: ${q[5]}</span>` : ''}
            </div>
        </div>`;
    });

    html += `<button onclick="window.location.reload()" class="w-full bg-slate-800 text-white py-4 rounded-xl font-bold mt-6">TRY ANOTHER TEST</button>`;
    area.innerHTML = html;
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function openTestModal() { document.getElementById('testModal').style.display = 'flex'; }
function closeModal() { document.getElementById('testModal').style.display = 'none'; }
