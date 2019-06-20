var token_cookie = Cookie.getCookie("token");
var username = "", balance = 0, expenses = [];
var expenses_table = document.getElementById("expenses_table");

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

                document.getElementById("userinfo").innerHTML = "User: " + username + " Balance = Rs " + balance;

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
            else {
                document.getElementById("errormsg").innerHTML = response.message;
            }
        });
        fetchData.responseType = "json";
        fetchData.setRequestHeader("Content-Type", "application/json");
        fetchData.send(JSON.stringify({token: token_cookie.value}));
    }
});

