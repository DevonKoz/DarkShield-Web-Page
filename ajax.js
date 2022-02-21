function getElementValue(identifier) {
    var e = document.getElementById(identifier);
    return e.value;
}
function makeElementVisible(identifier) {
    document.getElementById(identifier).style.visibility = "visible";
}
function makeElementInvisible(identifier) {
    document.getElementById(identifier).style.visibility = "hidden";
}


function parseMultipartResponse(bytes) {
    lastSplit = 0;
    sections = [];
    addThis = false;
    for (i = 0; i < bytes.length - 3; i++) {
        if (addThis && bytes[i] == 13 && bytes[i + 1] == 10 && bytes[i + 2] == 45 && bytes[i + 3] == 45) {
            sections.push(Uint8Array.from(bytes.slice(lastSplit + 4, i)));
            lastSplit = i;
            addThis = false;
            continue;
        }
        if (bytes[i] == 13 && bytes[i + 1] == 10 && !addThis) {
            blocal = bytes.slice(lastSplit, i);
            sLocal = String.fromCharCode(...blocal);
            if (sLocal.startsWith("\r\ncontent-transfer-encoding: binary")) {
                addThis = true;
            }
            lastSplit = i;
        }
    }
    return sections;
}

function handleFile(url, result, response, file) {
    let xhr = new XMLHttpRequest();
    // open a connection

    xhr.open("POST", url, true);
    // Create a state change callback
    xhr.onreadystatechange = function () {
        makeElementInvisible("blueLoadSpin")
        response.innerHTML = xhr.status;
        console.log(xhr.status);
        if (xhr.status > 200) {
            var alertBad = document.getElementById("alertBadResponse");
            alertBad.innerHTML = "Bad response from DarkShield API."
            alertBad.style.visibility = "visible";
            var alertGood = document.getElementById("alertGoodResponse");
            alertGood.style.visibility = "hidden";
        }
        else if (xhr.status == 0) {
            var alertBad = document.getElementById("alertBadResponse");
            alertBad.innerHTML = "Could not contact DarkShield API at " + url + "."
            alertBad.style.visibility = "visible";
            var alertGood = document.getElementById("alertGoodResponse");
            alertGood.style.visibility = "hidden";
        }
        else if (xhr.status == 200){
                var alertGood = document.getElementById("alertGoodResponse");
                alertGood.innerHTML = "Successful response from DarkShield API."
                alertGood.style.visibility = "visible";
                var alertBad = document.getElementById("alertBadResponse");
                alertBad.style.visibility = "hidden";
        }
        endPoint = getElementValue("endpoint");
        switch (endPoint) {
            case "searchContext.create":

            case "searchContext.destroy":

            case "maskContext.create":

            case "maskContext.destroy":

            case "searchContext.search":

            case "searchContext.mask":

            case "maskContext.mask":

            case "files/fileSearchContext.create":

            case "files/fileMaskContext.create":

            case "files/fileSearchContext.destroy":
            case "files/fileSearchContext.search":
            case "files/fileMaskContext.destroy":
                result.innerHTML = this.responseText;
                break;
            case "files/fileMaskContext.mask":
            case "files/fileSearchContext.mask":
                parts = parseMultipartResponse(new Uint8Array(xhr.response));
                if (parts.length == 0) {
                    break;
                }
                var maskedFileUrl = URL.createObjectURL(new Blob([parts[1].buffer])); // parts[1] should be the masked file, parts[0] should be the JSON results file.
                var resultsFileUrl = URL.createObjectURL(new Blob([parts[0].buffer])); // parts[1] should be the masked file, parts[0] should be the JSON results file.
                var link = document.createElement("a");
                link.href = maskedFileUrl;
                link.download = "masked_" + file.name;
                link.click()
                link.href = resultsFileUrl;
                link.download = file.name + "_results.json";
                link.click()
                break;
            default:
                break;
        }
    };

    endPoint = getElementValue("endpoint");
    switch (endPoint) {
        case "searchContext.create":

        case "searchContext.destroy":

        case "maskContext.create":

        case "maskContext.destroy":

        case "searchContext.search":

        case "searchContext.mask":

        case "maskContext.mask":

        case "files/fileSearchContext.create":

        case "files/fileMaskContext.create":

        case "files/fileSearchContext.destroy":

        case "files/fileMaskContext.destroy":
            // Set the request header i.e. which type of content you are sending
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(document.getElementById("payloadText").textContent);
            break;
        case "files/fileSearchContext.search":
        case "files/fileMaskContext.mask":
        case "files/fileSearchContext.mask":
            var formData = new FormData();
            formData.append("context", document.getElementById("payloadText").textContent);
            formData.append("file", file);
            if (endPoint != "files/fileSearchContext.search") {
                xhr.responseType = "arraybuffer";
            }
            if (endPoint == "files/fileMaskContext.mask") {
                formData.append("annotations", document.getElementById('annotationFile').files[0]);
            }
            xhr.send(formData);
            break;
        default:
            break;
    }
    makeElementVisible("blueLoadSpin")
}

function sendRequest() {

    let result = document.querySelector('.result');
    let response = document.querySelector('.responseCode');
    // Creating a XHR object
    let url = "http://" + getElementValue("host") + ":" + getElementValue("port") + "/api/darkshield/" + getElementValue("endpoint");
    let files = document.getElementById("formFile").files;
    if (files.length <= 1) {
        handleFile(url, result, response, files[0])
    }
    else if (files.length > 1) {
        for (let i = 0; i < files.length; i++) {
            handleFile(url, result, response, files[i])
        }
    }

}