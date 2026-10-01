(function () {
    const message = document.getElementById("auth-message");
    const messageText = document.getElementById("auth-message-text");
    const loader = document.getElementById("auth-loader");
    const actionButtons = Array.from(document.querySelectorAll(
        "#google-signin-button, #guest-signin-button, #auth-signout-button, #preferred-name-form button, #profile-name-form button"
    ));
    const authControls = document.getElementById("auth-controls");
    const signedInPanel = document.getElementById("signed-in-panel");
    const signedInTitle = document.getElementById("signed-in-title");
    const signedInEmail = document.getElementById("signed-in-email");
    const namePromptPanel = document.getElementById("name-prompt-panel");
    const preferredName = document.getElementById("preferred-name");
    const nameForm = document.getElementById("preferred-name-form");
    const profileOptions = document.getElementById("profile-options");
    const profileNameForm = document.getElementById("profile-name-form");
    const profileName = document.getElementById("profile-name");
    const ownerStatus = document.getElementById("firebase-owner-status");
    const namesConfirmedThisRun = new Set();

    function showMessage(text, isError, isLoading) {
        messageText.textContent = text;
        message.classList.toggle("is-error", Boolean(isError));
        message.setAttribute("aria-busy", String(Boolean(isLoading)));
        loader.hidden = !isLoading;
        actionButtons.forEach(button => { button.disabled = Boolean(isLoading); });
    }

    function rememberName(user) {
        namesConfirmedThisRun.add(user.uid);
        try {
            localStorage.setItem("docked.profile-name." + user.uid, "saved");
        } catch {
            try {
                sessionStorage.setItem("docked.profile-name." + user.uid, "saved");
            } catch {
                return;
            }
        }
    }

    function hasRememberedName(user) {
        if (!user || namesConfirmedThisRun.has(user.uid)) return Boolean(user && namesConfirmedThisRun.has(user.uid));
        try {
            return Boolean(localStorage.getItem("docked.profile-name." + user.uid));
        } catch {
            try {
                return Boolean(sessionStorage.getItem("docked.profile-name." + user.uid));
            } catch {
                return false;
            }
        }
    }

    function explainError(error) {
        const messages = {
            "auth/operation-not-allowed": "Enable this sign-in method in Firebase Authentication settings.",
            "auth/popup-blocked": "Allow pop-ups for this app, then try Google sign-in again.",
            "auth/popup-closed-by-user": "The Google sign-in window was closed before finishing.",
            "auth/unauthorized-domain": "Add this app's domain to Firebase Authentication's Authorized domains."
        };
        return messages[error.code] || error.message || "Sign-in failed. Check the app sign-in setup and try again.";
    }

    async function runAction(action, loadingMessage) {
        showMessage(loadingMessage, false, true);
        try {
            await action();
            showMessage("", false);
        } catch (error) {
            showMessage(explainError(error), true);
        }
    }

    document.getElementById("google-signin-button").addEventListener("click", function () {
        runAction(async function () {
            await DockedAuth.signInWithGoogle();
            if (window.dockedDesktop) {
                await window.dockedDesktop.openSignInSuccess();
            } else {
                window.location.assign("signin-success.html");
            }
        }, "Connecting to Google…");
    });

    document.getElementById("guest-signin-button").addEventListener("click", function () {
        runAction(function () { return DockedAuth.signInAsGuest(); }, "Starting your guest session…");
    });

    document.getElementById("auth-signout-button").addEventListener("click", function () {
        runAction(function () { return DockedAuth.signOut(); }, "Signing out…");
    });

    nameForm.addEventListener("submit", function (event) {
        event.preventDefault();
        runAction(async function () {
            const user = await DockedAuth.updateDisplayName(preferredName.value.trim());
            rememberName(user);
            renderUser(user);
            showMessage("Name saved to your Docked account.", false);
        }, "Saving your name…");
    });

    profileNameForm.addEventListener("submit", function (event) {
        event.preventDefault();
        runAction(async function () {
            const user = await DockedAuth.updateDisplayName(profileName.value.trim());
            rememberName(user);
            renderUser(user);
            showMessage("Name saved to your Docked account.", false);
        }, "Saving your name…");
    });

    function renderUser(user) {
        const configured = DockedAuth.isConfigured();
        ownerStatus.hidden = configured;
        authControls.hidden = !configured || Boolean(user);
        const isGuest = Boolean(user && user.isAnonymous);
        const hasChosenName = isGuest || hasRememberedName(user);
        namePromptPanel.hidden = !user || hasChosenName;
        signedInPanel.hidden = !user || !hasChosenName;
        profileOptions.hidden = !user;

        if (user) {
            const name = user.displayName || "";
            signedInTitle.textContent = isGuest ? "Currently running as a guest" : "Signed in already";
            preferredName.value = name;
            profileName.value = name;
            signedInEmail.textContent = isGuest
                ? "Guest session"
                : name
                ? name + " · " + (user.email || "Signed in")
                : user.email || "Google account";

            const persistenceMode = DockedAuth.getPersistenceMode();
            if (persistenceMode === "session") {
                showMessage("Signed in for this app session. This environment cannot keep you signed in after it closes.", false);
            } else if (persistenceMode === "memory") {
                showMessage("Signed in temporarily. This environment cannot save the session after this page closes.", false);
            }
        }
    }

    try {
        DockedAuth.onAuthStateChanged(renderUser, function (error) { showMessage(explainError(error), true); });
    } catch (error) {
        showMessage(explainError(error), true);
    }
})();