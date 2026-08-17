const SESSION_KEY = "login-demo-session";

function readSession() {
  const savedSession =
    sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);

  if (!savedSession) return null;

  try {
    return JSON.parse(savedSession);
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

const session = readSession();

if (!session?.username) {
  window.location.replace("index.html");
} else {
  document.getElementById("welcome-message").textContent =
    `Welcome, ${session.username}.`;

  document.getElementById("logout-button").addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    window.location.replace("index.html");
  });
}
