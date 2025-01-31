const elements = {
  bypassForm: document.getElementById("bypass-form"),
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
    const response = await fetch("/api/bypass/supported");

    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.statusText}`);
    }

    supportedServices = await response.json();
    return supportedServices;
  } catch (e) {
    insertResult(
      "failure",
      `Failed to fetch supported bypass services: ${e.message}`,
    );
    return [];
  }
}

function insertResult(type, message) {
  const li = document.createElement("li");
  li.classList.add(type);
  li.innerHTML = message;
  elements.outputList.prepend(li);
}

function resetForm() {
  elements.bypassForm.reset();
}

function getErrorMessage(message) {
  return Array.isArray(message) ? message[0] : message || "An error occurred";
}

async function onFormSubmit(event) {
  event.preventDefault();

  const url = elements.urlInput.value.trim();

  if (!url) {
    return insertResult("failure", "URL is required");
  }

  try {
    const response = await fetch("/api/bypass", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const data = await response.json();
      insertResult("failure", getErrorMessage(data.message));
    } else {
      const data = await response.json();
      insertResult("success", data.result);
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
  elements.bypassForm.addEventListener("submit", onFormSubmit);
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
