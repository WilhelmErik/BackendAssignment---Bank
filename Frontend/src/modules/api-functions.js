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
  //_____________________________________________________________
  //__________________________Display Withdraw__________________________
  withdrawButton.addEventListener("click", () => {
    console.log(account);
    saveWithdraw.classList.toggle("hidden");
    withdrawInput.classList.toggle("hidden");
  });

  //__________________________Save Withdraw__________________________

  

  //__________________________Display Deposit__________________________
  depositButton.addEventListener("click", () => {
    console.log(account);
    saveDeposit.classList.toggle("hidden");
    depositInput.classList.toggle("hidden");
  });

  //__________________________Save Deposit__________________________
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

// will try to make a class for convenience sake

class Account {
  constructor(id, name, balance) {
    Object.assign(this, { id, name, balance });
  }

  async deposit(amount) {
    this.balance += amount;
    await makeRequest(async () => {
      try {
        const res = fetch(baseAPI + "accounts/" + this.id, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${aJWT}`,
          },
          body: JSON.stringify({ balance: this.balance }),
        });
        return res;
      } catch (err) {
        console.log(err);
      }
    });
  }
  //--------
  //--------

  async withdraw(amount) {
    if (amount > this.balance) {
      throw new Error("Insufficient funds");
    }
    this.balance -= amount;
    await makeRequest(() => {
      try {
        fetch(baseAPI + "accounts/" + this.id, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${aJWT}`,
          },
          body: JSON.stringify({ balance: this.balance }),
        });
      } catch (err) {}
    });
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
