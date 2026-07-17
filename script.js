const VALID_CREDENTIALS = {
  username: "admin@example.com",
  password: "Password123",
};
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const submitButton = document.getElementById("login-button");
const errorMessage = document.getElementById("error-message");
const resultDisplay = document.getElementById("result");
const togglePasswordButton = document.getElementById("toggle-password");

function updateSubmitState() {
  submitButton.disabled = !usernameInput.value.trim() || !passwordInput.value;
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add("visible");
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.classList.remove("visible");
}

usernameInput.addEventListener("input", updateSubmitState);
passwordInput.addEventListener("input", updateSubmitState);

togglePasswordButton.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  togglePasswordButton.textContent = isPassword ? "Hide" : "Show";
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();
  resultDisplay.textContent = "";

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username) {
    showError("Username or email cannot be blank.");
    return;
  }

  if (!password) {
    showError("Password cannot be blank.");
    return;
  }

  if (password.length < 8) {
    showError("Password must be at least 8 characters.");
    return;
  }

  if (
    username.toLowerCase() !== VALID_CREDENTIALS.username.toLowerCase() ||
    password !== VALID_CREDENTIALS.password
  ) {
    showError("Invalid username or password.");
    return;
  }

  resultDisplay.textContent = "Login successful";
});

updateSubmitState();
