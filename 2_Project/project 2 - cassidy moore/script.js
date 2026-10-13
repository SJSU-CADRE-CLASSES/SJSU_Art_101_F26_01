// Function to leave Frame 1 and show Frame 2
let notificationReturnFocus = null;
let notificationOnClose = null;

function showSystemNotification(title, message, onAcknowledge) {
    const notification = document.getElementById("system-notification");
    notificationReturnFocus = document.activeElement;
    notificationOnClose = onAcknowledge || null;
    document.getElementById("notification-title").textContent = title;
    document.getElementById("notification-message").textContent = message;
    notification.classList.remove("hidden");
    document.getElementById("notification-acknowledge").focus();
}

function closeSystemNotification() {
    const notification = document.getElementById("system-notification");
    if (notification.classList.contains("hidden")) {
        return;
    }

    notification.classList.add("hidden");
    const onAcknowledge = notificationOnClose;
    notificationOnClose = null;
    if (onAcknowledge) {
        onAcknowledge();
    }

    if (notificationReturnFocus && notificationReturnFocus.isConnected &&
        !notificationReturnFocus.closest(".hidden")) {
        notificationReturnFocus.focus();
    } else {
        const activeScreen = document.querySelector(".screen-state:not(.hidden)");
        const firstButton = activeScreen && activeScreen.querySelector("button:not(.hidden)");
        if (firstButton) {
            firstButton.focus();
        }
    }
    notificationReturnFocus = null;
}

function populateRadar() {
    const radar = document.querySelector(".radar-container");
    const existingBlips = radar.querySelectorAll(".radar-blip").length;
    const totalBlips = 50;
    const additionalBlips = Math.max(0, totalBlips - existingBlips);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let index = 0; index < additionalBlips; index += 1) {
        const distance = 42 * Math.sqrt((index + 0.5) / additionalBlips);
        const angle = index * goldenAngle;
        const blip = document.createElement("span");
        blip.className = "radar-blip field-blip";
        blip.setAttribute("aria-hidden", "true");
        blip.style.left = `${50 + Math.cos(angle) * distance}%`;
        blip.style.top = `${50 + Math.sin(angle) * distance}%`;
        radar.appendChild(blip);
    }
}

populateRadar();

document.addEventListener("keydown", function (event) {
    const notification = document.getElementById("system-notification");
    if (event.key === "Escape" && !notification.classList.contains("hidden")) {
        closeSystemNotification();
    }
});

function goToFrame2() {
    // Hide Frame 1 by adding the "hidden" class
    document.getElementById("frame1").classList.add("hidden");
    
    // Show Frame 2 by removing the "hidden" class
    document.getElementById("frame2").classList.remove("hidden");
}

function goToFrame3() {
    document.getElementById("frame2").classList.add("hidden");
    document.getElementById("frame3").classList.remove("hidden");
}

function simulateStorm() {
    let meter = document.getElementById("storm-meter");
    meter.style.width = "95%";
    meter.style.backgroundColor = "#ff3333";

    showSystemNotification(
        "STORM WARNING",
        "Critical warning: Storm path intersecting current coordinates. Broadcast override detected...",
        function () {
            document.getElementById("frame2").classList.add("hidden");
            document.getElementById("frame3").classList.remove("hidden");
        }
    );
}

function acceptTransmission() {
    showSystemNotification(
        "TRANSMISSION ACCEPTED",
        "System calibrated. You open your consciousness to the radiation of the Sun Worshippers...",
        function () {
            document.getElementById("next-to-frame4").classList.remove("hidden");
        }
    );
}

function blockTransmission() {
    showSystemNotification(
        "SIGNAL TERMINATED",
        "Static fills the monitor, but a lingering echo remains.",
        function () {
            document.getElementById("next-to-frame4").classList.remove("hidden");
        }
    );
}

function decodeMessage() {
    document.getElementById("hidden-message").classList.remove("hidden");
    document.getElementById("next-to-frame4").classList.remove("hidden");
}

function goToFrame4() {
    document.getElementById("frame3").classList.add("hidden");
    document.getElementById("frame4").classList.remove("hidden");
}

function showEncounterFeedback(message) {
    const feedback = document.getElementById("action-feedback");
    feedback.textContent = message;
    feedback.classList.remove("hidden");
    document.getElementById("next-to-frame5").classList.remove("hidden");
}

function hideSignal() {
    showEncounterFeedback("Signal concealed. The movement pauses, searching for your location.");
}

function reroute() {
    showEncounterFeedback("Signal rerouted away from your position. The unknown heat signature changes course.");
}

function scanCreature() {
    document.getElementById("distance-display").textContent = "400 METERS — SCAN LOCKED";
    showEncounterFeedback("Scan complete: unknown lifeform detected. Heat signature is unstable; threat level remains high.");
}

function returnToShelter() {
    showEncounterFeedback("Shelter route selected. Keep your signal hidden as you retreat.");
}

function goToFrame5() {
    showSystemNotification("SURFACE MAP", "Surface map is not available yet.");
}
