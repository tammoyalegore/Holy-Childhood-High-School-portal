/*
Group Members:
1. Tammoya Legore (ID: 2407444) - Monday/3-5
2. Peter John Kennedy (ID: 2507390) - Monday/3-5
3. Jonathan Daye (ID: 2508418) - Monday/3-5
4. Dahlia-Marie Williams (ID: 2506230) - Monday/3-5
*/

const FINANCE_LEDGER_KEY = "hchs_tuition_ledger";

const TUITION_RATES = {
    "Grade 7": 75000,
    "Grade 8": 75000,
    "Grade 9": 78000,
    "Grade 10": 85000,
    "Grade 11": 85000,
    "Sixth Form": 95000
};

// Determine Paid, Pending, or Outstanding status
function getFinancialStatus(totalTuition, amountPaid) {
    const balance = Math.max(0, totalTuition - amountPaid);
    if (totalTuition > 0 && balance === 0) return "Paid";
    if (amountPaid > 0 && balance > 0) return "Pending";
    return "Outstanding";
}

// Calculate weighted average from hchsGrades & hchsSubjects
function getStudentAcademicSummary(studentId) {
    const subjects = JSON.parse(localStorage.getItem("hchsSubjects")) || [];
    const grades = JSON.parse(localStorage.getItem("hchsGrades")) || [];
    const studentGrades = grades.filter(g => g.studentId === studentId);

    if (studentGrades.length === 0) {
        return { averageText: "N/A", standing: "No Grades Posted" };
    }

    let totalPct = 0;
    let count = 0;

    studentGrades.forEach(entry => {
        const subject = subjects.find(s => s.code === entry.subjectCode);
        if (!subject || !entry.scores) return;

        let weighted = 0;
        subject.assessments.forEach(a => {
            const raw = Number(entry.scores[a.name]);
            if (!Number.isNaN(raw) && a.max > 0) {
                weighted += (raw / a.max) * 100 * Number(a.weight);
            }
        });
        totalPct += weighted;
        count++;
    });

    if (count === 0) return { averageText: "N/A", standing: "Pending" };

    const avg = (totalPct / count).toFixed(1);
    let standing = "Needs Improvement";
    if (avg >= 85) standing = "Principal's List";
    else if (avg >= 75) standing = "Honour Roll";
    else if (avg >= 50) standing = "Good Standing";

    return { averageText: `${avg}%`, standing };
}

// Initialize and sync tuition ledger with hchsStudents
function initFinanceLedger() {
    if (typeof loadPortalData === "function") {
        loadPortalData();
    }

    const students = JSON.parse(localStorage.getItem("hchsStudents")) || [];
    const existing = JSON.parse(localStorage.getItem(FINANCE_LEDGER_KEY)) || [];
    const existingMap = new Map(existing.map(item => [item.studentId, item]));

    // Initial realistic payment seed matching portal-data.js student IDs
    const initialSeeds = {
        "HCHS-001": { paid: 85000, date: "2026-09-04", method: "Scotiabank Deposit" },
        "HCHS-002": { paid: 65000, date: "2026-10-15", method: "NCB Online Transfer" },
        "HCHS-003": { paid: 85000, date: "2026-09-10", method: "NCB Online Transfer" },
        "HCHS-004": { paid: 0,     date: "N/A",        method: "None" },
        "HCHS-005": { paid: 85000, date: "2026-09-02", method: "Wompi Card Payment" },
        "HCHS-006": { paid: 40000, date: "2026-10-28", method: "Bursary Cash" },
        "HCHS-007": { paid: 0,     date: "N/A",        method: "None" },
        "HCHS-008": { paid: 50000, date: "2026-11-03", method: "NCB Online Transfer" }
    };

    const synced = students.map(student => {
        const tuition = TUITION_RATES[student.className] || 85000;
        const saved = existingMap.get(student.id);

        if (saved) {
            return {
                ...saved,
                studentId: student.id,
                fullName: `${student.firstName} ${student.lastName}`,
                className: student.className,
                formClass: student.formClass || "N/A",
                semester: student.semester || "Semester 1",
                email: student.email || "",
                totalTuition: Number(saved.totalTuition) || tuition,
                amountPaid: Number(saved.amountPaid) || 0
            };
        }

        const seed = initialSeeds[student.id] || { paid: 0, date: "N/A", method: "None" };
        return {
            studentId: student.id,
            fullName: `${student.firstName} ${student.lastName}`,
            className: student.className,
            formClass: student.formClass || "N/A",
            semester: student.semester || "Semester 1",
            email: student.email || "",
            totalTuition: tuition,
            amountPaid: seed.paid,
            lastPaymentDate: seed.date,
            paymentMethod: seed.method
        };
    });

    localStorage.setItem(FINANCE_LEDGER_KEY, JSON.stringify(synced));
    return synced;
}

// Return unified records combining Student Profile + Grades + Financial Ledger
function getLedgerRecords() {
    const ledger = initFinanceLedger();
    return ledger.map(record => {
        const balance = Math.max(0, record.totalTuition - record.amountPaid);
        const status = getFinancialStatus(record.totalTuition, record.amountPaid);
        const academics = getStudentAcademicSummary(record.studentId);
        return {
            ...record,
            balance,
            status,
            averageText: academics.averageText,
            standing: academics.standing
        };
    });
}

// Post a new tuition payment (used in Admin Financial Ledger Module)
function recordTuitionPayment(studentId, paymentAmount, method) {
    const records = initFinanceLedger();
    const index = records.findIndex(r => r.studentId.toLowerCase() === studentId.trim().toLowerCase());

    if (index === -1) {
        return { success: false, message: "Student ID not found in ledger." };
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
        return { success: false, message: "Enter a valid payment amount greater than $0." };
    }

    records[index].amountPaid += amount;
    records[index].lastPaymentDate = new Date().toISOString().split("T")[0];
    records[index].paymentMethod = method;

    localStorage.setItem(FINANCE_LEDGER_KEY, JSON.stringify(records));
    const newStatus = getFinancialStatus(records[index].totalTuition, records[index].amountPaid);

    return {
        success: true,
        studentId: records[index].studentId,
        status: newStatus,
        message: `Payment of JMD $${amount.toLocaleString()} recorded for ${records[index].fullName}. Status: ${newStatus}.`
    };
}

// Universal multi-parameter search (ID, Name, Class/Form, or Financial Status)
function searchStudentProfiles(query, statusFilter = "ALL") {
    const records = getLedgerRecords();
    const term = (query || "").trim().toLowerCase();

    return records.filter(r => {
        const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
        const matchesTerm = !term
            || r.studentId.toLowerCase().includes(term)
            || r.fullName.toLowerCase().includes(term)
            || r.className.toLowerCase().includes(term)
            || r.formClass.toLowerCase().includes(term);
        return matchesStatus && matchesTerm;
    });
}