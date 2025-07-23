// Configurazione dei modelli
const models = {
    1: {
        name: "Anamnestic Prediction Model",
        fields: [
            { id: "age", label: "Age at Evaluation", type: "number", min: 18, max: 100 },
            { id: "onset_site", label: "Site of Onset", type: type: "select", 
              options: [
                { value: "bulbar", label: "Bulbar" },
                { value: "spinal", label: "Spinal" }
              ]
            },
            { id: "NIV_use", label: "Use of NIV at Evaluation", type: "radio",
              options: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" }
              ]
            }
        ],
        // Esempio di formula - sostituisci con la tua equazione reale
        calculate: (data) => {
            const logit = -5.2 + (0.05 * data.age) - (0.12 * data.alsfrs_total) + (0.3 * data.bulbar_score);
            return 100 / (1 + Math.exp(-logit));
        }
    },
    2: {
        name: "Anamnestic and Functional Prediction Model",
        fields: [
            { id: "age", label: "Età", type: "number", min: 18, max: 100 },
            { id: "alsfrs_total", label: "ALSFRS-R Totale", type: "number", min: 0, max: 48 },
            { id: "bulbar_score", label: "Score Bulbare", type: "number", min: 0, max: 12 },
            { id: "fvc", label: "FVC %", type: "number", min: 0, max: 150 },
            { id: "bmi", label: "BMI", type: "number", min: 10, max: 50, step: 0.1 }
        ],
        // Sostituisci con la tua equazione reale
        calculate: (data) => {
            const logit = -6.5 + (0.04 * data.age) - (0.15 * data.alsfrs_total) + 
                          (0.35 * data.bulbar_score) - (0.02 * data.fvc) + (0.1 * data.bmi);
            return 100 / (1 + Math.exp(-logit));
        }
    },
    3: {
        name: "Anamnestic and Nutritional Prediction Model",
        fields: [
            { id: "age", label: "Età", type: "number", min: 18, max: 100 },
            { id: "alsfrs_total", label: "ALSFRS-R Totale", type: "number", min: 0, max: 48 },
            { id: "bulbar_score", label: "Score Bulbare", type: "number", min: 0, max: 12 },
            { id: "fvc", label: "FVC %", type: "number", min: 0, max: 150 },
            { id: "bmi", label: "BMI", type: "number", min: 10, max: 50, step: 0.1 },
            { id: "onset_site", label: "Sede di Esordio", type: "select", 
              options: [
                { value: "bulbar", label: "Bulbare" },
                { value: "spinal", label: "Spinale" }
              ]
            },
            { id: "disease_duration", label: "Durata Malattia (mesi)", type: "number", min: 0, max: 120 }
        ],
        // Sostituisci con la tua equazione reale
        calculate: (data) => {
            const onsetWeight = data.onset_site === "bulbar" ? 1.5 : 0;
            const logit = -7.2 + (0.03 * data.age) - (0.18 * data.alsfrs_total) + 
                          (0.4 * data.bulbar_score) - (0.025 * data.fvc) + 
                          (0.12 * data.bmi) + onsetWeight - (0.01 * data.disease_duration);
            return 100 / (1 + Math.exp(-logit));
        }
    }
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
    modelTitle.textContent = `${model.name} - Inserisci i Dati del Paziente`;
    
    // Genera i campi del form
    formFields.innerHTML = '';
    model.fields.forEach(field => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        if (field.type === 'select') {
            formGroup.innerHTML = `
                <label for="${field.id}">${field.label}</label>
                <select id="${field.id}" name="${field.id}" required>
                    <option value="">Seleziona...</option>
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
    const predictionResult = document.getElementById('prediction-result');
    const interpretation = document.getElementById('result-interpretation');
    
    // Aggiorna il valore della predizione
    predictionResult.textContent = prediction.toFixed(1);
    
    // Interpreta il risultato
    let interpretationText = '';
    let riskLevel = '';
    
    if (prediction < 30) {
        riskLevel = 'Basso';
        interpretationText = 'Il rischio di necessità di PEG nei prossimi 6 mesi è basso. Continuare il monitoraggio standard.';
    } else if (prediction < 60) {
        riskLevel = 'Moderato';
        interpretationText = 'Il rischio di necessità di PEG è moderato. Si consiglia un monitoraggio più frequente della funzione deglutitoria.';
    } else {
        riskLevel = 'Alto';
        interpretationText = 'Il rischio di necessità di PEG è elevato. Si consiglia una valutazione specialistica urgente per discutere le opzioni terapeutiche.';
    }
    
    interpretation.innerHTML = `
        <strong>Livello di Rischio: ${riskLevel}</strong><br>
        ${interpretationText}
    `;
    
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
