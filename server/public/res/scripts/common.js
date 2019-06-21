function tokenValidity(token, callback) {
    let tokenRequest = new XMLHttpRequest();
    tokenRequest.addEventListener("load", ev => {
        if (tokenRequest.response.status == 1 && tokenRequest.response.verified == true) {
            callback(true);
        }
        else callback(false);
    });
    tokenRequest.open("POST", "verifytoken");
    tokenRequest.responseType = "json";
    tokenRequest.setRequestHeader("Content-Type", "application/json");
    tokenRequest.send(JSON.stringify({token: token}));
}

class Cookie {
    constructor(name, value, expiry) {
        this.name = name;
        this.value = value;
        this.expiry = expiry;
    }

    static getCookie(name) {
        var x = document.cookie;
        let cookiePosition = - name.length;
        do{
            cookiePosition = x.indexOf(name, cookiePosition + name.length);
        } while (x.charAt(cookiePosition+name.length) != "=" && cookiePosition >= 0);
        if (cookiePosition < 0) {
            return null;
        }
        var cookie = new Cookie("", "");
        let valuePos = cookiePosition + name.length+1;
        let valueLen = x.indexOf(";", valuePos) - valuePos;
        let value;
        if (valueLen < 0) {
            value = x.substr(valuePos);
        }
        else {
            value = x.substr(valuePos, valueLen);
        }
        cookie.name = name;
        cookie.value = value;

        if (cookie.value == '')
            return null;
        return cookie;
    }

    static setCookie(c) {
        if (c.expiry == undefined)
            document.cookie = c.name + "=" + c.value + "; path=/";
        else {
            document.cookie = c.name + "=" + c.value + "; expires=" + c.expiry + "; path=/";
        }
    }
};
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