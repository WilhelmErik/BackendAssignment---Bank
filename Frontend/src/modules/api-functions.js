const baseAPI = "http://localhost:3000/";
const header = { "Content-Type": "application/json" };

// An auth function that servers to both login and register depending on the argument rom the event listener
export async function authentication(target) {
  let endpoint = target == "login" ? "users/login" : "users";

  try {
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
    let data = await response.json();
    console.log(data);
    // Will alert the message, which will be username exist since thats the only res error in the backend currently
    if (response.status == 400) {
      alert(data.message + ": " + data.name);
    }
    if (!response.ok) {
      throw new Error(`HTTP ERROR! Status: ${response.status} ping
      ${data.message} pong`);
    }
    // If a user successfully logged in, not registered
    if (endpoint !== "users") {
      localStorage.setItem("userID", data._id);
      localStorage.setItem("aJWT", data.aJWT);
      localStorage.setItem("rJWT", data.rJWT);
      document.getElementById("auth-page").style.display = "none";
      document.getElementById("main").style.display = "inherit";
    } else if (endpoint === "users") {
      alert("account successfully created, please login");
    }

    console.log("Hello there");
    isLoggedIn();
  } catch (error) {
    console.error(error, "something is very wrong");
  }
}

document.getElementById("add-account").addEventListener("click", () => {
  document.getElementById("account-form").style.display = "inherit";
});

// creating an account, not a function currently
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
        userID: localStorage.getItem("userID"),
      }),
    });

    if (res.ok) isLoggedIn();
    console.log(res);
    let data = await res.json();
    console.log(data);

    document.getElementById("account-form").style.display = "none";
  });
// Function that will get called and retrieve and set a new token should the current access token be expired or not exist
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

    if (res.ok) {
      const data = await res.json();
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
  console.log("isloggedin being called");
  if (localStorage.getItem("userID")) {
    console.log("user id exists ?");
    hideAll();
    document.getElementById("main").style.display = "inherit";

    let accounts = await makeRequest(() =>
      getAccounts(localStorage.getItem("userID"))
    );
    renderAccounts(accounts);
  } else {
    console.log("No user id ");
    hideAll();
    document.getElementById("auth-page").style.display = "inherit";
  }
}

export async function logout() {
  const aJWT = localStorage.getItem("aJWT");
  try {
    const res = await fetch(baseAPI + "users/logout", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aJWT}`,
      },
    });
    if (res.ok) {
      console.log(res);

      localStorage.removeItem("rJWT");
      localStorage.removeItem("aJWT");
      localStorage.removeItem("userID");
      isLoggedIn();
    } else {
      data = await res.json();
      console.log(data.message);
    }
  } catch (err) {
    console.log(err);
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
  let status;
  try {
    const res = await fetch(baseAPI + "accounts/" + id, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aJWT}`,
      },
    });
    let data = await res.json();
    if (!res.ok) {
      status = res.status;
      throw new Error(`HTTP ERROR! Status: ${res.status} also ${data.message}`);
    }
    const accounts = data.map(
      (account) =>
        new Account(account._id, account.accountname, account.balance)
    );
    return accounts;
  } catch (err) {
    return status;
  }
}
function renderAccounts(accounts) {
  let userAccounts = document.getElementById("user-accounts");
  userAccounts.innerHTML = "";
  accounts.forEach((account) => {
    let accountDiv = document.createElement("div");
    userAccounts.append(accountDiv);
    accountDiv.classList.add("account-div");
    // accountDiv.dataset.id = account._id;
    accountDiv.innerHTML = ` 
    <h2>Account name: ${account.name}</h2>
    <h2>Account number: ${account.id}</h2>
    <h3>Balance: ${account.balance} $</h3>

    <div class="account-buttons">
<button class="withdraw-button"> Withdraw </button>
<input type="number"class="withdraw-input hidden" "/>
<button class="save-withdraw withdraw hidden">Save</button>
</div>
<div class="account-buttons">

<button class="deposit-button"> Deposit </button>
<input type="number"class="deposit-input hidden" />
<button class="save-dep hidden">Save</button>

    </div>
    <button class="delete-button"> Delete </button>

    <div>

    </div>
    `;

    accountButtonListeners(accountDiv, account);
  });
}

document.getElementById("account-div");

async function accountButtonListeners(accountDiv, account) {
  const withdrawButton = accountDiv.querySelector(".withdraw-button");
  const saveWithdraw = accountDiv.querySelector(".save-withdraw");
  const depositButton = accountDiv.querySelector(".deposit-button");
  const saveDeposit = accountDiv.querySelector(".save-dep");

  const depositInput = accountDiv.querySelector(".deposit-input");
  const withdrawInput = accountDiv.querySelector(".withdraw-input");

  const saveDelete = accountDiv.querySelector(".delete-button");

  //________________________Delete account________________________________
  saveDelete.addEventListener("click", async (e) => {
    let changed = await makeRequest(() => {
      return account.delete();
    });
    if (changed == 200) {
      isLoggedIn();
    }
    // const aJWT = localStorage.getItem("aJWT");
    // const res = await fetch(baseAPI + "accounts/" + account.id, {
    //   method: "DELETE",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${aJWT}`,
    //   },
    // });
    // if (res.ok) {
    //   accountDiv.remove();
    //   isLoggedIn();
    // }
    // console.log(res);
    // return res
    // let data = await res.json();
  });
  //_____________________________________________________________
  //__________________________Display Withdraw__________________________
  withdrawButton.addEventListener("click", () => {
    saveWithdraw.classList.toggle("hidden");
    withdrawInput.classList.toggle("hidden");
  });
  //_________________________________________________________________

  //__________________________Save Withdraw__________________________
  saveWithdraw.addEventListener("click", async () => {
    let changed = await makeRequest(() => {
      return account.withdraw(withdrawInput.value);
    });
    if (changed == 200) {
      isLoggedIn();
    }
  });
  //_________________________________________________________________
  //__________________________Display Deposit__________________________
  depositButton.addEventListener("click", () => {
    saveDeposit.classList.toggle("hidden");
    depositInput.classList.toggle("hidden");
  });
  //_________________________________________________________________
  //__________________________Save Deposit__________________________

  saveDeposit.addEventListener("click", async () => {
    let changed = await makeRequest(() => {
      return account.deposit(depositInput.value);
    });
    if (changed == 200) {
      isLoggedIn();
    }
  });
  //_________________________________________________________________
}

async function makeRequest(requestFunction) {
  let status;
  try {
    let res = await requestFunction();
    if (res == 403) {
      status = 403;
      console.log("SO MANY LOGS");
      throw new Error("Forbidden", res);
    }
    console.log(res, "eyo");

    return res;
  } catch (err) {
    console.log(err, "first catch error inside makeRequest");
    if (status == 403)
      try {
        await getNewToken();
        const res = await requestFunction();
        console.log(res, "2nd try");
        return res;
      } catch (error) {
        console.log(error);
        //..code to log user out
        throw new Error("Unable to refresh token, please login again.");
      }
  }
}

// will try to make a class for convenience sake

class Account {
  constructor(id, name, balance) {
    Object.assign(this, { id, name, balance: Number(balance) });
  }

  async deposit(amount) {
    const aJWT = localStorage.getItem("aJWT");
    this.balance += +amount;

    try {
      const res = await fetch(baseAPI + "accounts/" + this.id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aJWT}`,
        },
        body: JSON.stringify({ balance: this.balance }),
      });
      return res.status;
    } catch (err) {
      console.log(err);
    }
  }
  //--------
  //--------

  async withdraw(amount) {
    const aJWT = localStorage.getItem("aJWT");
    if (+amount > this.balance) {
      alert("you cant withdraw more than you have !");
      throw new Error("Insufficient funds");
    }
    this.balance -= +amount;

    try {
      const res = await fetch(baseAPI + "accounts/" + this.id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aJWT}`,
        },
        body: JSON.stringify({ balance: this.balance }),
      });
      return res.status;
    } catch (err) {
      console.log(err);
    }
  }
  //--------
  //--------
  //--------
  async delete() {
    const aJWT = localStorage.getItem("aJWT");
    try {
      const res = await fetch(baseAPI + "accounts/" + this.id, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aJWT}`,
        },
      });
      console.log(res);
      return res.status;
    } catch (err) {}
  }

  //--------
  //--------
  //--------
  //--------
  //--------
}
