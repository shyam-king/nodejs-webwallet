var token_cookie = Cookie.getCookie("token");
tokenValidity(token_cookie.value, function(verified) {
    if (verified == false) {
        window.location = "login";
    }
});