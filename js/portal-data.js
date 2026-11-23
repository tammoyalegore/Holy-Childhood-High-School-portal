// Group Members:
//1. Tammoya Legore (ID: 2407444) - Monday/3-5
//2. Peter John Kennedy (ID: 2507390) - Monday/3-5
//3. Jonathan Daye (ID: 2508418) - Monday/3-5
//4. Dahlia-Marie Williams (ID: 2506230) - Monday/3-5

const SEMESTERS = ["2026 Semester 1", "2026 Semester 2"];

// Fills the localStorage with sample data the first time the portal loads
function loadPortalData() {
    if (localStorage.getItem("hchsTeachers") !== null) {
        return;
    }

    // Teacher accounts
    var teachers = [
        { username: "teacher", fullname: "Mrs. Marcia Campbell", department: "Information Technology" }
    ];

    // Sample students
    var students = [
        { id: "HCHS-001", firstName: "Brianna",  lastName: "Thompson", email: "brianna.thompson@hchs.edu.jm", className: "Grade 10", semester: "Semester 1", formClass: "10A", status: "active" },
        { id: "HCHS-002", firstName: "Zaria",    lastName: "Morgan",   email: "zaria.morgan@hchs.edu.jm",   className: "Grade 10", semester: "Semester 1", formClass: "10A", status: "active" },
        { id: "HCHS-003", firstName: "Tiana",    lastName: "Sinclair", email: "tiana.sinclair@hchs.edu.jm", className: "Grade 10", semester: "Semester 1", formClass: "10B", status: "active" },
        { id: "HCHS-004", firstName: "Sasha",    lastName: "Bennett",  email: "sasha.bennett@hchs.edu.jm",  className: "Grade 10", semester: "Semester 1", formClass: "10B", status: "active" },
        { id: "HCHS-005", firstName: "Kayla",    lastName: "Foster",   email: "kayla.foster@hchs.edu.jm",   className: "Grade 11", semester: "Semester 1", formClass: "11A", status: "active" },
        { id: "HCHS-006", firstName: "Natalia",  lastName: "Brooks",   email: "natalia.brooks@hchs.edu.jm", className: "Grade 11", semester: "Semester 1", formClass: "11A", status: "active" },
        { id: "HCHS-007", firstName: "Jada",     lastName: "Campbell", email: "jada.campbell@hchs.edu.jm",  className: "Grade 11", semester: "Semester 1", formClass: "11B", status: "active" },
        { id: "HCHS-008", firstName: "Destiny",  lastName: "Hylton",   email: "destiny.hylton@hchs.edu.jm", className: "Grade 11", semester: "Semester 1", formClass: "11B", status: "active" }
    ];

    // Subjects with assessment columns the weights add up to 1.00
    var subjects = [
        {
            code: "IT-G10",
            name: "Information Technology",
            level: "Grade 10",
            teacher: "teacher",
            assessments: [
                { name: "Coursework 1", max: 20,  weight: 0.20 },
                { name: "Coursework 2", max: 20,  weight: 0.20 },
                { name: "Practical",    max: 40,  weight: 0.25 },
                { name: "Final Exam",   max: 100, weight: 0.35 }
            ]
        },
        {
            code: "IT-G11",
            name: "Information Technology",
            level: "Grade 11",
            teacher: "teacher",
            assessments: [
                { name: "Coursework 1", max: 20,  weight: 0.20 },
                { name: "Coursework 2", max: 20,  weight: 0.20 },
                { name: "SBA",          max: 60,  weight: 0.30 },
                { name: "Mock Exam",    max: 100, weight: 0.30 }
            ]
        }
    ];
// Enroll every student in their level's subject for both semesters
    var enrollments = [];
    var counter = 1;

    students.forEach(function (student) {
        var code = student.className === "Grade 10" ? "IT-G10" : "IT-G11";

        SEMESTERS.forEach(function (semester) {
            enrollments.push({
                id: "ENR-" + counter,
                studentId: student.id,
                subjectCode: code,
                semester: semester
            });
            counter++;
        });
    });
// Sample grades
    var grades = [
        { studentId: "HCHS-001", subjectCode: "IT-G10", semester: "2026 Semester 1",
          scores: { "Coursework 1": 18, "Coursework 2": 17, "Practical": 36, "Final Exam": 88 } },
        { studentId: "HCHS-002", subjectCode: "IT-G10", semester: "2026 Semester 1",
          scores: { "Coursework 1": 12, "Coursework 2": 14, "Practical": 28, "Final Exam": 61 } },
        { studentId: "HCHS-003", subjectCode: "IT-G10", semester: "2026 Semester 1",
          scores: { "Coursework 1": 20, "Coursework 2": 19, "Practical": 39, "Final Exam": 95 } },
        { studentId: "HCHS-004", subjectCode: "IT-G10", semester: "2026 Semester 1",
          scores: { "Coursework 1": 8, "Coursework 2": 11, "Practical": 22, "Final Exam": 47 } },
        { studentId: "HCHS-005", subjectCode: "IT-G11", semester: "2026 Semester 1",
          scores: { "Coursework 1": 19, "Coursework 2": 19, "SBA": 56, "Mock Exam": 92 } },
        { studentId: "HCHS-006", subjectCode: "IT-G11", semester: "2026 Semester 1",
          scores: { "Coursework 1": 13, "Coursework 2": 15, "SBA": 40, "Mock Exam": 66 } }
    ];
// Save everything to localStorage
    localStorage.setItem("hchsTeachers",    JSON.stringify(teachers));
    localStorage.setItem("hchsStudents",    JSON.stringify(students));
    localStorage.setItem("hchsSubjects",    JSON.stringify(subjects));
    localStorage.setItem("hchsEnrollments", JSON.stringify(enrollments));
    localStorage.setItem("hchsGrades",      JSON.stringify(grades));

    console.log("Portal data loaded.");
}

loadPortalData();