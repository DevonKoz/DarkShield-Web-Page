window.onpopstate = function() {
    reset();
 }; history.pushState({}, '');

window.onbeforeunload = confirmExit;
function confirmExit(){
    alert("confirm exit is being called");
    reset();
    return false;
}

function route(isFile) {
    if (isFile == true) {
        window.localStorage.setItem('api_type', 'darkshield-files');
    } else {
        window.localStorage.setItem('api_type', 'darkshield-base');
    }
    document.getElementById("home-page").style.display = "none";
    document.getElementById("first-page").style.display = "block";
}

function goToHome() {
    reset();
    document.getElementById("home-page").style.display = "block";
    document.getElementById("first-page").style.display = "none";
}