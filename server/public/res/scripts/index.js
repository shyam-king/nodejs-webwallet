document.getElementById("login_submit").onclick = login;
document.getElementById("create_submit").onclick = createAccount;

function checkSafePassword(pass) {
    var errors = [];
    if (pass.length < 8) {
        errors.push("The password must have at least 8 characters.");
    }
    if (pass.search(/[A-Z]/) < 0) {
        errors.push("The password must have at least one uppercase character.");
    }
    if (pass.search(/[\d]/) < 0) {
        errors.push("The password must have at least one digit");
    }
    if (pass.search(/["'/\\?*]/) >= 0) {
        errors.push("The password contains illegal characters.");
    }
    return errors;
}

function checkSafeUsername(username) {
    var errors = [];
    if (username.length < 8) {
        errors.push("The username must contain at least 8 characters.");
    } 
    if (username.search(/["'/\\?*]/) >= 0) {
        errors.push("The username contains illegal characters.");
    }
    return errors;
}

function login() {
    document.getElementById("login_errors").innerHTML = "";
    document.getElementById("login_message").innerHTML = "";

    let username = document.getElementById("login_username").value;
    let password = document.getElementById("login_password").value;

    if (checkSafePassword(password).length == 0 && checkSafeUsername(username).length == 0) {
        let loginRequest = new XMLHttpRequest();
        loginRequest.addEventListener("load", ev => {
            let response = loginRequest.response;
            if (response.status == 1) {
                //login success
                let d = new Date();
                d.setTime( d.getTime() + 12*60*60*1000);
                let c = new Cookie("token", response.token, d.toUTCString());
                Cookie.setCookie(c);
                window.location = "dashboard.html";
            }
            else {
                document.getElementById("login_message").innerHTML = response.message;
            }
        });
        loginRequest.open("POST", "login");
        loginRequest.setRequestHeader("Content-Type", "application/json");
        loginRequest.responseType = "json";
        loginRequest.send(JSON.stringify({username: username, password: password}));
    } 
    else {
        let pass_errors = checkSafePassword(password);
        let user_errors = checkSafeUsername(username);
        let ul = document.getElementById("login_errors");
        ul.innerHTML = "";
        
        user_errors.forEach(function(value, index, array) {
            let li = document.createElement("li");
            li.innerHTML = value;
            ul.append(li);
        });

        pass_errors.forEach(function(value, index, array) {
            let li = document.createElement("li");
            li.innerHTML = value;
            ul.append(li);
        });
    }
}

function createAccount() {
    let ul = document.getElementById("create_errors");
    ul.innerHTML = "";
    document.getElementById("create_message").innerHTML = "";

    let username = document.getElementById("create_username").value;
    let password = document.getElementById("create_password").value;

    if (checkSafePassword(password).length == 0 && checkSafeUsername(username).length == 0) {
        var createRequest = new XMLHttpRequest();
        createRequest.addEventListener("load", ev => {
            document.getElementById("create_message").innerHTML = createRequest.response.message;
        });
        createRequest.open("POST", "createacc");
        createRequest.setRequestHeader("Content-Type", "application/json");
        createRequest.responseType = "json";
        createRequest.send(JSON.stringify({username: username, password: password}));
    }
    else {
        let user_errors = checkSafeUsername(username);
        let pass_errors = checkSafePassword(password);

        user_errors.forEach(value => {
            let li =document.createElement("li");
            li.innerHTML = value;
            ul.append(li);
        });

        pass_errors.forEach(value => {
            let li =document.createElement("li");
            li.innerHTML = value;
            ul.append(li);
        });
    }
}

var token_c = Cookie.getCookie("token");
if (token_c != null)
tokenValidity(token_c.value, function(verified){
    if (verified == true)
        window.location = "dashboard.html";
});