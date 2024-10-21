(function () {
    var status = document.getElementById("current-status");

    if (window.location.search.includes("code=")) {
        var code = window.location.search.split("code=")[1];
        status.innerText = "Signing up...";
        fetch("https://api.codename-engine.com/users/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + code
            },
            body: "{}"
        }).then(response => {
            if (response.status == 200) {
                status.innerText = "Signed up!";
                localStorage.setItem("codename-engine-user", JSON.stringify(response.body));
                localStorage.setItem("codename-engine-token", code);
                setTimeout(() => {
                    window.location.href = "https://codename-engine.com/user/";
                }, 1000);
            } else {
                status.innerText = "Something went wrong. Please try again. (" + response.status + " | " + response.body + ")";
            }
        });
    } else {
        status.innerText = "Something went wrong. Please try again. (No code)";
    }
});