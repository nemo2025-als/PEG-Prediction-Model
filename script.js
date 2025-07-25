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
    const probDescription = document.getElementById('prob-description');
    const interpretation = document.getElementById('result-interpretation');
    
    // Usa il cutoff specifico del modello
    const cutoff = modelCutoffs[selectedModel];
    
    // Determina il livello di rischio
    let prob = '';
    let descriptionText = '';

    //colori: verde #24d36d, rosso #ff4343
    if (prediction < cutoff) {
        prob = 'Low';
        descriptionText = '<span style="font-size: 1.5em; font-weight: bold;">The patient is not expected to require PEG placement<br>within the next 6 months.</span><br>Continue standard monitoring.';
    } else {
        prob = 'High';
        descriptionText = '<span style="font-size: 1.5em; font-weight: bold;">The patient is expected to require PEG placement<br>within the next 6 months.</span><br>A specialist assessment is recommended.';
    }
    
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
            
            // Usa testo diverso per High vs Low
            if (prob === 'High') {
                cohortText = `Based on the clinical data provided, <strong>among 100 patients</strong> with the same disease conditions, <strong>between ${lowerPatients} to ${upperPatients} are expected to actually require PEG placement</strong> within the next 6 months.`;
            } else {
                cohortText = `Based on the clinical data provided, <strong>among 100 patients</strong> with the same disease conditions, <strong>between ${lowerPatients} to ${upperPatients} are still expected to require PEG placement</strong> within the next 6 months.`;
            }
        }
    }
    
    // Se abbiamo un valore singolo, costruisci il testo
    if (patientsValue !== null && cohortText === '') {
        if (prob === 'High') {
            cohortText = `Based on the clinical data provided, <strong>among 100 patients</strong> with the same disease conditions,<br><strong>${patientsValue} are expected to actually require PEG placement</strong> within the next 6 months.`;
        } else {
            cohortText = `Based on the clinical data provided, <strong>among 100 patients</strong> with the same disease conditions,<br><strong>${patientsValue} are still expected to require PEG placement</strong> within the next 6 months.`;
        }
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

// Contatore visite globale con Firebase
function initFirebaseCounter() {
    console.log('Inizializzazione Firebase Counter...');
    
    // Configurazione Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyBsaPeqQh-QW0BHphiQHjdowiOhBoWNqTc",
        authDomain: "peg-prediction-model.firebaseapp.com",
        databaseURL: "https://peg-prediction-model-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "peg-prediction-model",
        storageBucket: "peg-prediction-model.firebasestorage.app",
        messagingSenderId: "1068012856221",
        appId: "1:1068012856221:web:b5ce1daeb40d701d44c574"
    };
    
    // Inizializza Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    
    // SOLUZIONE: Usa .once() prima di fare la transaction
    const visitsRef = database.ref('visits/total');
    
    visitsRef.once('value').then((snapshot) => {
        const currentValue = snapshot.val() || 0;
        console.log('Valore attuale:', currentValue);
        
        // Ora aggiorna il valore
        visitsRef.set(currentValue + 1).then(() => {
            console.log('Contatore aggiornato a:', currentValue + 1);
        }).catch((error) => {
            console.error('Errore aggiornamento contatore:', error);
        });
    });
    
    // Registra anche data/ora della visita
    const visitLogRef = database.ref('visits/log').push();
    visitLogRef.set({
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'Direct'
    });
    
    // Mostra statistiche solo con parametro segreto
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('stats') === 'nemo2025') {
        // Aspetta un attimo per assicurarsi che il database sia aggiornato
        setTimeout(() => {
            // Ottieni il conteggio totale aggiornato
            visitsRef.once('value').then((snapshot) => {
                const totalVisits = snapshot.val() || 0;
                
                // Conta le visite di oggi
                const today = new Date();
                today.setHours(0,0,0,0);
                const todayTimestamp = today.getTime();
                
                database.ref('visits/log')
                    .orderByChild('timestamp')
                    .startAt(todayTimestamp)
                    .once('value')
                    .then((logSnapshot) => {
                        const todayVisits = logSnapshot.numChildren();
                        
                        // Crea il box delle statistiche
                        const counterDiv = document.createElement('div');
                        counterDiv.innerHTML = `
                            <div style="position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.9); 
                                        color: white; padding: 20px; border-radius: 10px; font-size: 14px; 
                                        z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 300px;">
                                <strong>📊 Global Stats</strong><br>
                                <hr style="margin: 10px 0; opacity: 0.3;">
                                Total Visits: <strong>${totalVisits}</strong><br>
                                Today: <strong>${todayVisits}</strong><br>
                                <small style="opacity: 0.7;">Real-time global counter</small>
                                <br><br>
                                <button onclick="location.reload();" 
                                        style="background: #3498db; color: white; border: none; 
                                               padding: 5px 10px; border-radius: 5px; cursor: pointer; 
                                               font-size: 12px; margin-right: 5px;">
                                    🔄 Refresh
                                </button>
                                <a href="https://console.firebase.google.com/project/${firebaseConfig.projectId}/database" 
                                   target="_blank" 
                                   style="color: #3498db; text-decoration: none; font-size: 12px;">
                                    View Dashboard →
                                </a>
                            </div>
                        `;
                        document.body.appendChild(counterDiv);
                    });
            });
        }, 1000); // Aspetta 1 secondo per assicurarsi che il database sia aggiornato
    }
}

// Inizializza il contatore Firebase quando la pagina è caricata
document.addEventListener('DOMContentLoaded', initFirebaseCounter);

// Inizializza il contatore Firebase quando la pagina è caricata
document.addEventListener('DOMContentLoaded', initFirebaseCounter);

