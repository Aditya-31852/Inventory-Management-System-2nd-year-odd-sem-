const USERS_KEY = "stockroom_users";
const SESSION_KEY = "stockroom_session";

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
const saveUsers = users => localStorage.setItem(USERS_KEY, JSON.stringify(users));

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const register = tab.dataset.tab === "register";
    document.getElementById("loginForm").classList.toggle("hidden", register);
    document.getElementById("registerForm").classList.toggle("hidden", !register);
  });
});

document.getElementById("registerForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = regName.value.trim();
  const email = regEmail.value.trim().toLowerCase();
  const password = regPassword.value;
  const users = getUsers();

  if (users.some(u => u.email === email)) {
    registerMsg.textContent = "An account with this email already exists.";
    return;
  }
  users.push({ id: crypto.randomUUID(), name, email, password });
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name, email }));
  location.href = "home.html";
});

document.getElementById("loginForm").addEventListener("submit", e => {
  e.preventDefault();
  const email = loginEmail.value.trim().toLowerCase();
  const password = loginPassword.value;
  const user = getUsers().find(u => u.email === email && u.password === password);

  if (!user) {
    loginMsg.textContent = "Invalid email or password.";
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));
  location.href = "home.html";
});

// Seed a demo account for first-time testing.
if (getUsers().length === 0) {
  saveUsers([{id:"demo", name:"Demo User", email:"demo@stockroom.local", password:"demo123"}]);
}