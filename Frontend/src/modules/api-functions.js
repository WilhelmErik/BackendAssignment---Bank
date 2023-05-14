const baseAPI = "http://localhost:3000/";
const header = { "Content-Type": "application/json" };

export async function authentication(target) {
  let endpoint = target == "login" ? "users/login" : "users";

  try {
    // console.log(elements.Usernamet.value, elements.Pwet.value);
    let username = document.getElementById("username-input");
    let password = document.getElementById("password-input");

    let response = await fetch(baseAPI + endpoint, {
      method: "POST",
      headers: header,
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    console.log(response, "response");
    console.log(response.message, "response.message");
    console.log(response.status, "response.status");
    let data = await response.json();
    console.log(data);
    if (!response.ok) {
      throw new Error(`HTTP ERROR! Status: ${response.status} ping
      ${data.message} pong`);
    }

    sessionStorage.setItem("userID", data.user._id);
    //  let usersID = sessionStorage.getItem("userID");
    document.getElementById("auth-page").style.display = "none";
    document.getElementById("main").style.display = "inherit";

    console.log("Hello there");

    console.log(data);
  } catch (error) {
    console.error(error, "something is very wrong");
  }
}

document.getElementById("add-account").addEventListener("click", () => {
  document.getElementById("account-form").style.display = "inherit";
});
document
  .getElementById("account-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    let accountName = document.getElementById("accountname");
    let balance = document.getElementById("balance");
    let formData = new FormData(e.target);
    let res = await fetch("http://localhost:3000/accounts", {
      method: "POST",
      headers: header,
      body: JSON.stringify({
        accountname: accountName.value,
        balance: balance.value,
        userID: sessionStorage.getItem("userID"),
      }),
    });
    //  let data= res.json()
    //  console.log(data)
    if (res.ok) isLoggedIn();
    console.log(res);
    let data = await res.json();
    console.log(data);

    //   createAccount();
    document.getElementById("account-form").style.display = "none";
  });

// document.getElementById("submit-account").style.display = "none";
export async function isLoggedIn() {
  if (sessionStorage.getItem("userID")) {
    hideAll();
    document.getElementById("main").style.display = "inherit";
    getAccounts(sessionStorage.getItem("userID"));
  } else {
    hideAll();
    document.getElementById("auth-page").style.display = "inherit";
  }
}

export function hideAll() {
  document.getElementById("auth-page").style.display = "none";
  document.getElementById("main").style.display = "none";
  document.getElementById("account-form").style.display = "none";
  // document.getElementById("account-form").style.display = "none";
}

async function getAccounts(id) {
  const res = await fetch(baseAPI + "accounts/" + id);
  console.log(res);
  let data = await res.json();
  console.log(data, "data");
  renderAccounts(data);
}
function renderAccounts(accounts) {
  let userAccounts = document.getElementById("user-accounts");
  userAccounts.innerHTML = "";
  accounts.forEach((account) => {
    console.log(account);
    console.log(account.balance);
    let accountDiv = document.createElement("div");
    userAccounts.append(accountDiv);
    accountDiv.classList.add("account-div");
    // accountDiv.dataset.id = account._id;
    accountDiv.innerHTML = ` 
    <p>Account: ${account.accountname}</p>
    <p>Balance: ${account.balance}$</p>
    `;
    let edit = document.createElement("button");
    let remove = document.createElement("button");
    edit.innerText = "Edit";
    remove.innerText = "Remove";
    accountDiv.append(edit);
    accountDiv.append(remove);

    remove.classList.add("remove-button");
    edit.classList.add("edit-button");

    // remove.addEventListener("click", async (e) => {
    //   console.log(e.target.tagName);
    //   const res = await fetch(baseAPI + "accounts/" + account._id, {
    //     method: "DELETE",
    //     headers: header,
    //   });
    //   console.log(res);
    //   let data = await res.json();
    //   console.log(data);
    // });

    accountButtonListener(accountDiv, account);
  });
}

document.getElementById("account-div");

async function accountButtonListener(accountDiv, account) {
  const removeButton = accountDiv.querySelector(".remove-button");
  const editButton = accountDiv.querySelector(".edit-button");

  removeButton.addEventListener("click", async (e) => {
    const res = await fetch(baseAPI + "accounts/" + account._id, {
      method: "DELETE",
      headers: header,
    });

    console.log(res, "result");
    if (res.ok) {
      accountDiv.remove();
    }
    let data = await res.json();
    console.log(data);
  });
  //   editButton.addEventListener("click", async (e) => {
  //     const res = await fetch(baseAPI + "accounts/" + account._id, {
  //       method: "PATCH",
  //       headers: header,
  //       body: JSON.stringify({
  //         balance:
  //       })
  //     });

  //     console.log(res);
  //     let data = await res.json();
  //     console.log(data);
  //   });
}
