Sure! Here's a complete, professional, and clear `README.md` for your GitHub project based on the provided HTML, CSS, and JS files:

---

# 🧠 ALS PEG Prediction Model

A web-based tool to predict the probability of **PEG (Percutaneous Endoscopic Gastrostomy) placement within 6 months** in patients with **Amyotrophic Lateral Sclerosis (ALS)**. Developed at the **Centro Clinico NeMO**, this tool supports clinical decision-making through validated logistic regression models based on patient data.

![Preview](screenshot.png) <!-- Optional image -->

---

## 🚀 Features

* ✅ 3 validated prediction models:

  * **A-PM**: Anamnestic Prediction Model
  * **AF-PM**: Anamnestic + Functional Model
  * **AN-PM**: Anamnestic + Nutritional Model
* 📊 Dynamic form generation based on selected model
* 🧮 Instant probability calculation
* 🧠 Cutoffs and cohort-based interpretation
* 📱 Fully responsive and mobile-friendly

---

## 🧩 Models Overview

Each model calculates the probability of PEG placement based on logistic regression using different sets of variables:

### 1. A-PM (Anamnestic Prediction Model)

* Inputs:

  * Age
  * Site of onset (Bulbar / Spinal)
  * NIV use (Yes / No)

### 2. AF-PM (Anamnestic + Functional)

* Inputs:

  * Age
  * ALSFRS-R Bulbar Subscore
  * Seated FVC (%)

### 3. AN-PM (Anamnestic + Nutritional)

* Inputs:

  * Age
  * Site of onset
  * NIV use
  * BMI
  * Premorbid & Current Weight
  * Disease onset & Evaluation date

Each model outputs:

* A binary interpretation (High / Low risk)
* A predicted probability
* A contextual interpretation based on a reference cohort of 100 patients

---

## 🖥️ How to Use

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/peg-prediction-model.git
   cd peg-prediction-model
   ```

2. **Open `index.html` in your browser**
   No backend required — everything runs client-side.

---

## 📁 File Structure

```
peg-prediction-model/
│
├── index.html        # Main UI
├── style.css         # Visual design
├── script.js         # Prediction logic & UI control
└── logo-nemo.png     # (optional) NeMO logo
```

---

## 📜 Disclaimer

This tool is intended for research and educational purposes only. It is **not a substitute for clinical judgment**. Always consult with specialized healthcare providers before making treatment decisions.

---

## 🧑‍🔬 Authors

* Clinical & Scientific Concept: [Centro Clinico NeMO - ALS Research Group](https://centrocliniconemo.it/)
* Development: Matteo Farè, MD + Contributors
* Style: Responsive and accessible CSS using Inter font
