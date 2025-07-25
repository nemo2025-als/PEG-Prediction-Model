// Configurazione dei modelli
const models = {
    1: {
        name: "Anamnestic Prediction Model",
        fields: [
            { id: "age", label: "Age at Evaluation, years", type: "number", min: 18, max: 100 },
            { id: "onset_site", label: "Site of Onset", type: "select", 
              options: [
                { value: "bulbar", label: "Bulbar" },
                { value: "spinal", label: "Spinal" }
              ]
            },
            { id: "NIV_use", label: "Use of NIV at Evaluation", type: "select",
              options: [
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" }
              ]
            }
        ],
        calculate: (data) => {
            const onsetWeight = data.onset_site === "bulbar" ? 1 : 0;
            const NIVWeight = data.NIV_use === "yes" ? 1 : 0;
            const logit = -2.9255 + (0.0408 * data.age) + (0.9503 * onsetWeight) + (1.0346 * NIVWeight);
            return 1 / (1 + Math.exp(-logit));
        }
    },
    2: {
        name: "Anamnestic and Functional Prediction Model",
        fields: [
            { id: "age", label: "Age at Evaluation, years", type: "number", min: 18, max: 100 },
            { id: "bulbar_score", label: "Bulbar Subscore", type: "number", min: 0, max: 12 },
            { id: "fvc", label: "FVC%, seated", type: "number", min: 0, max: 150, step: 0.1 }
        ],
        calculate: (data) => {
            const logit = 3.3238 + (0.0730 * data.age) + (-0.6943 * data.bulbar_score) + (-0.0317 * data.fvc);
            return 1 / (1 + Math.exp(-logit));
        }
    },
    3: {
        name: "Anamnestic and Nutritional Prediction Model",
        fields: [
            { id: "age", label: "Age at Evaluation, years", type: "number", min: 18, max: 100 },
            { id: "onset_site", label: "Site of Onset", type: "select", 
              options: [
                { value: "bulbar", label: "Bulbar" },
                { value: "spinal", label: "Spinal" }
              ]
            },
            { id: "NIV_use", label: "Use of NIV at Evaluation", type: "select",
              options: [
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" }
              ]
            },
            { id: "bmi", label: "BMI at Evaluation, kg/m²", type: "number", min: 10, max: 50, step: 0.1 },
            { id: "pre_weight", label: "Premorbid Weight, kg", type: "number", min: 0, max: 150 },
            { id: "post_weight", label: "Weight at Evaluation, kg", type: "number", min: 0, max: 150 },
            { id: "onset_date", label: "Date of Disease Onset", type: "date", min: "1900-01-01", max: new Date().toISOString().split("T")[0] },
            { id: "eval_date", label: "Date of Evaluation", type: "date", min: "1900-01-01", max: new Date().toISOString().split("T")[0] }
        ],
        calculate: (data) => {
            const getMonthDifference = (startDate, endDate) => {
                const start = new Date(startDate);
                const end = new Date(endDate);
                const years = end.getFullYear() - start.getFullYear();
                const months = end.getMonth() - start.getMonth();
                const totalMonths = years * 12 + months;
                const daysInMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
                const dayFraction = (end.getDate() - start.getDate()) / daysInMonth;
                return +(totalMonths + dayFraction).toFixed(1);
            };
            
            const onsetWeight = data.onset_site === "bulbar" ? 1 : 0;
            const NIVWeight = data.NIV_use === "yes" ? 1 : 0;
            const timeSinceOnsetMonths = getMonthDifference(data.onset_date, data.eval_date);
            
            const logit = 0.9190 + (0.0455 * data.age) + (0.7473 * onsetWeight) + 
                          (1.2324 * NIVWeight) + (-0.2014 * data.bmi) + 
                          (0.8990 * (100 * (1 - data.post_weight/data.pre_weight)) / timeSinceOnsetMonths);
            return 1 / (1 + Math.exp(-logit));
        }
    }
};

// Valori predittivi specifici per ogni modello basati sul file Excel
const modelPredictiveValues = {
    1: { // A-PM
        0.0: 0,
        0.2: 25,
        0.3: 28,
        0.4: 32,
        0.5: 34,
        0.6: 66,
        0.7: 80,
        0.8: 94,
        0.9: 100,
        1.0: 100
    },
    2: { // AF-PM
        0.0: 0,
        0.2: 9,
        0.3: 14,
        0.4: 17,
        0.5: 18,
        0.6: 87,
        0.7: 88,
        0.8: 92,
        0.9: 99,
        1.0: 100
    },
    3: { // AN-PM
        0.0: 0,
        0.2: 9,
        0.3: 14,
        0.4: 16,
        0.5: 18,
        0.6: 87,
        0.7: 88,
        0.8: 92,
        0.9: 99,
        1.0: 100
    }
};

// Cutoff specifici per ogni modello
const modelCutoffs = {
    1: 0.5258,
    2: 0.5779,
    3: 0.5167
};

let selectedModel = null;

// Seleziona un modello
function selectModel(modelId) {
    selectedModel = modelId;
    
    // Aggiorna UI delle card
    document.querySelectorAll('.model-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-model="${modelId}"]`).classList.add('active');
    
    // Mostra il form
    showForm(modelId);
}


// Mostra il form con i campi del modello selezionato
function showForm(modelId) {
    const model = models[modelId];
    const formSection = document.getElementById('form-section');
    const formFields = document.getElementById('form-fields');
    const modelTitle = document.getElementById('model-title');
    
    // Aggiorna titolo
    modelTitle.textContent = model.name;
    
    // Aggiungi o rimuovi la classe per il modello 3
    if (modelId === 3) {
        formFields.classList.add('four-columns');
    } else {
        formFields.classList.remove('four-columns');
    }
    
    // Genera i campi del form
    formFields.innerHTML = '';
    model.fields.forEach(field => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        if (field.type === 'select') {
            formGroup.innerHTML = `
                <label for="${field.id}">${field.label}</label>
                <select id="${field.id}" name="${field.id}" required>
                    <option value="">Select...</option>
                    ${field.options.map(opt => 
                        `<option value="${opt.value}">${opt.label}</option>`
                    ).join('')}
                </select>
            `;
        } else {
            formGroup.innerHTML = `
                <label for="${field.id}">${field.label}</label>
                <input type="${field.type}" 
                       id="${field.id}" 
                       name="${field.id}" 
                       min="${field.min || ''}" 
                       max="${field.max || ''}" 
                       step="${field.step || '1'}"
                       required>
            `;
        }
        
        formFields.appendChild(formGroup);
    });
    
    // Mostra la sezione del form
    formSection.classList.remove('hidden');
    document.getElementById('results-section').classList.add('hidden');

     // Scrolla ai risultati
    formSection.scrollIntoView({ behavior: 'smooth' });
}

// Gestisce il submit del form
document.getElementById('prediction-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Raccogli i dati del form
    const formData = new FormData(e.target);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = isNaN(value) ? value : parseFloat(value);
    }
    
    // Calcola la predizione
    const model = models[selectedModel];
    const prediction = model.calculate(data);
    
    // Mostra i risultati
    showResults(prediction);
});

// Mostra i risultati
function showResults(prediction) {
    const resultsSection = document.getElementById('results-section');
    const probLevelElement = document.getElementById('prob-level');
    const probDescription = document.getElementById('prob-description');
    const interpretation = document.getElementById('result-interpretation');
    
    // Usa il cutoff specifico del modello
    const cutoff = modelCutoffs[selectedModel];
    
    // Determina il livello di rischio
    let prob = '';
    let descriptionText = '';
    
    if (prediction < cutoff) {
        prob = 'Low';
        descriptionText = '<strong>The patient is not expected to require PEG placement</strong> within the next 6 months.<br>Continue standard monitoring.';
    } else {
        prob = 'High';
        descriptionText = '<strong>The patient is expected to require PEG placement</strong> within the next 6 months.<br>A specialist assessment is recommended.';
    }
    
    // Aggiorna il livello di rischio con il valore della predizione
    probLevelElement.innerHTML = `${prob}`;
    probLevelElement.style.color = prob === 'High' ? '#e74c3c' : '#27ae60';
    
    // Aggiorna la descrizione del rischio
    probDescription.innerHTML = descriptionText;
    
    // Ottieni i valori predittivi specifici per il modello
    const predictiveValues = modelPredictiveValues[selectedModel];
    
    // Calcola i valori della coorte con i casi particolari
    let cohortText = '';
    let patientsValue = null;
    
    // Caso 1: predizione > 0.5 ma < cutoff
    if (prediction > 0.5 && prediction < cutoff) {
        patientsValue = predictiveValues[0.5];
    }
    // Caso 2: predizione < 0.6 ma > cutoff
    else if (prediction < 0.6 && prediction > cutoff) {
        patientsValue = predictiveValues[0.6];
    }
    // Altri casi
else {
    const lowerDecile = Math.floor(prediction * 10) / 10;
    const upperDecile = Math.ceil(prediction * 10) / 10;
    
    // Gestisci i casi speciali per valori molto bassi
    let actualLower = lowerDecile;
    let actualUpper = upperDecile;
    
    // Se il valore calcolato non esiste nell'array, trova il più vicino
    if (!(actualLower in predictiveValues)) {
        // Per valori sotto 0.2, usa 0.0
        actualLower = 0.0;
    }
    
    if (!(actualUpper in predictiveValues)) {
        // Trova il decile successivo disponibile
        const availableDeciles = [0.0, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
        for (let decile of availableDeciles) {
            if (decile >= upperDecile) {
                actualUpper = decile;
                break;
            }
        }
        // Se non trovato, usa 0.2 come fallback
        if (!(actualUpper in predictiveValues)) {
            actualUpper = 0.2;
        }
    }
    
    // Se cade esattamente su un decile o tra decili con stesso valore
    if (actualLower === actualUpper || predictiveValues[actualLower] === predictiveValues[actualUpper]) {
        patientsValue = predictiveValues[actualLower];
    } else {
        // Mostra range solo se i valori sono diversi
        const lowerPatients = predictiveValues[actualLower];
        const upperPatients = predictiveValues[actualUpper];
        cohortText = `Based on the clinical data provided, <strong>among 100 patients</strong> with the same disease conditions, <br><strong>between ${lowerPatients} - ${upperPatients} are expected to actually require PEG placement</strong> within 6 months.`;
        }
    }
    
    // Se abbiamo un valore singolo, costruisci il testo
    if (patientsValue !== null && cohortText === '') {
        cohortText = `Based on the clinical data provided, <strong>among 100 patients</strong> with the same disease conditions, <br><strong>${patientsValue}</strong> are expected to actually require PEG placement</strong> within 6 months.`;
    }
    
    // Aggiorna l'interpretazione della coorte
    interpretation.innerHTML = cohortText;
    
    // Mostra la sezione dei risultati
    resultsSection.classList.remove('hidden');
    
    // Scrolla ai risultati
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Reset del calcolatore
function resetCalculator() {
    selectedModel = null;
    document.querySelectorAll('.model-card').forEach(card => {
        card.classList.remove('active');
    });
    document.getElementById('form-section').classList.add('hidden');
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('prediction-form').reset();
    
    // Scrolla all'inizio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Contatore visite (visibile solo con parametro segreto)
function initVisitCounter() {
    // Incrementa il contatore ad ogni visita
    let visits = localStorage.getItem('pegCalculatorVisits') || 0;
    visits = parseInt(visits) + 1;
    localStorage.setItem('pegCalculatorVisits', visits);
    
    // Mostra il contatore solo se c'è il parametro segreto nell'URL
    const urlParams = new URLSearchParams(window.location.search);
    const showStats = urlParams.get('stats');
    
    if (showStats === 'nemo2025') { // Cambia 'nemo2025' con la tua password segreta
        const counterDiv = document.createElement('div');
        counterDiv.id = 'visit-counter';
        counterDiv.innerHTML = `
            <div style="position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.8); 
                        color: white; padding: 15px; border-radius: 10px; font-size: 14px; 
                        z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <strong>📊 Stats (Private)</strong><br>
                Total Visits: ${visits}<br>
                <small style="opacity: 0.7;">Since: ${new Date(parseInt(localStorage.getItem('pegCalculatorFirstVisit') || Date.now())).toLocaleDateString()}</small>
            </div>
        `;
        document.body.appendChild(counterDiv);
    }
    
    // Registra la prima visita
    if (!localStorage.getItem('pegCalculatorFirstVisit')) {
        localStorage.setItem('pegCalculatorFirstVisit', Date.now());
    }
}

// Inizializza il contatore quando la pagina è caricata
document.addEventListener('DOMContentLoaded', initVisitCounter);
