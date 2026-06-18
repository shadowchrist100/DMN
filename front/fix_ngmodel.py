import re

file_path = "src/app/features/practitioner/patient-dossier/nouvel-acte-medical/nouvel-acte-medical.html"

with open(file_path, "r") as f:
    content = f.read()

# Replace state().X
content = re.sub(
    r'\[\(ngModel\)\]="state\(\)\.([^"]+)"',
    r'[ngModel]="state().\1" (ngModelChange)="state.update(s => { s.\1 = $event; return s; })"',
    content
)

# Replace signals
signals = [
    "newVitalConstantCode", "newVitalConstantValue",
    "diagnosisSearchQuery", "newDiagnosisNote", "newDiagnosisStatus",
    "medicationSearchQuery", "newMedicationPosologie", "newMedicationDuree",
    "newExamenLibelle", "newExamenNature",
    "newVaccinLibelle",
    "newSoinDescription", "newSoinType", "newSoinSeances"
]

for sig in signals:
    content = re.sub(
        r'\[\(ngModel\)\]="' + sig + r'"',
        r'[ngModel]="' + sig + r'()" (ngModelChange)="' + sig + r'.set($event)"',
        content
    )

with open(file_path, "w") as f:
    f.write(content)

print("Fixed ngModel in nouvel-acte-medical.html")
