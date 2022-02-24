window.onpopstate = function() {
    
    reset();
 }; history.pushState({}, '');

window.onbeforeunload = confirmExit;
function confirmExit(){
    
    goToHome();
    
    alert("confirm exit is being called");
    //return false;
}

function route(isFile) {
    if (isFile == true) {
        window.sessionStorage.setItem('api_type', 'darkshield-files');
    } else if (isFile == false) {
        window.sessionStorage.setItem('api_type', 'darkshield-base');
    }
    document.getElementById("home-page").style.display = "none";
    document.getElementById("first-page").style.display = "block";
}

function goToHome() {
    reset();
    window.sessionStorage.clear();
    document.getElementById("home-page").style.display = "block";
    document.getElementById("first-page").style.display = "none";
}