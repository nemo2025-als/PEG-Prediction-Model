// Configurazione dei modelli
const models = {
    1: {
        name: "Anamnestic Prediction Model",
        fields: [
            { id: "age", label: "Age at Evaluation", type: "number", min: 18, max: 100 },
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
        // Esempio di formula - sostituisci con la tua equazione reale
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
            { id: "age", label: "Age at Evaluation", type: "number", min: 18, max: 100 },
            { id: "bulbar_score", label: "Bulbar Subscore", type: "number", min: 0, max: 12 },
            { id: "fvc", label: "FVC%", type: "number", min: 0, max: 150, step: 0.1 }
        ],
        // Sostituisci con la tua equazione reale
        calculate: (data) => {
            const logit = 3.3238 + (0.0730 * data.age) + (-0.6943 * data.bulbar_score) + (-0.0317 * data.fvc);
            return 1 / (1 + Math.exp(-logit));
        }
    },
    3: {
        name: "Anamnestic and Nutritional Prediction Model",
        fields: [
            { id: "age", label: "Age at Evaluation", type: "number", min: 18, max: 100 },
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
            { id: "bmi", label: "BMI at Evaluation", type: "number", min: 10, max: 50, step: 0.1 },
            { id: "pre_weight", label: "Premorbid Weight", type: "number", min: 0, max: 150 },
            { id: "post_weight", label: "Weight at Evaluation", type: "number", min: 0, max: 150 }
        ],
        // Sostituisci con la tua equazione reale
        calculate: (data) => {
            const onsetWeight = data.onset_site === "bulbar" ? 1 : 0;
            const NIVWeight = data.NIV_use === "yes" ? 1 : 0;
            const logit = 0.9190 + (0.0455 * data.age) + (0.7473 * onsetWeight) + 
                          (1.1234 * NIVWeight) + (-0.2014 * data.bmi) + 
                          (0.8990 * (100*data.pre_weight/data.post_weight));
            return 1 / (1 + Math.exp(-logit));
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
    modelTitle.textContent = `${model.name} - Insert Patient Data`;
    
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
    const riskLevel = document.getElementById('risk-level');
    
    // Aggiorna il valore della predizione
    predictionResult.textContent = prediction.toFixed(1);
    
    // Interpreta il risultato
    let interpretationText = '';
    let riskLevel = '';
    
    if (prediction < 0.5) {
        riskLevel = 'Low';
        interpretationText = 'The risk of needing a PEG in the next 6 months is low. Continue standard monitoring.';
    } else {
        riskLevel = 'High';
        interpretationText = 'The risk of needing a PEG in the next 6 months is high. A specialist assessment is recommended.';
    }
    
    interpretation.innerHTML = `
        <strong>Risk Level: ${riskLevel}</strong><br>
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
