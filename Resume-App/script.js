function updatePreview() {
  document.getElementById('p-name').innerText = document.getElementById('name').value || 'Your Name';
  document.getElementById('p-email').innerText = 'Email: ' + (document.getElementById('email').value || 'example@example.com');
  document.getElementById('p-phone').innerText = 'Phone: ' + (document.getElementById('phone').value || '1234567890');
  document.getElementById('p-address').innerText = 'Address: ' + (document.getElementById('address').value || 'Your address');
  document.getElementById('p-education').innerText = document.getElementById('education').value || 'Your education details here';
  document.getElementById('p-experience').innerText = document.getElementById('experience').value || 'Your work experience here';
  document.getElementById('p-skills').innerText = document.getElementById('skills').value || 'Your skills here';
}

async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const resume = document.getElementById("resume-preview");

  await html2canvas(resume).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("My_Resume.pdf");
  });
}
