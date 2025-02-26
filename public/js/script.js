function detectAdblock() {
  setTimeout(() => {
    if (!document.getElementById("rDzNlIFXYeQk")) {
      document.getElementById("adblock-popup").style.display = "block";
    }
  }, 100);
}

// Dismiss the popup when user clicks the button
document.getElementById("dismiss-button").addEventListener("click", () => {
  document.getElementById("adblock-popup").style.display = "none";
});

// Run the adblock detection
detectAdblock();

const elements = {
  unlockForm: document.getElementById("unlock-form"),
  urlInput: document.getElementById("url-input"),
  clearBtn: document.getElementById("clear-btn"),
  outputList: document.getElementById("output-list"),
  supportedServicesList: document.getElementById("supported-services-list"),
};

let supportedServices = [];

async function getSupportedServices() {
  if (supportedServices.length > 0) {
    return supportedServices;
  }

  try {
    const response = await fetch("/api/unlock/supported");

    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.statusText}`);
    }

    supportedServices = await response.json();
    return supportedServices;
  } catch (e) {
    insertResult(
      "failure",
      `Failed to fetch supported unlock services: ${e.message}`,
    );
    return [];
  }
}

function isValidUrl(input) {
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
}

function insertResult(type, message) {
  const li = document.createElement("li");
  li.classList.add(type);
  li.innerHTML = message;
  elements.outputList.prepend(li);
}

function resetForm() {
  elements.unlockForm.reset();
  turnstile.reset();
}

function getErrorMessage(message) {
  return Array.isArray(message) ? message[0] : message || "An error occurred";
}

async function onFormSubmit(event) {
  event.preventDefault();

  if (turnstile.isExpired() || !turnstile.getResponse()) {
    return insertResult("failure", "Captcha is required");
  }

  const url = elements.urlInput.value.trim();

  if (!isValidUrl(url)) {
    return insertResult("failure", "URL is required");
  }

  const hostname = new URL(url).hostname;

  if (!supportedServices.includes(hostname)) {
    return insertResult("failure", `${hostname} is not supported`);
  }

  try {
    const response = await fetch("/api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        link: url,
        captchaToken: turnstile.getResponse(),
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      insertResult("failure", getErrorMessage(data.message));
    } else {
      const data = await response.json();
      insertResult("success", data.content);
    }
  } catch (e) {
    insertResult("failure", `Error: ${e.message}`);
  }

  resetForm();
}

function onClearButtonClick() {
  resetForm();
}

window.addEventListener("DOMContentLoaded", () => {
  elements.unlockForm.addEventListener("submit", onFormSubmit);
  elements.clearBtn.addEventListener("click", onClearButtonClick);

  getSupportedServices().then((services) => {
    if (services.length === 0) {
      insertResult("failure", "No supported services found.");
      return;
    }

    services.forEach((service) => {
      const li = document.createElement("li");
      li.innerHTML = service;
      elements.supportedServicesList.appendChild(li);
    });
  });
});
