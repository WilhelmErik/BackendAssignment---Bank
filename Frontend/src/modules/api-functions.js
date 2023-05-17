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

    sessionStorage.setItem("userID", data._id);

    localStorage.setItem("aJWT", data.aJWT);
    localStorage.setItem("rJWT", data.rJWT);

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

async function getNewToken() {
  const rJWT = localStorage.getItem("rJWT");
  console.log("Requesting a new token");
  try {
    const res = await fetch(baseAPI + "users/token", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${rJWT}`,
      },
    });
    console.log(res, "result of asking for a new token");
    console.log(res.ok, "is res ok ?=");
    if (res.ok) {
      console.log("res is indeed ok !");
      const data = await res.json();
      console.log(data, "should be a token here somewhere");
      localStorage.setItem("aJWT", data.aJWT);
      console.log("new token set ");
    } else {
      console.log("res.ok is not true");
      throw new Error(`HTTP ERROR! Status: ${response.status}:
    ${response.message} `);
    }
  } catch (err) {
    console.error(err);
  }
}

// document.getElementById("submit-account").style.display = "none";
export async function isLoggedIn() {
  if (sessionStorage.getItem("userID")) {
    hideAll();
    document.getElementById("main").style.display = "inherit";

    let accounts = await makeRequest(() =>
      getAccounts(sessionStorage.getItem("userID"))
    );
    // let accounts2 = await accounts.json();
    // console.log(accounts2, "from isloggedin");
    console.log(accounts, "from isloggedin");

    renderAccounts(accounts);
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
  const aJWT = localStorage.getItem("aJWT");
  console.log(aJWT, "access token ");
  let status;
  try {
    const res = await fetch(baseAPI + "accounts/" + id, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aJWT}`,
      },
    });
    console.log(res);
    let data = await res.json();
    if (!res.ok) {
      status = res.status;
      console.log(status);
      throw new Error(`HTTP ERROR! Status: ${res.status} also ${data.message}`);
    }
    console.log(res, "res in accounts");

    console.log(data, "data");
    return data;
  } catch (err) {
    console.log(err, "owell");
    console.log("am i here ");
    return status;
  }
}
function renderAccounts(accounts) {
  console.log(accounts);
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

async function makeRequest(requestFunction) {
  console.log("inside makeRequest");
  try {
    console.log("asda");
    const res = await requestFunction();
    if (res == 403) {
      console.log("SO MANY LOGS");
      throw new Error("Forbidden");
    }
    console.log(res, "eyo");
    return res;
  } catch (err) {
    console.log(err, "first catch error inside makeRequest");
    try {
      console.log("am i here");
      await getNewToken();
      console.log("new token should be set");
      const res = await requestFunction();
      return res;
    } catch (error) {
      console.log(error);
      //..code to log user out
      throw new Error("Unable to refresh token, please login again.");
    }
  }
}
