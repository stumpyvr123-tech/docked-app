const DOCKED_FIREBASE_CONFIG = {
    apiKey: "AIzaSyBdgnoADr6a5rwtYm8DgMQd3_22CE3ezCo",
    authDomain: "loginfordockedinfo.firebaseapp.com",
    projectId: "loginfordockedinfo",
    storageBucket: "loginfordockedinfo.firebasestorage.app",
    messagingSenderId: "458255602908",
    appId: "1:458255602908:web:21ab525cc2b54db9319019"
};

    if (typeof window !== "undefined") {
        window.DOCKED_FIREBASE_CONFIG = DOCKED_FIREBASE_CONFIG;
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = DOCKED_FIREBASE_CONFIG;
    }