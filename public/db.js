let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = event => {
    let db = event.target.result;
    db.createObjectStore("pending", {
        autoIncrement: true
    })
};

request.onsuccess = event => {
    db = event.target.request;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = event => {
    console.log("Woops! " + event.target.errorCode);
};

savedRecord = record => {
    let transaction = db.transaction(["pending"], "readwrite");
    let store = transaction.objectStore("pending");
    store.add(record);
};

checkDatabase = () => {
    let transaction = db.transaction(["pending"], "readwrite");
    let store = transaction.objectStore("pending");
    let getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                    method: "POST",
                    body: JSON.stringify(getAll.result),
                    headers: {
                        Accept: "application/json, text/plain, */*",
                        "Content-Type": "application/json"
                    }
                })
                .then(response => response.json())
                .then(() => {
                    let transaction = db.transaction(["pending"], "readwrite");
                    let store = transaction.objectStore("pending");
                    store.clear();
                });
        }
    };
}

window.addEventListener("online", checkDatabase);
