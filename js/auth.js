// Group Members:
//1. Tammoya Legore (ID: 2407444) - Monday/3-5
//2. Peter John Kennedy (ID: 2507390) - Monday/3-5
//3. Jonathan Daye (ID: 2508418) - Monday/3-5
//4. Dahlia-Marie Williams (ID: 2506230) - Monday/3-5// 
// =====================================
// HOLY CHILDHOOD  PORTAL
// STUDENT 2 - AUTHENTICATION
// =====================================

// Get login form
const loginForm = document.getElementById("login-form");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        // Get user input
        const username = document.getElementById("username").value.trim();

        const password = document.getElementById("password").value;

        const message = document.getElementById("login-message");

        // Find account
        const user = findUser(username);

        // Validate login
        if (user && user.password === password) {

            // Store current session
            const currentUser = {
                id: user.id,
                username: user.username,
                fullname: user.fullname,
                role: user.role
            };

            sessionStorage.setItem(
                "currentUser",
                JSON.stringify(currentUser)
            );

            // Redirect based on role
            if (user.role === "admin") {

                window.location.href = "admin.html";

            } else if (user.role === "teacher") {

                window.location.href = "teacher.html";

            } else if (user.role === "viewer") {

                window.location.href = "viewer.html";

            }

        } else {

            message.textContent =
                "Incorrect username or password.";

        }

    });

}
// Show or hide password
const showPassword = document.getElementById("show-password");
const passwordInput = document.getElementById("password");

showPassword.addEventListener("change", function() {
    if (showPassword.checked) {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
});