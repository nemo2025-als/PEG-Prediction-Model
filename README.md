# peg-prediction-model 🌟

Predict timing of **PEG placement** in people with ALS, based on longitudinal clinical and functional data.

---

## 🧠 Overview

This model analyzes clinical data from ALS patients (e.g. ALSFRS‑R, weight trajectory, swallowing symptoms) to predict when percutaneous endoscopic gastrostomy (PEG) is likely to be needed. It uses survival analysis algorithms—like landmark modeling or machine‑learning survival learners (e.g. Cox, MTLR, survival forests)—to estimate the time-to-event for PEG placement.

Goals:

* Support neurologists with **personalized risk curves**.
* Trigger early nutritional planning to reduce weight loss and improve quality of life.
* Provide objective data-driven insights for multidisciplinary care.

---

## 🚀 What's inside

* **Data folder**: anonymized example datasets (CSV, with features like ALSFRS‑R, bulbar onset, BMI).
* **`model/`**: scripts for data preprocessing, feature engineering, and survival modeling.
* **`notebooks/`**: exploratory analysis and demo of model predictions.
* **`evaluation/`**: metrics and plots (e.g. time‑dependent AUC, calibration curves).
* **`docker/`**: Dockerfile and containerization files for reproducible deployment.
* **README.md**: this file 📖

---

## 🛠 Installation

Clone the repo and set up:

```bash
git clone https://github.com/nemo2025-als/peg-prediction-model.git
cd peg-prediction-model
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

Or build/run with Docker:

```bash
cd docker
docker build -t peg-pred .
docker run --rm -it peg-pred
```

---

## 🧪 Usage

1. Place your **patient longitudinal data** in `data/`. Must include key columns:
   `patient_id`, `time_since_onset`, `alsfrs_r_score`, `swallowing_score`, `weight`, and `peg_event` (0/1).

2. Run preprocessing + train/test split:

   ```bash
   python model/preprocess.py --input data/als_longitudinal.csv --output processed/
   ```

3. Train models:

   ```bash
   python model/train_survival.py --data processed/als_data.csv --model output/survival_model.pkl
   ```

4. Predict PEG risk for new patients:

   ```bash
   python model/predict.py --model output/survival_model.pkl --input new_patients.csv --output predictions.csv
   ```

5. Evaluate model performance:

   ```bash
   python evaluation/evaluate_survival.py --pred predictions.csv --true processed/als_data.csv
   ```

---

## 📈 What to expect

* Individual survival curves showing probability of PEG placement over time.
* Summary metrics like C‑index, time‑dependent AUC, calibration.
* Visual plots of high-risk vs low-risk trajectories.

---

## ⚙️ Model details & references

* Supports multiple survival modeling frameworks: e.g., Cox regression, accelerated failure time, MTLR, random survival forest.
* You can integrate landmark modeling (per recent ALS literature) or super-learner ensembles.
* Allows optional inclusion of biomarkers or neuroimaging if available.
* Built with open-source libs: `lifelines`, `scikit-survival`, `scikit-learn`, `pandas`, `matplotlib`.

---

## 🧾 Limitations & Considerations

* Data-driven predictions only—**not a diagnostic tool**. Clinical context matters.
* Performance depends on quality and depth of input data.
* Model may suffer bias with under‑represented subtypes or missing data.
* Interpret with caution: comorbid conditions, bulbar vs spinal onset, genomic factors aren't specifically modeled unless included.

---

## ✅ Why it matters

Timely PEG placement is crucial in ALS to maintain nutrition and slow decline. Most patients experience an **average lead-time of \~9–15 months from symptom onset to diagnosis**, and PEG often becomes indicated early in bulbar-onset cases ([github.com][1], [amjmedsci.org][2], [nature.com][3], [mdpi.com][4]).

By predicting when PEG will likely be needed, clinicians can plan ahead—minimizing weight loss, optimizing swallowing support, and improving quality of life.

---

## 👥 Who should use this

* Neurologists and ALS multidisciplinary teams wanting data-driven nutrition planning.
* ALS researchers exploring prediction modeling or site-specific clinical data studies.
* Machine‑learning enthusiasts interested in survival analysis in neurology.

---

## 💡 Future directions

* Integrate additional features: spirometry, cough peak flow, genomics.
* Add more outcomes: non‑invasive ventilation, hospitalization risk.
* Build interactive dashboards for live clinical decision support.
* Continuously recalibrate model as new patient data accrues (external validation!).

---

Feel free to suggest improvements, open issues, or better evaluation techniques. Let me know how it performs in your center’s workflow — feedback helps sharpen it. Cheers!

---

## 📬 Contact

For questions, drop an issue here or ping the repo maintainers.
