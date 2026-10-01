(function () {
    let firebaseApp;
    let persistenceMode = null;

    async function setBestAvailablePersistence(auth) {
        const persistenceTypes = firebase.auth.Auth.Persistence;
        const options = [
            ["local", persistenceTypes.LOCAL],
            ["session", persistenceTypes.SESSION],
            ["memory", persistenceTypes.NONE]
        ];
        let lastError;

        for (const [mode, type] of options) {
            try {
                await auth.setPersistence(type);
                persistenceMode = mode;
                return mode;
            } catch (error) {
                if (error.code !== "auth/unsupported-persistence-type" && error.code !== "auth/web-storage-unsupported") {
                    throw error;
                }
                lastError = error;
            }
        }

        throw lastError;
    }

    function readConfig() {
        return window.DOCKED_FIREBASE_CONFIG || null;
    }

    function isConfigured() {
        const config = readConfig();
        return Boolean(config && ["apiKey", "authDomain", "projectId", "appId"]
            .every(key => String(config[key] || "").trim()));
    }

    function getAuth() {
        if (!window.firebase || !window.firebase.auth) {
            throw new Error("Firebase could not load. Check your internet connection and reload the page.");
        }

        if (!isConfigured()) return null;

        const config = readConfig();
        firebaseApp = firebaseApp || firebase.apps.find(app => app.name === "docked") || firebase.initializeApp(config, "docked");
        return firebaseApp.auth();
    }

    async function signInWithGoogle() {
        const auth = getAuth();
        if (!auth) throw new Error("Sign-in is not configured by the app owner yet.");
        await setBestAvailablePersistence(auth);
        return auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }

    async function signInAsGuest() {
        const auth = getAuth();
        if (!auth) throw new Error("Sign-in is not configured by the app owner yet.");
        await setBestAvailablePersistence(auth);
        return auth.signInAnonymously();
    }

    async function updateDisplayName(displayName) {
        const auth = getAuth();
        if (!auth || !auth.currentUser) throw new Error("Sign in before setting your name.");
        await auth.currentUser.updateProfile({ displayName });
        return auth.currentUser;
    }

    async function currentUser() {
        const auth = getAuth();
        if (!auth) return null;

        return new Promise((resolve, reject) => {
            let unsubscribe = function () {};
            unsubscribe = auth.onAuthStateChanged(
                user => {
                    unsubscribe();
                    resolve(user);
                },
                error => {
                    unsubscribe();
                    reject(error);
                }
            );
        });
    }

    function onAuthStateChanged(callback, onError) {
        const auth = getAuth();
        if (!auth) {
            callback(null);
            return function () {};
        }
        return auth.onAuthStateChanged(callback, onError);
    }

    async function requireUser(options) {
        const user = await currentUser();
        if (!user) {
            const destination = options && options.redirectTo || "loginsignuppage.html";
            window.location.assign(destination);
        }
        return user;
    }

    async function signOut() {
        const auth = getAuth();
        if (auth) await auth.signOut();
    }

    window.DockedAuth = Object.freeze({
        currentUser,
        getPersistenceMode: () => persistenceMode,
        isConfigured,
        onAuthStateChanged,
        requireUser,
        signInAsGuest,
        signInWithGoogle,
        signOut,
        updateDisplayName
    });
})();