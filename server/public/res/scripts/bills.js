var username = "", token;
var newbill = {title: "", participants: [], payments: []};
var mode = "new";

var token_cookie = Cookie.getCookie("token");
if  (token_cookie != null) {
    let username_req = new XMLHttpRequest();
    username_req.open("POST", "getdata/username");
    username_req.responseType = "json";
    username_req.setRequestHeader("Content-Type", "application/json");
    username_req.addEventListener("load", (ev)=>{
        username = username_req.response.username;
        newbill.participants.push(username);

        //populate to defaults
        populateNewBill();
    });
    username_req.send(JSON.stringify({token: token_cookie.value}));
}
else {
    alert("Session timed out or cookies are disabled. Please login again.");
    window.location = "index.html";
}

function populateNewParticipants() {
    
}

function populateNewPayments() {

}

function populateNewBill() {
    if (mode = "new") {

    }
}