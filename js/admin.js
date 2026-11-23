/*
Group Members:
1. Tammoya Legore (ID: 2407444) - Monday/3-5
2. Peter John Kennedy (ID: 2507390) - Monday/3-5
3. Jonathan Daye (ID: 2508418) - Monday/3-5
4. Dahlia-Marie Williams (ID: 2506230) - Monday/3-5

Project: Holy Childhood High School Portal
Role: Administrative Interface Developer
File: admin.js

Purpose:
Manage student registration, searching, editing,
deleting and persistent storage.
*/

// Check administrator access
if (!checkRole("admin")) {
    throw new Error("Administrator access required.");
}

// Load student records
const KEY = "hchsStudents";

let students = JSON.parse(localStorage.getItem(KEY)) || [];
let editingId = null;

// Get HTML elements
const form = document.getElementById("studentForm");
const table = document.getElementById("studentTable");

const search = document.getElementById("search");
const total = document.getElementById("totalStudents");
const active = document.getElementById("activeStudents");

const saveButton = document.getElementById("saveButton");
const formHeading = document.getElementById("formHeading");

// Save records
function save() {
    localStorage.setItem(KEY, JSON.stringify(students));
}

// Display student records
function displayStudents() {

    table.replaceChildren();

    const query = search.value.toLowerCase();

    const filtered = students.filter(student =>
        Object.values(student).some(value =>
            String(value).toLowerCase().includes(query)
        )
    );

    filtered.forEach(student => {

        const row = document.createElement("tr");

        [
            student.id,
            student.firstName + " " + student.lastName,
            student.email,
            student.className,
            student.semester
        ].forEach(value => {

            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actions = document.createElement("td");

        const edit = document.createElement("button");
        edit.textContent = "Edit";
        edit.onclick = () => editStudent(student.id);

        const remove = document.createElement("button");
        remove.textContent = "Delete";
        remove.onclick = () => deleteStudent(student.id);

        actions.append(edit, remove);
        row.appendChild(actions);
        table.appendChild(row);
    });

    total.textContent = students.length;

    active.textContent = students.length;
}

// Register or update student
form.onsubmit = function(event) {

    event.preventDefault();

    const student = {
        id: document.getElementById("studentId").value.trim(),
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        email: document.getElementById("email").value.trim(),
        className: document.getElementById("className").value,
        semester: document.getElementById("semester").value
    };

    // Prevent duplicate IDs
    if (students.some(s =>
        s.id.toLowerCase() === student.id.toLowerCase() &&
        s.id !== editingId
    )) {
        alert("Student ID already exists.");
        return;
    }

    if (editingId) {

        students = students.map(s =>
            s.id === editingId ? student : s
        );

    } else {

        students.push(student);
    }

    save();
    resetForm();
    displayStudents();
};

// Edit student
function editStudent(id) {

    const student = students.find(s => s.id === id);

    if (!student) return;

    editingId = id;

    document.getElementById("studentId").value = student.id;
    document.getElementById("firstName").value = student.firstName;
    document.getElementById("lastName").value = student.lastName;
    document.getElementById("email").value = student.email;
    document.getElementById("className").value = student.className;
    document.getElementById("semester").value = student.semester;

    formHeading.textContent = "Edit Student";
    saveButton.textContent = "Update Student";
}

// Delete student
function deleteStudent(id) {

    if (!confirm("Delete this student?")) return;

    students = students.filter(s => s.id !== id);

    save();
    displayStudents();
}

// Reset registration form
function resetForm() {

    form.reset();
    editingId = null;

    formHeading.textContent = "Register Student";
    saveButton.textContent = "Save Student";
}

// Search students
search.addEventListener("input", displayStudents);

// Clear form
document.getElementById("clearButton").onclick = resetForm;

// Display saved records when page loads
displayStudents();