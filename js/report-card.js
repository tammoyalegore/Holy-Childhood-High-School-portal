// Group Members:
//1. Tammoya Legore (ID: 2407444) - Monday/3-5
//2. Peter John Kennedy (ID: 2507390) - Monday/3-5
//3. Jonathan Daye (ID: 2508418) - Monday/3-5
//4. Dahlia-Marie Williams (ID: 2506230) - Monday/3-5

// Read any array from localStorag
function readData(key) {
    var raw = localStorage.getItem(key);
    if (raw === null) { return []; }
    return JSON.parse(raw);
}

// Convert a percentage to a letter grade and remark
function getGradeLetter(percent) {
    if (percent >= 90) return { letter: "A", remark: "Excellent" };
    if (percent >= 80) return { letter: "B", remark: "Very Good" };
    if (percent >= 70) return { letter: "C", remark: "Good" };
    if (percent >= 60) return { letter: "D", remark: "Satisfactory" };
    if (percent >= 50) return { letter: "E", remark: "Weak" };
    return { letter: "F", remark: "Fail" };
}

// Calculate weighted % for one subject.
// Divide by weightUsed so half-marked students aren't scored 0 on blanks.
function calculateSubject(subject, gradeRecord) {
    if (!gradeRecord || !gradeRecord.scores) { return null; }

    var weighted = 0;
    var weightUsed = 0;

    subject.assessments.forEach(function (assessment) {
        var score = gradeRecord.scores[assessment.name];
        if (score === undefined) { return; }

        weighted = weighted + (score / assessment.max) * assessment.weight * 100;
        weightUsed = weightUsed + assessment.weight;
    });

    if (weightUsed === 0) { return null; }
    return weighted / weightUsed;
}

// Class average for a subject
function calculateClassAverage(subject, semester) {
    var subjectGrades = readData("hchsGrades").filter(function (grade) {
        return grade.subjectCode === subject.code && grade.semester === semester;
    });

    if (subjectGrades.length === 0) { return null; }

    var total = 0;
    var count = 0;

    subjectGrades.forEach(function (grade) {
        var percent = calculateSubject(subject, grade);
        if (percent !== null) {
            total = total + percent;
            count++;
        }
    });

    if (count === 0) { return null; }
    return total / count;
}

// Student's rank in the class for one subject 
function calculateRank(studentId, subject, semester) {
    var scored = [];

    readData("hchsGrades").forEach(function (grade) {
        if (grade.subjectCode !== subject.code || grade.semester !== semester) {
            return;
        }
        var percent = calculateSubject(subject, grade);
        if (percent !== null) {
            scored.push({ studentId: grade.studentId, percent: percent });
        }
    });

    var mine = scored.find(function (entry) {
        return entry.studentId === studentId;
    });

    if (!mine) { return null; }

    // Count students with a higher percentage
    var higherCount = 0;
    scored.forEach(function (entry) {
        if (entry.percent > mine.percent) { higherCount++; }
    });

    return higherCount + 1;
}

// Build the full report card 
function buildReport(studentId, semester) {
    var student = readData("hchsStudents").find(function (s) {
        return s.id === studentId;
    });

    if (!student) { return null; }

    // Subjects this student is enrolled in for this semester
    var enrolledCodes = readData("hchsEnrollments")
        .filter(function (e) {
            return e.studentId === studentId && e.semester === semester;
        })
        .map(function (e) { return e.subjectCode; });

    var allGrades = readData("hchsGrades");
    var subjectRows = [];

    // Build one row per enrolled subject
    readData("hchsSubjects")
        .filter(function (subject) {
            return enrolledCodes.indexOf(subject.code) !== -1;
        })
        .forEach(function (subject) {
            var gradeRecord = allGrades.find(function (grade) {
                return grade.studentId === studentId &&
                       grade.subjectCode === subject.code &&
                       grade.semester === semester;
            });

            var percent = calculateSubject(subject, gradeRecord);
            var gradeInfo = percent === null ? null : getGradeLetter(percent);

            subjectRows.push({
                name: subject.name,
                code: subject.code,
                percentage: percent,
                letter: gradeInfo ? gradeInfo.letter : "-",
                remark: gradeInfo ? gradeInfo.remark : "No grade entered",
                classAverage: calculateClassAverage(subject, semester),
                rank: calculateRank(studentId, subject, semester)
            });
        });

            // Overall average = mean of graded subjects
    var graded = subjectRows.filter(function (row) {
        return row.percentage !== null;
    });

    var overall = null;
    if (graded.length > 0) {
        var total = 0;
        graded.forEach(function (row) { total = total + row.percentage; });
        overall = total / graded.length;
    }

    var overallInfo = overall === null ? null : getGradeLetter(overall);

    return {
        studentName: student.firstName + " " + student.lastName,
        studentId: student.id,
        level: student.className || student.level,
        formClass: student.formClass || "-",
        semester: semester,
        generatedOn: new Date().toLocaleDateString(),
        rows: subjectRows,
        overall: overall,
        overallLetter: overallInfo ? overallInfo.letter : "-",
        overallRemark: overallInfo ? overallInfo.remark : "No grades recorded",
        status: overall === null ? "PENDING" : (overall >= 50 ? "PASS" : "FAIL"),
        gradedCount: graded.length
    };
}

// Render the report card on screen 
function renderReport(report) {
    var container = document.getElementById("reportCardOutput");
    container.innerHTML = "";

    var card = document.createElement("article");
    card.className = "report-card";

    var school = document.createElement("p");
    school.className = "report-school";
    school.textContent = "HOLY CHILDHOOD HIGH SCHOOL";
    card.appendChild(school);

    var title = document.createElement("h2");
    title.textContent = "Student Report Card";
    card.appendChild(title);

    var meta = document.createElement("p");
    meta.className = "report-meta";
    meta.textContent = report.studentName + "  |  " + report.studentId +
                       "  |  " + report.level + " (" + report.formClass + ")" +
                       "  |  " + report.semester;
    card.appendChild(meta);

    // Subject table
    var table = document.createElement("table");
    table.className = "data-table report-table";

    var thead = document.createElement("thead");
    var headRow = document.createElement("tr");

    ["Subject", "Code", "Score %", "Grade", "Remark", "Class Avg", "Rank"]
        .forEach(function (label) {
            var th = document.createElement("th");
            th.textContent = label;
            headRow.appendChild(th);
        });

    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = document.createElement("tbody");

    report.rows.forEach(function (row) {
        var tr = document.createElement("tr");

        var cells = [
            row.name,
            row.code,
            row.percentage === null ? "-" : row.percentage.toFixed(1),
            row.letter,
            row.remark,
            row.classAverage === null ? "-" : row.classAverage.toFixed(1),
            row.rank === null ? "-" : String(row.rank)
        ];

        cells.forEach(function (value) {
            var td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    card.appendChild(table);
    container.appendChild(card);

    var summary = document.createElement("aside");
    summary.className = "report-summary";

    var heading = document.createElement("h3");
    heading.textContent = "Summary";
    summary.appendChild(heading);

    var avgLine = document.createElement("p");
    avgLine.className = "summary-average";
    avgLine.textContent = report.overall === null
        ? "Overall Average: -"
        : "Overall Average: " + report.overall.toFixed(2) + "%";
    summary.appendChild(avgLine);

    var gradeLine = document.createElement("p");
    gradeLine.textContent = "Grade: " + report.overallLetter +
                            " (" + report.overallRemark + ")";
    summary.appendChild(gradeLine);

    var statusLine = document.createElement("p");
    statusLine.className = "status-" + report.status.toLowerCase();
    statusLine.textContent = report.status;
    summary.appendChild(statusLine);

    var gradedNote = document.createElement("p");
    gradedNote.className = "summary-note";
    gradedNote.textContent = report.gradedCount + " of " + report.rows.length +
                             " subjects graded";
    summary.appendChild(gradedNote);

    var dateNote = document.createElement("p");
    dateNote.className = "summary-note";
    dateNote.textContent = "Generated: " + report.generatedOn;
    summary.appendChild(dateNote);

    container.appendChild(summary);
}

// Page startup
document.addEventListener("DOMContentLoaded", function () {
    if (!getCurrentUser()) { return; }

    var studentSelect = document.getElementById("studentSelect");
    var semesterSelect = document.getElementById("semesterSelect");
    var generateBtn = document.getElementById("generateBtn");
    var printBtn = document.getElementById("printBtn");
    var feedback = document.getElementById("reportFeedback");

    // Fill Semester dropdown
    semesterSelect.innerHTML = '<option value="">-- Select Semester --</option>';
    SEMESTERS.forEach(function (semester) {
        var option = document.createElement("option");
        option.value = semester;
        option.textContent = semester;
        semesterSelect.appendChild(option);
    });

    // Fill Student dropdown
    studentSelect.innerHTML = '<option value="">-- Select Student --</option>';
    readData("hchsStudents")
        .filter(function (s) { return s.status !== "inactive"; })
        .forEach(function (student) {
            var option = document.createElement("option");
            option.value = student.id;
            option.textContent = student.id + " - " +
                                 student.firstName + " " + student.lastName;
            studentSelect.appendChild(option);
        });

        // Pre-fill from URL
    var params = new URLSearchParams(window.location.search);
    if (params.get("student"))  { studentSelect.value = params.get("student"); }
    if (params.get("semester")) { semesterSelect.value = params.get("semester"); }

    function generate() {
        var studentId = studentSelect.value;
        var semester = semesterSelect.value;

        if (studentId === "" || semester === "") {
            feedback.textContent = "Select a student and a semester.";
            return;
        }

        var report = buildReport(studentId, semester);
        if (report === null) {
            feedback.textContent = "Student not found.";
            return;
        }

        renderReport(report);
        printBtn.disabled = false;
        feedback.textContent = "Report card generated for " + report.studentName;
    }

    generateBtn.addEventListener("click", generate);
    printBtn.addEventListener("click", function () { window.print(); });

    // Auto-generate if arrived from the View link
    if (params.get("student") && params.get("semester")) {
        generate();
    }
});