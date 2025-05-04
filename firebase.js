import { auth, database, ref, set, get, createUserWithEmailAndPassword, query, orderByChild, equalTo, signInWithEmailAndPassword, signOut } from "./firebase-init.js";
let uid = null


auth.onAuthStateChanged((user) => {
    if (user) {
        uid = user.uid;
        console.log("user is signed in");
    } else {
        console.log("user is signed out");
    }
    updateNavigation()
});

function User(name, email, uid, username) {
    this.name = name
    this.email = email;
    this.uid = uid;
    this.username = username;
    this.items = [];
}

export function signUp() {
    const nameInput = document.getElementById("name").value;
    const userNameInput = document.getElementById("username").value;
    const emailInput = document.getElementById("email").value;
    const passwordInput = document.getElementById("password").value;

    if (!userNameInput || !emailInput || !passwordInput) {
        console.error("Please fill in all required fields.");
        alert("All fields are required!"); 
        return;
    }

    const userRef = ref(database, 'users');
    const userQuery = query(userRef, orderByChild('username'), equalTo(userNameInput));

    get(userQuery)
        .then((snapshot) => {
            if (snapshot.exists()) {
                alert("Username already exists!"); // הודעה אם שם המשתמש כבר קיים
            } else {
                createUserWithEmailAndPassword(auth, emailInput, passwordInput)
                    .then((userCredential) => {
                        const user = userCredential.user;
                        const userex = new User(nameInput, emailInput, user.uid, userNameInput);

                        // שמירת נתוני המשתמש במסד הנתונים תחת מזהה המשתמש
                        set(ref(database, 'users/' + user.uid), userex)
                            .then(() => {
                                // הצגת הודעת הצלחה לאחר הרשמה מוצלחת
                                Swal.fire({
                                    title: 'Success!',
                                    text: 'You have successfully signed up.',
                                    icon: 'success',
                                    confirmButtonText: 'Great!',
                                    confirmButtonColor: '#4CAF50',
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        window.location.href = 'index.html';
                                    }
                                });
                                console.log("User data saved successfully to the database!");
                                // ריקון השדות אחרי הרשמה מוצלחת
                                document.getElementById("name").value = "";
                                document.getElementById("username").value = "";
                                document.getElementById("email").value = "";
                                document.getElementById("password").value = "";
                            })
                            .catch((error) => {
                                console.error("Error saving user data to database:", error);
                            });
                    })
                    .catch((error) => {
                        // הצגת הודעת שגיאה אם קרתה תקלה במהלך ההרשמה
                        console.error("Error during sign-up:", error.message);
                        alert("Sign-up failed: " + error.message);
                    });
            }
        })
        .catch((error) => {
            // הצגת הודעת שגיאה אם קרתה תקלה בקריאת הנתונים ממסד הנתונים
            console.error("Error reading data:", error);
        });
}




if (document.getElementById("signUpButton")) {
    document.addEventListener("DOMContentLoaded", function () {
        document.getElementById("signUpButton").addEventListener("click", signUp);
    });
}

// התחברות
export function login() {
    // קבלת הערכים שהוזנו בשדות שם המשתמש והסיסמה
    const usernameInput = document.getElementById("LOGusername").value;
    const passwordInput = document.getElementById("LOGpassword").value;

    // בדיקה אם כל השדות הוזנו, אם לא מציגים הודעת שגיאה
    if (!usernameInput || !passwordInput) {
        alert("Please fill in both username and password!");  // הודעה אם אחד מהשדות חסר
        return;
    }

    // הפנייה למיקום המשתמשים במסד הנתונים
    const userRef = ref(database, 'users');
    const userQuery = query(userRef, orderByChild('username'), equalTo(usernameInput));

    // קריאה למסד הנתונים כדי לבדוק אם יש משתמש עם שם המשתמש הזה
    get(userQuery)
        .then((snapshot) => {
            // אם שם המשתמש קיים במסד הנתונים
            if (snapshot.exists()) {
                let userEmail;
                snapshot.forEach((childSnapshot) => {
                    const userData = childSnapshot.val();
                    userEmail = userData.email;  // קבלת המייל של המשתמש
                });

                // אם נמצא מייל למשתמש, מנסים להתחבר עם המייל והסיסמה
                if (userEmail) {
                    signInWithEmailAndPassword(auth, userEmail, passwordInput)
                        .then((userCredential) => {
                            const user = userCredential.user;
                            console.log("User signed in:", user);
                            Swal.fire({
                                title: 'Welcome Back!',  // ברוך הבא אחרי התחברות מוצלחת
                                text: 'You have successfully logged in.',
                                icon: 'success',
                                confirmButtonText: 'Go to Personal Space',
                                confirmButtonColor: '#3498db',  
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    // הפניית המשתמש לדף אישי לאחר ההתחברות
                                    window.location.href = '/html-pages/personal space/personal.html';  // דף אישי של המשתמש
                                }
                            });

                        })
                        .catch((error) => {
                            console.error("Login error:", error);
                            // אם ההתחברות נכשלה, מציגים הודעת שגיאה
                            alert("Login failed: " + error.message);
                        });
                } else {
                    // אם לא נמצא מייל עבור שם המשתמש
                    alert("User not found!");  // הודעה אם המייל לא נמצא
                }
            } else {
                // אם שם המשתמש לא קיים במסד הנתונים
                alert("Username not found!");  // הודעה אם שם המשתמש לא נמצא
            }
        })
        .catch((error) => {
            console.error("Error getting user data:", error);
            // אם יש שגיאה בקבלת נתוני המשתמשים, מציגים הודעת שגיאה
            alert("An error occurred. Please try again.");  // הודעה אם הייתה שגיאה בלקיחת הנתונים
        });
}



if (document.getElementById("logInButton")) {
    document.addEventListener("DOMContentLoaded", function () {
        document.getElementById("logInButton").addEventListener("click", login);
    });
}



function updateNavigation() {
    const personalSpaceLink = document.getElementById('personalSpaceLink');

    if (uid) {
        personalSpaceLink.style.display = 'block';  // הצג את הקישור
    } else {
        personalSpaceLink.style.display = 'none';   // הסתר את הקישור
    }
}
  


// פונקציה להתנתקות משתמש
export function logout() {
    // ביצוע התהליך של התנתקות מהמשתמש
    signOut(auth)
        .then(() => {
            // אם ההתנתקות הצליחה
            console.log("User signed out successfully.");

            uid = null; // איפוס המשתמש המחובר (המשתמש שהתנתק)

            // העברת המשתמש לדף הבית לאחר ההתנתקות
            Swal.fire({
                title: 'Logged Out!',  // הכותרת של ההודעה
                text: 'You have successfully logged out.',  // הודעה שמאשרת שהמשתמש התנתק בהצלחה
                icon: 'success',  // אייקון הצלחה
                confirmButtonText: 'Go to Home',  // טקסט על הכפתור
                confirmButtonColor: '#3498db',  // צבע כפתור כחול להתנתקות
            }).then((result) => {
                // אם המשתמש לחץ על כפתור 'Go to Home'
                if (result.isConfirmed) {
                    // הפניית המשתמש לדף הבית לאחר ההתנתקות
                    window.location.href = '/html-pages/index.html';  // דף הבית
                }
            });

        })
        .catch((error) => {
            // אם קרתה שגיאה במהלך ההתנתקות
            console.error("Error during sign out:", error);  // הדפסת השגיאה בקונסול
            alert("Logout failed: " + error.message);  // הצגת הודעת שגיאה אם ההתנתקות נכשלה
        });
}



if (document.getElementById("logoutButton")) {
    document.addEventListener("DOMContentLoaded", function () {
        document.getElementById("logoutButton").addEventListener("click", logout);
        document.getElementById("mobileLogoutButton").addEventListener("click", logout);
    });
}




