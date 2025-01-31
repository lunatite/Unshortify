const bypassForm = document.getElementById("bypass-form");
const urlInput = document.getElementById("url-input");
const clearBtn = document.getElementById("clear-btn");
const outputList = document.getElementById("output-list");

function insertFailureResult(result) {
  const li = document.createElement("li");
  li.classList.add("failure");
  li.innerHTML = result;

  outputList.prepend(li);
}

function insertSuccessResult(result) {
  const li = document.createElement("li");
  li.classList.add("success");
  li.innerHTML = result;
  outputList.prepend(li);
}

function resetForm() {
  bypassForm.reset();
}

function getErrorMessage(message) {
  return Array.isArray(message) ? message[0] : message || "An error occurred";
}

async function onFormSubmit(event) {
  event.preventDefault();

  const url = urlInput.value.trim();

  if (!url) {
    return insertFailureResult("URL is required");
  }

  try {
    const response = await fetch("/api/bypass", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    response.ok
      ? insertSuccessResult(data.result)
      : insertFailureResult(getErrorMessage(data.message));
  } catch (e) {
    insertFailureResult(e.message);
  }

  resetForm();
}

function onClearButtonClick() {
  resetForm();
}

window.addEventListener("DOMContentLoaded", () => {
  bypassForm.addEventListener("submit", onFormSubmit);
  clearBtn.addEventListener("click", onClearButtonClick);
});
