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
    const grade = calculateGrade(avg);

    const div = document.createElement("div");
    div.className = "student-card";
    div.innerHTML = `
      <h3>${st.name}</h3>
      <table>
        <tbody>
          ${st.subjects.map(s => `<tr><td>${s.subjectName}</td><td>${s.marks}</td></tr>`).join("")}
        </tbody>
      </table>
      <p><b>Total:</b> ${total} | <b>Average:</b> ${avg}</p>
      <p><b>Grade:</b> <span class="badge ${gradeColor(grade)}">${grade}</span></p>
    `;
    studentList.appendChild(div);
  });
}

// Add Subject
function addSubject() {
  const container = document.getElementById("subjectsContainer");
  const div = document.createElement("div");
  div.className = "subject-row";
  div.innerHTML = `
    <input type="text" placeholder="Subject" class="subject">
    <input type="number" placeholder="Marks" class="marks">
  `;
  container.appendChild(div);
}

// Add
function addStudent() {
  const name = document.getElementById("studentName").value;
  const subjectInputs = document.querySelectorAll(".subject");
  const marksInputs = document.querySelectorAll(".marks");

  if (!name || subjectInputs.length === 0) {
    alert("Please fill all fields!");
    return;
  }

  let subjects = [];
  subjectInputs.forEach((subj, i) => {
    const subjectName = subj.value.trim();
    const marks = parseInt(marksInputs[i].value);
    if (subjectName && !isNaN(marks)) {
      subjects.push({ subjectName, marks });
    }
  });

  if (subjects.length === 0) {
    alert("Please enter at least one subject and marks.");
    return;
  }

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

  document.getElementById("studentName").value = "";
  document.getElementById("subjectsContainer").innerHTML = `
    <div class="subject-row">
      <input type="text" placeholder="Subject" class="subject">
      <input type="number" placeholder="Marks" class="marks">
    </div>
  `;
}

// Search
function searchStudent() {
  const searchInput = document.getElementById("searchInput").value.toLowerCase();
  const results = students.filter(st => st.name.toLowerCase().includes(searchInput));

  const searchDiv = document.getElementById("searchResults");
  searchDiv.innerHTML = "";
  if (results.length === 0) {
    searchDiv.innerHTML = "<p>No results found.</p>";
    return;
  }

  results.forEach(st => {
    const div = document.createElement("div");
    div.className = "student-card";
    div.innerHTML = `<h3>${st.name}</h3>
      <p>Subjects: ${st.subjects.map(s => `${s.subjectName}: ${s.marks}`).join(", ")}</p>`;
    searchDiv.appendChild(div);
  });
}

// Filter
function filterTopStudents() {
  const topStudents = students.filter(st =>
    st.subjects.some(s => s.marks >= 80)
  );
  displayStudents(topStudents);
}

function sortStudents(criteria) {
  if (criteria === "name") {
    students.sort((a, b) => a.name.localeCompare(b.name));
  } else if (criteria === "avg") {
    students.sort((a, b) => {
      const avgA = a.subjects.reduce((sum, s) => sum + s.marks, 0) / a.subjects.length;
      const avgB = b.subjects.reduce((sum, s) => sum + s.marks, 0) / b.subjects.length;
      return avgB - avgA;
    });
  }
  displayStudents(students);
}

function resetData() {
  localStorage.removeItem("students");
  loadStudents();
}

function calculateGrade(avg) {
  if (avg >= 90) return "A+";
  else if (avg >= 80) return "A";
  else if (avg >= 70) return "B";
  else if (avg >= 60) return "C";
  else return "D";
}

function gradeColor(grade) {
  if (grade === "A+" || grade === "A") return "green";
  if (grade === "B" || grade === "C") return "orange";
  return "red";
}

window.onload = loadStudents;
