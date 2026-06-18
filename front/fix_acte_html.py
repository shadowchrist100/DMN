import re
file_path = "src/app/features/practitioner/patient-dossier/nouvel-acte-medical/nouvel-acte-medical.html"
with open(file_path, "r") as f:
    content = f.read()

content = re.sub(
    r'\(ngModelChange\)="state\.update\(s => \{ s\.([^ ]+) = \$event; return s; \}\)"',
    r'(ngModelChange)="updateState(\'\1\', $event)"',
    content
)

with open(file_path, "w") as f:
    f.write(content)

print("Fixed acte html")
