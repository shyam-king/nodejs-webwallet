var token_cookie = Cookie.getCookie("token");
var username = "", balance = 0, expenses = [];
var expenses_table = document.getElementById("expenses_table");
var logout_button = document.getElementById("logout_button");

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

logout_button.onclick = () => {
    let c = new Cookie("token", "");
    Cookie.setCookie(c);
    window.location = "index.html";
};

addexpense_add_button.onclick = () => {
    let title = addexpense_title.value;
    let desc = addexpense_description.value;
    
    let amount = addexpense_amount.value;

    if (amount > balance) {
        addexpense_error.innerHTML = "Insufficent balance!";
        return;
    }

    let addexpense_req = new XMLHttpRequest();
    addexpense_req.open("POST", "addexpense");
    
    addexpense_req.addEventListener("load", (ev)=>{
        let response = addexpense_req.response;
        if (response.status == 1) {
            addexpense_title.value = "";
            addexpense_amount.value = "";
            addexpense_description.value = "";
            addexpense_error.innerHTML = "Expense added successfully";

            populateExpense(response.expenses);

            balance -= amount;
            balance = Math.round(balance * 100) / 100;
            document.getElementById("balance").innerHTML = "Balance: Rs " + balance;
        }
        else {
            addexpense_error.innerHTML = response.message;
        }
    });

    addexpense_req.responseType = "json";
    addexpense_req.setRequestHeader("Content-Type", "application/json");
    addexpense_req.send(JSON.stringify({token: token_cookie.value, title: title, description: desc, amount: amount}));
};  

if (token_cookie != null)
    tokenValidity(token_cookie.value, function(verified) {
        if (verified == false) {
            window.location = "index.html";
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
    expenses_table.innerHTML = "<tr>\
    <th>Time stamp</th>\
    <th>Title</th>\
    <th>Description</th>\
    <th>Amount</th>\
    </tr>";

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