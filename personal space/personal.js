import { auth, database, ref, set, get, orderByChild, equalTo, query, push, onValue, limitToLast, remove } from '../firebase-init.js';

document.addEventListener('DOMContentLoaded', function () {
    // מקבל את האלמנטים הנדרשים: כפתור פתיחת התפריט, תפריט הצדדים המובייל, וכפתור סגירת התפריט
    const menuToggle = document.getElementById('menuToggle');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const closeSidebar = document.getElementById('closeSidebar');

    // אם כפתור הפתיחה והתפריט קיימים, מוסיפים מאזין לאירוע click
    if (menuToggle && mobileSidebar) {
        menuToggle.addEventListener('click', function () {
            // משנה את המצב של התפריט (מופיע/נעלם) על ידי הוספת או הסרת מחלקת 'active'
            mobileSidebar.classList.toggle('active');
        });
    }

    // אם כפתור הסגירה והתפריט קיימים, מוסיפים מאזין לאירוע click
    if (closeSidebar && mobileSidebar) {
        closeSidebar.addEventListener('click', function () {
            // מסיר את מחלקת 'active' מהתפריט כדי לסגור אותו
            mobileSidebar.classList.remove('active');
        });
    }
});

// רשמה של משפטים
const quotes = [
    "We find your stuff because, let’s face it, you never can.",
    "Lost your keys again? Shocker. Don’t worry, we’re here to rescue you (again).",
    "Your things can’t run far, but somehow you still lose them. Good thing we’re here.",
    "Who knew adulting came with a side of where-did-I-put-that? You’re welcome.",
    "We’d call it a talent, but losing things isn’t exactly a skill worth bragging about.",
    "We find your stuff so you can keep pretending you’re organized.",
    "Your phone, your keys, your sanity—we’ll help with two out of three.",
    "If misplacing things was an Olympic event, you’d be the reigning champ. Congrats?",
    "Relax, your keys didn’t grow legs. Now let us find them again.",
    "You lose stuff like it’s your full-time job. We’ll be your side hustle.",
    "Pro tip: Try not to lose the app that helps you find the things you lose.",
    "Why keep track of anything when we’re around to do it for you?",
    "Don’t worry, your stuff isn’t lost. It’s just hiding from you... again.",
    "Keys? Phone? Wallet? If only you were as good at keeping them as we are at finding them.",
    "Losing stuff builds character. Finding it builds our reputation."
];

// Function to update the quote
export function updateQuote() {
    // קבלת משפט רנדומלי
    const randomIndex = Math.floor(Math.random() * quotes.length); // Generate a random index
    const randomQuote = quotes[randomIndex];

    const dailyQuoteElement = document.getElementById('dailyQuote'); // קבלת המשפט הנוכחי ושמירה במשתנה

    // הצגת המשפט הרנדומלי במקום הנוכחי
    if (dailyQuoteElement) {
        dailyQuoteElement.textContent = randomQuote;

        // Add event listener for click (inside the scope where dailyQuoteElement is defined)
        dailyQuoteElement.addEventListener('click', updateQuote);
    }
}

// הפעלת הפונקציה
updateQuote();

// עדכון המשפט כל 5 דק
setInterval(updateQuote, 300000); // 5 minutes


let uid = null

auth.onAuthStateChanged((user) => {
    if (user) {
        uid = user.uid;
        console.log("user is signed in")
        loadItems()
        loadLastItemByTimestamp()
        itemDisplay()
        const userRef = ref(database, 'users/' + user.uid);
        get(userRef).then(snapshot => {
            const userName = snapshot.val()?.name
            console.log(userName)
            document.getElementById("welcome-title").textContent = `Welcome ${userName} to Your Private Zone!`;
        });
    } else {
        const titleElement = document.getElementById("welcome-title");
        if (titleElement) {
            titleElement.textContent = "Welcome to Your Private Zone!";
        }

    }
});

function Item(name, description, category, mac) {
    this.name = name;
    this.description = description;
    this.category = category;
    this.mac = mac;
    this.timestamp = Date.now();
}

export function addItem() {
    // קבלת הערכים שהוזנו בשדות שם, תיאור, קטגוריה וכתובת MAC
    const nameInput = document.getElementById("Iname").value;
    const desInput = document.getElementById("Ides").value;
    const catInput = document.getElementById("Icat").value;
    const macInput = document.getElementById("Imac").value;

    // בדיקה אם שם המוצר וכתובת ה-MAC הוזנו. אם לא, מציגים הודעת שגיאה
    if (!macInput || !nameInput) {
        alert('You must put mac and name!')
        return;
    }
    // בדיקה אם המשתמש מחובר (uid קיים). אם לא, מציגים הודעת שגיאה
    if (!uid) {
        alert("User is not logged in. Please log in to add items.");
        return;
    }
    // יצירת אובייקט של פריט חדש עם הערכים שהוזנו
    const item = new Item(nameInput, desInput, catInput, macInput);
    // הפנייה למיקום פריטי המשתמש במסד הנתונים
    const userRef = ref(database, `/users/${uid}/items`);
    // ביצוע שאילתה כדי לבדוק אם כבר קיים פריט עם שם זהה במסד הנתונים
    const userQuery = query(userRef, orderByChild('name'), equalTo(nameInput));
    get(userQuery)
        .then((snapshot) => {
            // אם נמצא פריט עם שם זהה, מציגים הודעה שהפריט כבר קיים
            if (snapshot.exists()) {
                alert("Item already exists!");
            } else {
                // אם לא נמצא פריט כזה, מכניסים את הפריט החדש למסד הנתונים
                const newItemRef = push(userRef, item);

                // שומרים את כתובת ה-MAC במסד הנתונים עם ערכים התחלתיים (מרחק ומצב כפתור)
                const espRef = ref(database, `/mac/${macInput}`);
                return set(espRef, {
                    distance: 0,
                    buttonState: 0
                }).then(() => newItemRef); // מחזירים את ה-newItemRef לאחר ההגדרה של ה-MAC
            }
        })
        .then(() => {
            // אם ההוספה הצליחה, מציגים הודעת הצלחה ומנקים את שדות הקלט
            Swal.fire({
                title: 'Item Added successfully',
                text: 'You can watch your list of items.',
                icon: 'success',
                confirmButtonText: 'confirm',
                confirmButtonColor: '#3498db',
            });
            console.log("Item data saved successfully to the database!");
            document.getElementById("Iname").value = "";
            document.getElementById("Ides").value = "";
            document.getElementById("Icat").value = "";
            document.getElementById("Imac").value = "";
        })
        .catch((error) => {
            // אם קרתה שגיאה במהלך התהליך, מציגים את הודעת השגיאה
            console.error("Error:", error.message);
        });

}


if (document.getElementById("addItemButton")) {
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById("addItemButton").addEventListener('click', addItem);
    });
}

function loadItems() {
    // הפנייה לפריטי המשתמש במסד הנתונים של Firebase
    const itemsRef = ref(database, `/users/${uid}/items`);

    // קריאה למסד הנתונים כדי לקבל את הפריטים
    get(itemsRef).then((snapshot) => {
        if (snapshot.exists()) {
            // אם נמצאו פריטים, אנחנו מקבלים את הנתונים
            const items = snapshot.val();
            const itemsList = document.getElementById('listOfItems');
            // מנקים את רשימת הפריטים הקיימת
            itemsList.innerHTML = '';

            // מעבירים על כל פריט ומוסיפים אותו לרשימה
            for (let itemKey in items) {
                const item = items[itemKey];

                // יצירת אלמנט רשימה חדש עם כפתור ומקום להצגת המרחק
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item');

                // הוספת תוכן לפריט ברשימה, כולל כפתור להציג את המרחק
                listItem.innerHTML = `
                        <div class="d-flex justify-content-between align-items-center">
                            <li>${item.name}</li>
                        </div>
                    `;

                // הוספת פריט הרשימה לרשימה הכללית
                itemsList.appendChild(listItem);
            }
        } else {
            console.log("No items found.");  // אם לא נמצאו פריטים, הדפסה למסך
        }
    }).catch((error) => {
        // אם קרתה שגיאה במהלך קריאת הנתונים, הדפסה למסך
        console.error("Error retrieving items:", error);
    });
}


export function itemDisplay() {
    if (!uid) {
        console.log('User not signed up');
        return;
    }
    const userRef = ref(database, `users/${uid}/items`);
    get(userRef)
        .then(snapshot => {
            const container = document.getElementById('cards-container');
            container.innerHTML = '';

            if (!snapshot.exists()) {
                const card = document.createElement('div');
                card.classList.add('card');
                const title = document.createElement('h2');
                title.textContent = 'No items added yet';
                card.appendChild(title);
                container.appendChild(card);
            } else {
                snapshot.forEach(itemSnapshot => {
                    const card = document.createElement('div');
                    card.classList.add('card');

                    const header = document.createElement('div');
                    header.classList.add('card-header');

                    //title
                    const title = document.createElement('h2');
                    title.textContent = itemSnapshot.val().name;
                    header.appendChild(title);

                    //delete button
                    const deleteButton = document.createElement('button');
                    deleteButton.classList.add('delete-btn');
                    deleteButton.innerHTML = `
                                            <lord-icon
                                                src="https://cdn.lordicon.com/crxdwbpm.json"
                                                trigger="hover"
                                                colors="primary:#ee66aa,secondary:#c7166f"
                                                style="width:40px;height:40px">
                                            </lord-icon>`;
                    deleteButton.setAttribute('button-key', itemSnapshot.key);
                    header.appendChild(deleteButton);

                    card.appendChild(header);

                    //description
                    const descriptionItem = document.createElement('p');
                    descriptionItem.textContent = itemSnapshot.val().description;
                    card.appendChild(descriptionItem);

                    //distance
                    const distanceElement = document.createElement('p');
                    distanceElement.classList.add('distance');
                    distanceElement.style.display = 'none';
                    card.appendChild(distanceElement);

                    //distance button
                    const button = document.createElement('button');
                    button.classList.add('btn');
                    button.textContent = 'Show Distance';
                    button.setAttribute('data-key', itemSnapshot.key);
                    card.appendChild(button);

                    container.appendChild(card);

                })
            }
        })
        .catch(error => {
            console.error('Error getting items:', error);
        })
}


export function deleteItem(itemKey, buttonElement) {
    if (!uid) {
        alert("User is not logged in.");
        return;
    }

    const itemRef = ref(database, `/users/${uid}/items/${itemKey}`);

    get(itemRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const itemData = snapshot.val();
                const macAddress = itemData.mac;

                const macRef = ref(database, `/mac/${macAddress}`);

                // קודם מוחקים את הנתיב של האייטם
                remove(itemRef)
                    .then(() => {
                        // רק אחרי שמחקנו את האייטם, ננסה למחוק את הכתובת MAC
                        remove(macRef)
                            .then(() => {
                                const card = buttonElement.closest('.card');
                                if (card) {
                                    card.remove();
                                }
                            })
                            .catch((error) => {
                                console.error('Error deleting MAC address:', error);
                            });
                    })
                    .catch((error) => {
                        console.error('Error deleting item:', error);
                    });

            } else {
                console.error('Item does not exist.');
            }
        })
        .catch((error) => {
            console.error('Error fetching item data:', error);
        });
}





document.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('.delete-btn');
    if (deleteButton) {
        const itemKey = deleteButton.getAttribute('button-key');
        deleteItem(itemKey, deleteButton);
    }
});



function toggleButtonStateAndShowDistance(itemKey) {
    if (!uid) {
        alert("User is not logged in.");
        return;
    }

    // הפנייה לפריט הספציפי במסד הנתונים לפי itemKey
    const itemRef = ref(database, `/users/${uid}/items/${itemKey}`);
    // שליפת הנתונים של הפריט
    get(itemRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const item = snapshot.val();
                const macAddress = item.mac;  // קבלת כתובת ה-MAC של הפריט

                // הפנייה ל-state של כפתור עבור ה-MAC והפיכת המצב
                const buttonRef = ref(database, `/mac/${macAddress}/buttonState`);
                get(buttonRef).then((buttonSnapshot) => {
                    const currentState = buttonSnapshot.val() || 0;  // אם אין מצב, נשתמש ב-0
                    const newState = currentState === 0 ? 1 : 0;  // אם המצב הנוכחי הוא 0, נעבור ל-1 ולהפך
                    set(buttonRef, newState);  // עדכון המצב החדש של הכפתור

                    const button = document.querySelector(`[data-key="${itemKey}"]`);
                    if (newState === 1) {
                        button.textContent = 'Hide Distance';  // אם המצב חדש הוא 1, הראה "הסתר מרחק"
                    } else {
                        button.textContent = 'Show Distance';  // אם המצב חדש הוא 0, הראה "הראה מרחק"
                    }

                    // האזנה לשינויים במרחק והצגת המידע כאשר המצב הוא 1
                    const distanceRef = ref(database, `/mac/${macAddress}/distance/distance`);

                    onValue(distanceRef, (distanceSnapshot) => {
                        const distance = distanceSnapshot.val();  // שליפת המרחק הנוכחי
                        const card = document.querySelector(`[data-key="${itemKey}"]`).closest('.card');
                        console.log(card)
                        const distanceElement = card.querySelector('.distance');
                        console.log(distanceElement)

                        // הצגת המרחק רק כאשר המצב הוא 1
                        if (newState === 1) {
                            if (distance !== null && distance !== undefined) {
                                distanceElement.textContent = `Distance: ${distance.toFixed(2)} meters`;  // הצגת המרחק
                            } else {
                                distanceElement.textContent = "Distance data not available.";  // אם אין נתונים, הצג הודעה
                            }

                            distanceElement.style.display = 'block';  // הצגת המרחק
                        } else {
                            distanceElement.style.display = 'none';  // הסתרת המרחק כאשר המצב הוא 0
                        }
                    });
                });
            }
        });
}


document.addEventListener('click', (event) => {
    if (event.target && event.target.classList.contains('btn')) {
        const itemKey = event.target.getAttribute('data-key');
        toggleButtonStateAndShowDistance(itemKey);
    }
});


function loadLastItemByTimestamp() {
    // בדיקה אם קיים מזהה משתמש מחובר
    if (!uid) {
        console.log("No user logged in"); // אם אין משתמש מחובר, מציגים הודעה ויוצאים מהפונקציה
        return;
    }
    // יוצרים רפרנס לנתיב של פריטי המשתמש בפיירבייס, מסדרים אותם לפי חותמת זמן ולוקחים רק את האחרון
    const userItemsRef = query(
        ref(database, `/users/${uid}/items`), // הנתיב שבו נשמרים הפריטים של המשתמש
        orderByChild('timestamp'), // ממיינים את הנתונים לפי חותמת הזמן
        limitToLast(1) // מביאים רק את הפריט האחרון שהוזן
    );
    // מבצעים שאילתת קריאה כדי לקבל את הפריט האחרון שנוסף
    get(userItemsRef)
        .then((snapshot) => {
            if (snapshot.exists()) { // בדיקה אם יש נתונים ברפרנס
                snapshot.forEach((childSnapshot) => {
                    const lastItem = childSnapshot.val(); // מקבלים את נתוני הפריט האחרון

                    // מציגים את הפריט האחרון בעמוד HTML בתוך האלמנט עם id 'lastAddedItem'
                    document.getElementById('lastAddedItem').innerHTML =
                        `<strong>Your Last Added Item!</strong> </br>
                         <span> item- ${lastItem.name || "Unnamed Item"}</span>`; // אם אין שם, מציגים "Unnamed Item"
                });
            } else {
                console.log("No items found."); // אם אין נתונים, מציגים הודעה בקונסולה
            }
        })
        .catch((error) => {
            console.error("Error retrieving last item:", error); // טיפול בשגיאות במקרה של כשל בשליפת הנתונים
        });
}















