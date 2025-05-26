from PyPDF2 import PdfReader

reader = PdfReader("MyCV.pdf")
text = ""
for page in reader.pages:
    text += page.extract_text()

with open("resume.txt", "w") as f:
    f.write(text)
