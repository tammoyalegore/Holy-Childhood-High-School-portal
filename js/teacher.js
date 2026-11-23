// Group Members:
//1. Tammoya Legore (ID: 2407444) - Monday/3-5
//2. Peter John Kennedy (ID: 2507390) - Monday/3-5
//3. Jonathan Daye (ID: 2508418) - Monday/3-5
//4. Dahlia-Marie Williams (ID: 2506230) - Monday/3-5

// Currently loaded subject and semester
var activeSubject = null;
var activeSemester = null;

// Read any array from localStorage
function readData(key) {
    var raw = localStorage.getItem(key);
    if (raw === null) { return []; }
    return JSON.parse(raw);
}

// Get only the subjects assigned to the teacher that is logged in
function getMySubjects() {
    var user = getCurrentUser();
    return readData("hchsSubjects").filter(function (subject) {
        return subject.teacher === user.username;
    });
}

// Fills the Level dropdown with the teacher's levels
function fillLevels() {
    var mySubjects = getMySubjects();
    var levelSelect = document.getElementById("levelSelect");

    // List of levels
    var levels = [];
    mySubjects.forEach(function (subject) {
        if (levels.indexOf(subject.level) === -1) {
            levels.push(subject.level);
        }
    });

    levelSelect.innerHTML = '<option value="">-- Select Level --</option>';

    levels.forEach(function (level) {
        var option = document.createElement("option");
        option.value = level;
        option.textContent = level;
        levelSelect.appendChild(option);
    });

    if (levels.length === 1) {
        levelSelect.value = levels[0];
        fillSubjects();
    }
}

// Fill the Subject dropdown based on the chosen Level
function fillSubjects() {
    var level = document.getElementById("levelSelect").value;
    var subjectSelect = document.getElementById("subjectSelect");

    subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';
    document.getElementById("semesterSelect").value = "";
    document.getElementById("loadRosterBtn").disabled = true;
    hideGradeTable();

    if (level === "") {
        subjectSelect.disabled = true;
        return;
    }

    var mySubjects = getMySubjects().filter(function (subject) {
        return subject.level === level;
    });

    mySubjects.forEach(function (subject) {
        var option = document.createElement("option");
        option.value = subject.code;
        option.textContent = subject.code + " - " + subject.name;
        subjectSelect.appendChild(option);
    });

    subjectSelect.disabled = mySubjects.length === 0;
}

// Enable Load button only when subject and semester are picked
function checkReady() {
    var subject = document.getElementById("subjectSelect").value;
    var semester = document.getElementById("semesterSelect").value;
    document.getElementById("loadRosterBtn").disabled = !(subject && semester);
}

// Load the students enrolled in the chosen subject and semester
function loadRoster() {
    var code = document.getElementById("subjectSelect").value;
    var semester = document.getElementById("semesterSelect").value;

    var subject = readData("hchsSubjects").find(function (s) {
        return s.code === code;
    });

    // Get enrolled student IDs for this subject
    var enrolledIds = readData("hchsEnrollments")
        .filter(function (e) {
            return e.subjectCode === code && e.semester === semester;
        })
        .map(function (e) { return e.studentId; });

        // Get the matching students (excluding inactive students)
    var roster = readData("hchsStudents").filter(function (s) {
        return enrolledIds.indexOf(s.id) !== -1 && s.status !== "inactive";
    });

    activeSubject = subject;
    activeSemester = semester;

    if (roster.length === 0) {
        document.getElementById("filterHint").textContent =
            "No active students enrolled in " + code + " for " + semester + ".";
        hideGradeTable();
        return;
    }

    document.getElementById("filterHint").textContent = roster.length + " student(s) loaded.";
    document.getElementById("gradeEntrySubject").textContent =
        subject.name + " (" + code + ") - " + semester;
    document.getElementById("gradeEntryPanel").hidden = false;

    buildGradeTable(subject, roster, semester);
}
// Build the grade entry table
function buildGradeTable(subject, roster, semester) {
    var allGrades = readData("hchsGrades");
    var head = document.getElementById("gradeTableHead");
    var body = document.getElementById("rosterTableBody");

    // Build header row
    head.innerHTML = "";
    var headRow = document.createElement("tr");

    ["#", "Student ID", "Name"].forEach(function (label) {
        var th = document.createElement("th");
        th.textContent = label;
        headRow.appendChild(th);
    });

    subject.assessments.forEach(function (assessment) {
        var th = document.createElement("th");
        th.textContent = assessment.name + " (/" + assessment.max + ")";
        headRow.appendChild(th);
    });

    var avgTh = document.createElement("th");
    avgTh.textContent = "Average";
    headRow.appendChild(avgTh);

    var linkTh = document.createElement("th");
    linkTh.textContent = "Report";
    headRow.appendChild(linkTh);

    head.appendChild(headRow);

    // Build body rows
    body.innerHTML = "";

    roster.forEach(function (student, index) {
        var row = document.createElement("tr");
        row.dataset.studentId = student.id;

        [String(index + 1), student.id, student.firstName + " " + student.lastName]
            .forEach(function (text) {
                var td = document.createElement("td");
                td.textContent = text;
                row.appendChild(td);
            });

        var existing = allGrades.find(function (grade) {
            return grade.studentId === student.id &&
                   grade.subjectCode === subject.code &&
                   grade.semester === semester;
        });

        subject.assessments.forEach(function (assessment) {
            var td = document.createElement("td");
            var input = document.createElement("input");

            input.type = "number";
            input.min = "0";
            input.max = String(assessment.max);
            input.step = "0.5";
            input.className = "score-input";
            input.dataset.name = assessment.name;
            input.dataset.max = String(assessment.max);

            if (existing && existing.scores[assessment.name] !== undefined) {
                input.value = existing.scores[assessment.name];
            }

            input.addEventListener("input", function () {
                updateRowAverage(row, subject);
            });

            td.appendChild(input);
            row.appendChild(td);
        });

        var avgTd = document.createElement("td");
        avgTd.className = "row-average";
        avgTd.textContent = "-";
        row.appendChild(avgTd);

        var linkTd = document.createElement("td");
        var link = document.createElement("a");
        link.href = "report-card.html?student=" + student.id +
                    "&semester=" + encodeURIComponent(semester);
        link.textContent = "View";
        link.className = "report-link";
        linkTd.appendChild(link);
        row.appendChild(linkTd);

        body.appendChild(row);
        updateRowAverage(row, subject);
    });
}

function updateRowAverage(row, subject) {
    var inputs = row.querySelectorAll(".score-input");
    var weighted = 0;
    var weightUsed = 0;

    inputs.forEach(function (input) {
        if (input.value === "") { return; }

        var score = Number(input.value);
        var max = Number(input.dataset.max);

        var assessment = subject.assessments.find(function (a) {
            return a.name === input.dataset.name;
        });

        weighted = weighted + (score / max) * assessment.weight * 100;
        weightUsed = weightUsed + assessment.weight;
    });

    var cell = row.querySelector(".row-average");
    cell.textContent = weightUsed === 0 ? "-" : (weighted / weightUsed).toFixed(1) + "%";
}

// Save every row's marks at once
function saveBatch() {
    if (activeSubject === null || activeSemester === null) {
        showMessage("Load a roster first.", "error");
        return;
    }

    var rows = document.querySelectorAll("#rosterTableBody tr");
    var allGrades = readData("hchsGrades");
    var errors = [];
    var prepared = [];

    // validate 
    rows.forEach(function (row) {
        var studentId = row.dataset.studentId;
        var scores = {};
        var hasMark = false;

        row.querySelectorAll(".score-input").forEach(function (input) {
            if (input.value === "") { return; }

            // Score must be a number between 0 and max
            var score = Number(input.value);
            var max = Number(input.dataset.max);

            if (isNaN(score) || score < 0 || score > max) {
                errors.push(studentId + " - " + input.dataset.name +
                            " must be between 0 and " + max);
                return;
            }

            scores[input.dataset.name] = score;
            hasMark = true;
        });

        prepared.push({ studentId: studentId, scores: hasMark ? scores : null });
    });

    if (errors.length > 0) {
        showMessage("Not saved: " + errors[0], "error");
        return;
    }

    // Write to storage
    var inserted = 0;
    var updated = 0;
    var removed = 0;

    prepared.forEach(function (record) {
        var index = allGrades.findIndex(function (grade) {
            return grade.studentId === record.studentId &&
                   grade.subjectCode === activeSubject.code &&
                   grade.semester === activeSemester;
        });

        if (record.scores === null) {
            if (index !== -1) {
                allGrades.splice(index, 1);
                removed++;
            }
            return;
        }

        if (index !== -1) {
            allGrades[index].scores = record.scores;
            updated++;
        } else {
            allGrades.push({
                studentId: record.studentId,
                subjectCode: activeSubject.code,
                semester: activeSemester,
                scores: record.scores
            });
            inserted++;
        }
    });

    localStorage.setItem("hchsGrades", JSON.stringify(allGrades));

    var message = "Saved! " + inserted + " new, " + updated + " updated";
    if (removed > 0) { message += ", " + removed + " cleared"; }
    showMessage(message, "success");

    loadRoster();
}

// Hide the grade entry panel and reset state
function hideGradeTable() {
    document.getElementById("gradeEntryPanel").hidden = true;
    activeSubject = null;
    activeSemester = null;
}

// Show a message under the grade table
function showMessage(text, type) {
    var el = document.getElementById("feedbackMessage");
    el.textContent = text;
    el.className = "feedback-" + type;
}

// Page startup
document.addEventListener("DOMContentLoaded", function () {
    var user = getCurrentUser();
    if (!user) { return; }

    document.getElementById("welcomeText").textContent = "Welcome, " + user.fullname;

    // Fill Semester dropdown
    var semesterSelect = document.getElementById("semesterSelect");
    semesterSelect.innerHTML = '<option value="">-- Select Semester --</option>';

    SEMESTERS.forEach(function (semester) {
        var option = document.createElement("option");
        option.value = semester;
        option.textContent = semester;
        semesterSelect.appendChild(option);
    });

    fillLevels();

    document.getElementById("levelSelect").addEventListener("change", fillSubjects);
    document.getElementById("subjectSelect").addEventListener("change", checkReady);
    document.getElementById("semesterSelect").addEventListener("change", checkReady);
    document.getElementById("loadRosterBtn").addEventListener("click", loadRoster);
    document.getElementById("saveGradesBtn").addEventListener("click", saveBatch);
});