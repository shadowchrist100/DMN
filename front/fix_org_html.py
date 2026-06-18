import re
file_path = "src/app/features/admin/organizations/organizations.html"
with open(file_path, "r") as f:
    content = f.read()

content = re.sub(
    r'\(ngModelChange\)="formPayload\.update\(p => \{ p\.([^ ]+) = \$event; return p \}\)"',
    r'(ngModelChange)="updatePayload(\'\1\', $event)"',
    content
)

with open(file_path, "w") as f:
    f.write(content)

print("Fixed org html")
