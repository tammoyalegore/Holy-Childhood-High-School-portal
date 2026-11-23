// Group Members:
//1. Tammoya Legore (ID: 2407444) - Monday/3-5
//2. Peter John Kennedy (ID: 2507390) - Monday/3-5
//3. Jonathan Daye (ID: 2508418) - Monday/3-5
//4. Dahlia-Marie Williams (ID: 2506230) - Monday/3-5
// =====================================
// HOLY CHILDHOOD  PORTAL
// STUDENT 2 - SESSION MANAGEMENT
// =====================================

// Get current logged-in user
function getCurrentUser() {

    const user = sessionStorage.getItem("currentUser");

    if (user === null) {
        return null;
    }

    return JSON.parse(user);

}


// Check if user is logged in
function checkLogin() {

    const user = getCurrentUser();

    if (user === null) {

        window.location.href = "login.html";

        return false;

    }

    return true;

}


// Check user permissions
function checkRole(requiredRole) {

    const user = getCurrentUser();

    if (user === null) {

        window.location.href = "login.html";

        return false;

    }

    if (user.role !== requiredRole) {

        alert("Access denied. You do not have permission.");

        // Redirect to the correct dashboard
        if (user.role === "admin") {

            window.location.href = "admin.html";

        } else if (user.role === "teacher") {

            window.location.href = "teacher.html";

        } else {

            window.location.href = "viewer.html";

        }

        return false;

    }

    return true;

}


// Logout user
function logout() {

    sessionStorage.removeItem("currentUser");

    window.location.href = "login.html";

}