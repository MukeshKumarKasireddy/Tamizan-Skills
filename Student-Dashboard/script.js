// script.js for student-dashboard-pro with analytics

let students = JSON.parse(localStorage.getItem('students')) || [];
let editingIndex = null;

const form = document.getElementById('student-form');
const modal = document.getElementById('student-modal');
const tableBody = document.getElementById('student-table-body');
const searchInput = document.getElementById('search');
const deptFilter = document.getElementById('filter-dept');
const yearFilter = document.getElementById('filter-year');
const barChartCanvas = document.getElementById('barChart');
const pieChartCanvas = document.getElementById('pieChart');

const navLinks = document.querySelectorAll('.sidebar nav a');
const sections = {
  dashboard: document.querySelector('.stats'),
  students: document.querySelector('.table-section'),
  analytics: document.getElementById('analytics-section')
};

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    const text = link.textContent.trim().toLowerCase();
    sections.dashboard.style.display = 'none';
    sections.students.style.display = 'none';
    sections.analytics.style.display = 'none';

    if (text === 'dashboard') {
      sections.dashboard.style.display = 'flex';
      sections.students.style.display = 'block';
    } else if (text === 'students') {
      sections.students.style.display = 'block';
    } else if (text === 'analytics') {
      sections.analytics.style.display = 'block';
      renderAnalytics();
    }
  });
});

function openModal(editIndex = null) {
  editingIndex = editIndex;
  modal.classList.add('show');
  if (editIndex !== null) {
    const s = students[editIndex];
    form.name.value = s.name;
    form.regNo.value = s.regNo;
    form.dept.value = s.dept;
    form.year.value = s.year;
    form.marks.value = s.marks;
    document.getElementById('modal-title').textContent = 'Edit Student';
  } else {
    form.reset();
    document.getElementById('modal-title').textContent = 'Add Student';
  }
}

function closeModal() {
  modal.classList.remove('show');
  form.reset();
  editingIndex = null;
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  const student = {
    name: form.name.value.trim(),
    regNo: form.regNo.value.trim(),
    dept: form.dept.value.trim(),
    year: parseInt(form.year.value),
    marks: parseInt(form.marks.value),
  };
  if (editingIndex !== null) {
    students[editingIndex] = student;
  } else {
    students.push(student);
  }
  localStorage.setItem('students', JSON.stringify(students));
  closeModal();
  renderTable();
  updateStats();
});

function renderTable() {
  const keyword = searchInput.value.toLowerCase();
  const dept = deptFilter.value;
  const year = yearFilter.value;
  
  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(keyword) ||
      s.regNo.toLowerCase().includes(keyword);
    const matchDept = dept === '' || s.dept === dept;
    const matchYear = year === '' || s.year.toString() === year;
    return matchSearch && matchDept && matchYear;
  });

  tableBody.innerHTML = '';
  filtered.forEach((s, index) => {
    const statusClass = s.marks >= 40 ? 'status-pass' : 'status-fail';
    const statusText = s.marks >= 40 ? 'Pass' : 'Fail';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${s.name}</td>
      <td>${s.regNo}</td>
      <td>${s.dept}</td>
      <td>${s.year}</td>
      <td>${s.marks}</td>
      <td><span class="${statusClass}">${statusText}</span></td>
      <td class="actions">
        <button class="edit" onclick="openModal(${index})">Edit</button>
        <button class="delete" onclick="deleteStudent(${index})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function deleteStudent(index) {
  if (confirm('Are you sure to delete this student?')) {
    students.splice(index, 1);
    localStorage.setItem('students', JSON.stringify(students));
    renderTable();
    updateStats();
  }
}

function updateStats() {
  const total = students.length;
  const avg = total === 0 ? 0 : ((students.reduce((sum, s) => sum + s.marks, 0) / (total * 100)) * 100).toFixed(1);
  const passCount = students.filter(s => s.marks >= 40).length;
  const passRate = total === 0 ? 0 : Math.round((passCount / total) * 100);

  document.getElementById('total-students').textContent = `👥 Total: ${total}`;
  document.getElementById('avg-marks').textContent = `📊 Avg Marks: ${avg}`;
  document.getElementById('pass-rate').textContent = `✅ Pass Rate: ${passRate}%`;
}

function renderAnalytics() {
  const depts = [...new Set(students.map(s => s.dept))];
  const avgMarks = depts.map(dept => {
    const deptStudents = students.filter(s => s.dept === dept);
    const totalMarks = deptStudents.reduce((sum, s) => sum + s.marks, 0);
    return (totalMarks / deptStudents.length).toFixed(1);
  });

  const passCount = students.filter(s => s.marks >= 40).length;
  const failCount = students.length - passCount;

  // Bar chart: Avg marks by department
  new Chart(barChartCanvas, {
    type: 'bar',
    data: {
      labels: depts,
      datasets: [{
        label: 'Avg Marks',
        data: avgMarks,
        backgroundColor: '#3b82f6'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Average Marks by Department' }
      }
    }
  });

  // Pie chart: Pass vs Fail
  new Chart(pieChartCanvas, {
    type: 'pie',
    data: {
      labels: ['Pass', 'Fail'],
      datasets: [{
        data: [passCount, failCount],
        backgroundColor: ['#22c55e', '#ef4444']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Pass vs Fail Ratio' }
      }
    }
  });
}

searchInput.addEventListener('input', renderTable);
deptFilter.addEventListener('change', renderTable);
yearFilter.addEventListener('change', renderTable);

// Init
renderTable();
updateStats();
