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
    let data = await response.json();
    console.log(data);
    if (!response.ok) {
      throw new Error(`HTTP ERROR! Status: ${response.status} ping
      ${data.message} pong`);
    }
    if (endpoint !== "users") {
      sessionStorage.setItem("userID", data._id);
      localStorage.setItem("aJWT", data.aJWT);
      localStorage.setItem("rJWT", data.rJWT);
      document.getElementById("auth-page").style.display = "none";
      document.getElementById("main").style.display = "inherit";
    } else if (endpoint === "users") {
      alert("account successfully created, please login");
    }

    //  let usersID = sessionStorage.getItem("userID");

    console.log("Hello there");
    isLoggedIn();
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
    const accounts = data.map(
      (account) =>
        new Account(account._id, account.accountname, account.balance)
    );
    console.log(accounts, "these should be classes");
    return accounts;
  } catch (err) {
    return status;
  }
}
function renderAccounts(accounts) {
  console.log(accounts, "accounts from renderAcocunts");
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
    <h2>Account: ${account.name}</h2>
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
    console.log("events?");
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
    const aJWT = localStorage.getItem("aJWT");
    console.log(account.id);
    const res = await fetch(baseAPI + "accounts/" + account.id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aJWT}`,
      },
    });

    console.log(res, "result");
    if (res.ok) {
      accountDiv.remove();
      isLoggedIn();
    }
    let data = await res.json();
    console.log(data);
  });
  //_____________________________________________________________
  //__________________________Display Withdraw__________________________
  withdrawButton.addEventListener("click", () => {
    console.log(account);
    saveWithdraw.classList.toggle("hidden");
    withdrawInput.classList.toggle("hidden");
  });
  //_________________________________________________________________

  //__________________________Save Withdraw__________________________
  saveWithdraw.addEventListener("click", async () => {
    console.log("Will withdraw");
    let changed = await makeRequest(() => {
      return account.withdraw(withdrawInput.value);
    });
    if (changed == 200) {
      isLoggedIn();
    }
    console.log(changed);
    console.log("withdrawed");
  });
  //_________________________________________________________________
  //__________________________Display Deposit__________________________
  depositButton.addEventListener("click", () => {
    console.log(account, "what do we have here , display");
    saveDeposit.classList.toggle("hidden");
    depositInput.classList.toggle("hidden");
    console.log(depositInput.value);
  });
  //_________________________________________________________________
  //__________________________Save Deposit__________________________

  saveDeposit.addEventListener("click", async () => {
    console.log("Will deposit");
    let changed = await makeRequest(() => {
      return account.deposit(depositInput.value);
    });
    if (changed == 200) {
      isLoggedIn();
    }
    console.log(changed);
    console.log("deposited");
  });
  //_________________________________________________________________
}

async function makeRequest(requestFunction) {
  console.log("inside makeRequest");
  let status;
  try {
    console.log("asda");
    let res = await requestFunction();
    console.log(res);
    if (res == 403) {
      status = 403;
      console.log("SO MANY LOGS");
      throw new Error("Forbidden", res);
    }
    console.log(res, "eyo");
    console.log(typeof res);

    return res;
  } catch (err) {
    console.log(err, "first catch error inside makeRequest");
    console.log(status);
    if (status == 403)
      try {
        console.log("am i here");
        await getNewToken();
        console.log("new token should be set");
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

      console.log(res, "sigh");
      console.log(res.status);
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
      console.log(res, "in withdraw");
      return res.status;
    } catch (err) {
      console.log(err);
    }
  }
  //--------
  //--------
  //--------
  async delete() {
    await makeRequest(() => {
      try {
        fetch(baseAPI + "accounts/" + this.id, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${aJWT}`,
          },
        });
      } catch (err) {}
    });
  }
  //--------
  //--------
  //--------
  //--------
  //--------
}
