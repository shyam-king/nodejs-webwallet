var username = "", token;
var newbill = {title: "", participants: [], payments: []};
var mode = "idle";

var newbill_addparticipant_button = document.getElementById("newbill_addparticipant_button");
var newbill_participant = document.getElementById("newbill_participant");
var newbill_amount = document.getElementById("newbill_amount");
var newbill_paidby = document.getElementById("newbill_paidby");
var newbill_addpayment_button = document.getElementById("newbill_addpayment_button");
var newbill_payment_title = document.getElementById("newbill_payment_title");

var newbill_submit_button = document.getElementById("newbill_submit_button");
var newbill_cancel_button = document.getElementById("newbill_cancel_button");

var addbill_button = document.getElementById("addbill_button");

var token_cookie = Cookie.getCookie("token");
if  (token_cookie != null) {
    let username_req = new XMLHttpRequest();
    username_req.open("POST", "getdata/username");
    username_req.responseType = "json";
    username_req.setRequestHeader("Content-Type", "application/json");
    username_req.addEventListener("load", (ev)=>{
        username = username_req.response.username;
    });
    username_req.send(JSON.stringify({token: token_cookie.value}));
}
else {
    alert("Session timed out or cookies are disabled. Please login again.");
    window.location = "index.html";
}

function populateNewParticipants() {
    let participants_list = document.getElementById("newbill_participants_list");
    participants_list.innerHTML = "";
    if (newbill.participants.length > 0) {
        newbill.participants.forEach(value=>{
            let li = document.createElement("li");
            li.innerHTML = value;
            participants_list.appendChild(li);
        });
    }
    else {
        participants_list.innerHTML = "<li>None</li>";
    }
}

function populateNewPayments() {
    let payments_list = document.getElementById("newbill_payments_list");
    payments_list.innerHTML = "";

    if (newbill.payments.length > 0) {
        newbill.payments.forEach((value, index)=>{
            let li = document.createElement("li");
            let title = document.createElement("h4");
            title.innerHTML = value.title;
            li.appendChild(title);
            let p = document.createElement("label");
            p.innerHTML = "Paid by " + value.paidby;
            li.appendChild(p);
            li.appendChild(document.createElement("br"));
            let a = document.createElement("label");
            a.innerHTML = "Amount: " + value.amount;
            li.appendChild(a);
            li.appendChild(document.createElement("br"));
            let delButton = document.createElement("button");
            delButton.innerHTML = "Delete";
            delButton.setAttribute("data-paymentindex", index);
            delButton.addEventListener("click", ev=>{
                let i = Number(ev.target.getAttribute("data-paymentindex"));
                newbill.payments.splice(i, 1);
                populateNewPayments();
            });
            li.appendChild(delButton);
            payments_list.appendChild(li);
        });
    }
    else {
        payments_list.innerHTML = "<li>None</li>";
    }
}

function populateNewBill() {
    if (mode == "new") {
        populateNewParticipants();
        populateNewPayments();
    }
}

newbill_addparticipant_button.onclick = (ev) => {
    let p = newbill_participant.value;
    if (newbill.participants.indexOf(p) >= 0) {
        alert("The participant has already been added!");
    }
    else {
        if (checkSafeUsername(p).length == 0) {
            let checkReq = new XMLHttpRequest();
            checkReq.open("POST", "checkusername");
            checkReq.setRequestHeader("Content-Type", "application/json");
            checkReq.responseType = "json";
            checkReq.addEventListener("load", (ev)=>{
                let response = checkReq.response;
                if (response.status == 1) {
                    if (response.verified == false) {
                        alert("The user was not found in our database. Kindly recheck the username.");
                    }
                    else {
                        newbill.participants.push(p);
                        populateNewParticipants();
                        alert("Participant added!");
                        newbill_participant.value = "";
                    }
                }
                else {
                    alert(response.message);
                }
            });
            checkReq.send(JSON.stringify({username: p}));
        } 
        else {
            alert("Enter valid username as participant!\n" + checkSafeUsername(p).join("\n"));
        }
    }
};

newbill_addpayment_button.onclick = (ev) => {
    let amount = Number(newbill_amount.value);
    let errors = [];

    if (amount < 0) {
        errors.push("Amount cannot be negative!");
    }

    if (newbill.participants.indexOf(newbill_paidby.value) < 0) {
        errors.push("The payment must be made by a participant!");
    }

    if (newbill_payment_title.value == "") {
        errors.push("The title cannot be empty!");
    }

    if (errors.length == 0) {
        newbill.payments.push({amount: amount, paidby: newbill_paidby.value, title: newbill_payment_title.value});
        errors.push("Payment added successfully!");
        newbill_paidby.value = "";
        newbill_amount.value = "0";
        newbill_payment_title.value = "";
        populateNewPayments();
    }

    alert(errors.join("\n"));
};

newbill_submit_button.onclick = (ev) => {
    let errors = [];
    let title = document.getElementById("newbill_title").value;

    if (title == "") {
        errors.push("Title cannot be empty!");
    }

    if (errors.length == 0) {
        newbill.title = title;
        errors.push("Bill saved!");
        mode ="idle";
        document.getElementById("newbill_form").style = "display:none;";
    }

    if (errors.length > 0)
        alert(errors.join("\n"));
};  

addbill_button.onclick = (ev) => {
    mode = "new";
    newbill = {title: "", participants: [username], payments: []};
    document.getElementById("newbill_form").style = "display: block;";
    document.getElementById("newbill_title").value = "";
    populateNewBill();
}

newbill_cancel_button.onclick = (ev) => {
    mode = "idle";
    document.getElementById("newbill_form").style = "display:none;";
};