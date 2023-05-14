// html for logging in / registering
// html for main page i suppose, where you can view accounts
import { authentication, isLoggedIn } from "./modules/api-functions.js";
// i want a button to add more accounts, which should show me a form where i can decide on the name and the amount i want to deposit

isLoggedIn();
document.getElementById("display-login").addEventListener("click", (e) => {
  document.getElementById("mail-div").style.display = "none";
  document.getElementById("submit-login").style.display = "inherit";
  document.getElementById("submit-register").style.display = "none";
});

document.getElementById("display-register").addEventListener("click", (e) => {
  // document.getElementById("mail-div").style.display = "inherit";
  document.getElementById("submit-login").style.display = "none";
  document.getElementById("submit-register").style.display = "inherit";
});

document.getElementById("submit-login").addEventListener("click", (e) => {
  authentication("login");
});

document.getElementById("submit-register").addEventListener("click", (e) => {
  authentication("register");
});

document.getElementById("logout").addEventListener("click", (e) => {
  logout();
});

async function logout() {
  sessionStorage.removeItem("userID");
  isLoggedIn();
}
