function login(e){
    e.preventDefault();
    document.getElementById("error").innerText = '';
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    var xhr = new XMLHttpRequest();
    var url = '/api/login';
    var data = new FormData();
    data.append('email', email);
    data.append('password', password);
    xhr.open('POST', url, true);
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            var res = JSON.parse(xhr.responseText);
            if(res.success){
                localStorage.setItem('token',res.token);
                window.location.href = '/';
            } else {
                document.getElementById("error").innerText = res.message;
            }
        }
    }
    xhr.send(data);
}