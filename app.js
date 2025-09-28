let students = [];

async function loadStudents() {
  const res = await fetch("students.json");
  const jsonStudents = await res.json();

  const savedData = localStorage.getItem("students");
  const localStudents = savedData ? JSON.parse(savedData) : [];

  students = [
    ...jsonStudents,
    ...localStudents.filter(ls => !jsonStudents.some(js => js.id === ls.id))
  ];

  displayStudents(students);
}

// Display
function displayStudents(data) {
  const studentList = document.getElementById("studentList");
  studentList.innerHTML = "";

  if (data.length === 0) {
    studentList.innerHTML = "<p>No student records found.</p>";
    return;
  }

  data.forEach(st => {
    const total = st.subjects.reduce((sum, s) => sum + s.marks, 0);
    const avg = (total / st.subjects.length).toFixed(2);

    const div = document.createElement("div");
    div.className = "student-card";
    div.innerHTML = `
      <p><b>ID:</b> ${st.id}</p>
      <p><b>Name:</b> ${st.name}</p>
      <p><b>Subjects:</b> ${st.subjects.map(s => `${s.subjectName}: ${s.marks}`).join(", ")}</p>
      <p><b>Total:</b> ${total} | <b>Average:</b> ${avg}</p>
      <p class="grade"><b>Grade:</b> ${calculateGrade(avg)}</p>
    `;
    studentList.appendChild(div);
  });
}

// Add new subject
function addSubjectField() {
  const container = document.getElementById("subjectsContainer");

  const div = document.createElement("div");
  div.className = "subject-row";

  div.innerHTML = `
    <input type="text" class="subject" placeholder="Subject" required>
    <input type="number" class="marks" placeholder="Marks" required>
  `;

  container.appendChild(div);
}

// Add 
document.getElementById("studentForm").addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const subjectInputs = document.querySelectorAll(".subject");
  const marksInputs = document.querySelectorAll(".marks");

  let subjects = [];
  subjectInputs.forEach((subj, i) => {
    const subjectName = subj.value;
    const marks = parseInt(marksInputs[i].value);
    subjects.push({ subjectName, marks });
  });

  const total = subjects.reduce((sum, s) => sum + s.marks, 0);
  const avg = total / subjects.length;

  let newStudent = {
    id: Date.now(),
    name: name,
    subjects: subjects,
    grade: calculateGrade(avg)
  };

  const savedData = localStorage.getItem("students");
  const localStudents = savedData ? JSON.parse(savedData) : [];
  localStudents.push(newStudent);
  localStorage.setItem("students", JSON.stringify(localStudents));

  students.push(newStudent);
  displayStudents(students);

  e.target.reset();
  document.getElementById("subjectsContainer").innerHTML = `
    <div class="subject-row">
      <input type="text" class="subject" placeholder="Subject" required>
      <input type="number" class="marks" placeholder="Marks" required>
    </div>
  `;
});

// Calculate
function calculateGrade(avg) {
  if (avg >= 90) return "A+";
  else if (avg >= 80) return "A";
  else if (avg >= 70) return "B";
  else if (avg >= 60) return "C";
  else return "D";
}

// Filter 
function filterTopStudents() {
  const topStudents = students.filter(st =>
    st.subjects.some(s => s.marks > 80)
  );
  displayStudents(topStudents);
}
//search
function searchBySubject() {
  const subject = document.getElementById("searchSubject").value.toLowerCase();
  const results = students.filter(st =>
    st.subjects.some(s => s.subjectName.toLowerCase() === subject)
  );
  const searchDiv = document.getElementById("searchResults");
  searchDiv.innerHTML = "";
  if (results.length === 0) {
    searchDiv.innerHTML = "<p>No results found.</p>";
    return;
  }
  results.forEach(st => {
    const div = document.createElement("div");
    div.className = "student-card";
    div.innerHTML = `<p><b>${st.name}</b> - ${st.subjects.map(s => `${s.subjectName}: ${s.marks}`).join(", ")}</p>`;
    searchDiv.appendChild(div);
  });
}

function resetData() {
  localStorage.removeItem("students");
  loadStudents();
}
