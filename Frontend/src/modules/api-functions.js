const baseAPI = "http://localhost:3000/";
const header = { "Content-Type": "application/json" };

export async function authentication(target) {
  let endpoint = target == "login" ? "users/login" : "users";

  try {
    // console.log(elements.Usernamet.value, elements.Pwet.value);
    let username = document.getElementById("username-input");
    let password = document.getElementById("password-input");
    console.log(username.value);
    console.log(password.value);
    let response = await fetch(baseAPI + endpoint, {
      method: "POST",
      headers: header,
      body: JSON.stringify({
        name: username.value,
        password: password.value,
      }),
    });
    console.log(response.message);
    console.log(response.status);
    let data = await response.json();
    console.log(data);

    // if (data.message)
      // console.log(data.user.id, "paus");

      // sessionStorage.setItem("userID", data.user.id);
      // sessionStorage.setItem("token", data.jwt);

      // console.log(sessionStorage.getItem("token"), "Ett token");

      // let userRes = await fetch("http://localhost:1337/api/users/me", {
      //   method: "GET",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${data.jwt}`,
      //   },
      // });

      // let userData = await getActiveUser();
      // console.log(userData, "data2");

      // clearInput();
      // // alert("welcome");
      // hideAll();
      // isLoggedIn();
      // renderIndex();

      console.log(data.user.name, " is logged in ");
  } catch (error) {
    console.error(error, "something is very wrong");
  }
}
