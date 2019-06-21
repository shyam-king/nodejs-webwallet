var token_cookie = Cookie.getCookie("token");
var username = "", balance = 0, expenses = [];
var expenses_table = document.getElementById("expenses_table");

var addbalance_button = document.getElementById("addbalance_button");
var addexpense_button = document.getElementById("addexpense_button");

var addbalance_form = document.getElementById("addbalance_form");
var addbalance_amount = document.getElementById("addbalance_amount");
var addbalance_add_button = document.getElementById("addbalance_add_button");
var addbalance_cancel_button = document.getElementById("addbalance_cancel_button");
var addbalance_error = document.getElementById("addbalance_error");

var addexpense_form = document.getElementById("addexpense_form");
var addexpense_title = document.getElementById("addexpense_title");
var addexpense_description = document.getElementById("addexpense_description");
var addexpense_amount = document.getElementById("addexpense_amount");
var addexpense_add_button = document.getElementById("addexpense_add_button");
var addexpense_cancel_button = document.getElementById("addexpense_cancel_button");
var addexpense_error = document.getElementById("addexpense_error");

addbalance_button.onclick = function() {
    addbalance_form.style = "display: block;";
    addexpense_form.style = "display: none;";
};

addexpense_button.onclick = function() {
    addbalance_form.style = "display: none;";
    addexpense_form.style = "display: block;";
};

addbalance_cancel_button.onclick = () => {
    addbalance_form.style = "display: none;";
};

addexpense_cancel_button.onclick = () => {
    addexpense_form.style = "display: none;";
};

addbalance_add_button.onclick = () => {
    addbalance_error.innerHTML = "";
    let addbalance_req = new XMLHttpRequest();

    addbalance_req.addEventListener("load", (ev)=>{
        let response = addbalance_req.response;
        if (response.status == 1) {
            balance += Number(addbalance_amount.value);
            document.getElementById("balance").innerHTML = "Balance: Rs " + balance;
            addbalance_error.innerHTML = "Balance incremented!";
            addbalance_amount.value = 0;
        }
        else {
            addbalance_error.innerHTML = response.message;
        }
    });
    
    addbalance_req.open("POST", "addbalance");
    addbalance_req.responseType = "json";
    addbalance_req.setRequestHeader("Content-Type", "application/json");
    addbalance_req.send(JSON.stringify({token: token_cookie.value, amount: addbalance_amount.value}));
};

tokenValidity(token_cookie.value, function(verified) {
    if (verified == false) {
        window.location = "login";
    } 
    else {
        //fetch data
        var fetchData = new XMLHttpRequest();
        
        fetchData.open("POST", "getdata");
        fetchData.addEventListener("load", (ev)=>{
            response = fetchData.response;

            if (response.status == 1) {
                username = response.username;
                balance = response.balance;
                expenses = response.expenses;

                document.getElementById("userinfo").innerHTML = "User: " + username;
                document.getElementById("balance").innerHTML =  "Balance: Rs " + balance;

                populateExpense(expenses);
            }
            else {
                document.getElementById("errormsg").innerHTML = response.message;
            }
        });
        fetchData.responseType = "json";
        fetchData.setRequestHeader("Content-Type", "application/json");
        fetchData.send(JSON.stringify({token: token_cookie.value}));
    }
});

function populateExpense (expenses) {
    expenses.forEach(element => {
        let tr = document.createElement("tr");
        let td = document.createElement("td");
        td.innerHTML = element.timestamp;
        tr.appendChild(td);

        td = document.createElement("td");
        td.innerHTML = element.title;
        tr.appendChild(td);

        td = document.createElement("td");
        td.innerHTML = element.description;
        tr.appendChild(td);

        td = document.createElement("td");
        td.innerHTML = element.amount;
        tr.appendChild(td);

        expenses_table.appendChild(tr);
    });
}