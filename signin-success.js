(function () {
    const title = document.getElementById("success-title");
    const copy = document.getElementById("success-copy");
    const status = document.getElementById("success-status");
    const statusText = document.getElementById("success-status-text");
    const loader = document.getElementById("success-loader");
    const continueButton = document.getElementById("continue-to-account");
    let confirmed = false;

    function showError(error) {
        title.textContent = "We couldn't confirm your sign-in";
        copy.textContent = error && error.message || "Close this window and try signing in again.";
        statusText.textContent = "Waiting for a Firebase account session.";
        status.setAttribute("aria-busy", "false");
        loader.hidden = true;
        continueButton.textContent = "Return to account";
        continueButton.hidden = false;
        continueButton.disabled = false;
    }

    try {
        DockedAuth.onAuthStateChanged(function (user) {
            if (!user || confirmed) return;
            confirmed = true;
            title.textContent = "Successfully signed in";
            copy.textContent = user.email || user.displayName || "Your Google account is connected.";
            statusText.textContent = "Your Docked account is ready.";
            status.setAttribute("aria-busy", "false");
            loader.hidden = true;
            continueButton.hidden = false;
            continueButton.disabled = false;
        }, showError);
    } catch (error) {
        showError(error);
    }

    continueButton.addEventListener("click", async function () {
        continueButton.disabled = true;
        if (window.dockedDesktop) {
            await window.dockedDesktop.continueToAccount();
        } else if (window.opener) {
            window.close();
        } else {
            window.location.assign("index.html");
        }
    });
})();