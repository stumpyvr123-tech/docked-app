(function () {
    const menu = document.getElementById("account-menu");
    const triggerLabel = document.getElementById("account-trigger-label");
    const accountEmail = document.getElementById("account-email");
    const signOutButton = document.getElementById("account-signout-button");
    const status = document.getElementById("home-auth-status");
    const dialog = document.getElementById("account-info-dialog");
    const infoContent = document.getElementById("account-info-content");

    function showUser(user) {
        const signedIn = Boolean(user);
        const isGuest = Boolean(user && user.isAnonymous);
        triggerLabel.textContent = isGuest ? "Guest" : user ? (user.displayName || "Account") : "Login";
        accountEmail.textContent = isGuest ? "Currently running as a guest" : user ? (user.email || user.displayName || "Signed in") : "Not signed in";
        signOutButton.hidden = !signedIn;
        status.textContent = !DockedAuth.isConfigured()
            ? "Sign-in is being set up by the app owner."
            : isGuest
                ? "Currently running as a guest."
            : user
                ? "Signed in already as " + (user.email || user.displayName || "your account") + "."
                : "Sign in to connect your Docked account.";
    }

    try {
        DockedAuth.onAuthStateChanged(showUser, function () {
            status.textContent = "Could not check your Firebase session. Open Login to review your settings.";
        });
    } catch {
        showUser(null);
        status.textContent = "Set up Firebase to enable sign-in on this device.";
    }

    document.getElementById("account-info-button").addEventListener("click", async function () {
        menu.open = false;
        try {
            const user = await DockedAuth.currentUser();
            if (!user) {
                infoContent.textContent = DockedAuth.isConfigured()
                    ? "You are not signed in. Choose Sign in / Sign up to connect your account."
                    : "Sign-in is being set up by the app owner.";
            } else {
                const providers = user.isAnonymous
                    ? "Guest session"
                    : (user.providerData || []).map(provider => provider.providerId).join(", ") || "Unknown";
                const detailRows = [
                    ["Account type", user.isAnonymous ? "Guest" : "Google account"],
                    ["Name", user.displayName || (user.isAnonymous ? "Guest" : "Not provided")],
                    ["Email", user.email || "Not provided"],
                    ["Email verified", user.emailVerified ? "Yes" : "No"],
                    ["Sign-in method", providers],
                    ["Firebase user ID", user.uid],
                    ["Account created", user.metadata.creationTime || "Not available"],
                    ["Last sign-in", user.metadata.lastSignInTime || "Not available"]
                ];
                infoContent.replaceChildren(...detailRows.map(function (row) {
                    const line = document.createElement("p");
                    const label = document.createElement("strong");
                    label.textContent = row[0] + ": ";
                    line.append(label, document.createTextNode(row[1]));
                    return line;
                }));
            }
        } catch {
            infoContent.textContent = "Account details are temporarily unavailable. Please try again.";
        }
        dialog.showModal();
    });

    signOutButton.addEventListener("click", async function () {
        try {
            await DockedAuth.signOut();
            menu.open = false;
        } catch {
            status.textContent = "Sign out failed. Please try again.";
        }
    });
})();