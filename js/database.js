// Group Members:
//1. Tammoya Legore (ID: 2407444) - Monday/3-5
//2. Peter John Kennedy (ID: 2507390) - Monday/3-5
//3. Jonathan Daye (ID: 2508418) - Monday /3-5
//4. Dahlia-Marie Williams (ID: 2506230) - Monday/3-5
// =====================================
// HOLY CHILDHOOD PORTAL
// STUDENT 2 - DATABASE MANAGEMENT
// =====================================

// Sample user accounts
const users = [
    {
        id: 1,
        username: "admin",
        password: "admin123",
        fullname: "System Administrator",
        role: "admin"
    },

    {
        id: 2,
        username: "teacher",
        password: "teach123",
        fullname: "School Teacher",
        role: "teacher"
    },

    {
        id: 3,
        username: "viewer",
        password: "view123",
        fullname: "General User",
        role: "viewer"
    }
];

// Initialize database
function initializeDatabase() {

    if (localStorage.getItem("users") === null) {

        localStorage.setItem(
            "users",
            JSON.stringify(users)
        );

    }
}

// Retrieve all users
function getUsers() {

    return JSON.parse(localStorage.getItem("users")) || [];

}

// Find a user by username
function findUser(username) {

    const allUsers = getUsers();

    return allUsers.find(function(user) {

        return user.username === username;

    });

}

// Run database initialization
initializeDatabase();