// CONFIGURATION - CHANGE THESE TO MATCH YOUR GITHUB
const GITHUB_USER = 'as-imgn2kion';
const REPO_NAME = 'TNPSC';
const BASE_PATH = 'CSV_FILES';

let currentQuestions = [];
let userAnswers = [];

// Initialize: Load Standards (6TH, 7TH, etc.)
async function initDashboard() {
    const stdSelect = document.getElementById('stdSelect');
    stdSelect.innerHTML = '<option value="">Loading...</option>';
    
    try {
        const folders = await fetchGitHubContent(BASE_PATH);
        stdSelect.innerHTML = '<option value="">-- Select Standard --</option>';
        folders.forEach(folder => {
            if(folder.type === 'dir') {
                const opt = document.createElement('option');
                opt.value = folder.name;
                opt.textContent = folder.name.replace('TH', 'th Standard');
                stdSelect.appendChild(opt);
            }
        });
    } catch (err) {
        stdSelect.innerHTML = '<option value="">Error loading</option>';
    }
}

// Update Subjects based on Standard
async function updateSubjects() {
    const std = document.getElementById('stdSelect').value;
    const subSelect = document.getElementById('subjectSelect');
    const unitSelect = document.getElementById('unitSelect');
    
    subSelect.innerHTML = '<option value="">Loading...</option>';
    unitSelect.innerHTML = '<option value="">-- Choose Subject first --</option>';

    if(!std) return subSelect.innerHTML = '<option value="">-- Select --</option>';

    try {
        const folders = await fetchGitHubContent(`${BASE_PATH}/${std}`);
        subSelect.innerHTML = '<option value="">-- Select Subject --</option>';
        folders.forEach(folder => {
            if(folder.type === 'dir') {
                const opt = document.createElement('option');
                opt.value = folder.name;
                opt.textContent = folder.name.charAt(0).toUpperCase() + folder.name.slice(1).toLowerCase();
                subSelect.appendChild(opt);
            }
        });
    } catch (err) {
        subSelect.innerHTML = '<option value="">None found</option>';
    }
}

// Update Units based on Subject
async function updateUnits() {
    const std = document.getElementById('stdSelect').value;
    const sub = document.getElementById('subjectSelect').value;
    const unitSelect = document.getElementById('unitSelect');

    unitSelect.innerHTML = '<option value="">Loading...</option>';

    try {
        const files = await fetchGitHubContent(`${BASE_PATH}/${std}/${sub}`);
        unitSelect.innerHTML = '<option value="">-- Select Unit --</option>';
        files.forEach(file => {
            if(file.name.endsWith('.csv')) {
                const opt = document.createElement('option');
                opt.value = file.name;
                // Cleans "Unit1.csv" to "Unit 1"
                opt.textContent = file.name.replace('.csv', '').replace('Unit', 'Unit ');
                unitSelect.appendChild(opt);
            }
        });
    } catch (err) {
        unitSelect.innerHTML = '<option value="">No CSVs found</option>';
    }
}

// Helper to talk to GitHub API
async function fetchGitHubContent(path) {
    const url = `https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/${path}`;
    const response = await fetch(url);
    if(!response.ok) throw new Error("API Error");
    return await response.json();
}

// Loading the actual CSV data
async function loadAction(mode) {
    const std = document.getElementById('stdSelect').value;
    const sub = document.getElementById('subjectSelect').value;
    const file = document.getElementById('unitSelect').value;

    if(!file) return alert("Please select a Unit!");

    // Construct the URL to the raw file content
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/main/${BASE_PATH}/${std}/${sub}/${file}`;
    
    document.getElementById('statusIndicator').textContent = "Fetching...";

    try {
        const response = await fetch(rawUrl);
        const rawText = await response.text();
        
        // Parse CSV (Splits by newline and then by comma)
        currentQuestions = rawText.trim().split('\n')
            .filter(line => line.length > 5) 
            .map(line => line.split(',').map(item => item.trim()));

        if(mode === 'notes') renderNotes();
        else { closeModal(); startMockTest(); }
        document.getElementById('statusIndicator').textContent = "Online";
    } catch (err) {
        alert("Failed to load CSV. Check naming/paths.");
    }
}

// Call init on page load
window.onload = initDashboard;

/* ... keep your previous renderNotes, startMockTest, submitTest functions here ... */
