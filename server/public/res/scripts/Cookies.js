class Cookie {
    constructor(name, value, expiry) {
        this.name = name;
        this.value = value;
        this.expiry = expiry;
    }

    static getCookie(name) {
        var x = document.cookie;
        console.log(x);
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