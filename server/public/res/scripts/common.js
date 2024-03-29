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
        let cookiePosition = x.indexOf(name);
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