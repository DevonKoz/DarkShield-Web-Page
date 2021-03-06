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

function handleFile(url, file, end_point) {
    let xhr = new XMLHttpRequest();
    // open a connection

    xhr.open("POST", url, true);
    // Create a state change callback
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            makeElementInvisible("blueLoadSpin")
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
            else if (xhr.status == 200) {
                var alertGood = document.getElementById("alertGoodResponse");
                alertGood.innerHTML = "Successful response from DarkShield API."
                alertGood.style.visibility = "visible";
                var alertBad = document.getElementById("alertBadResponse");
                alertBad.style.visibility = "hidden";
            }
            switch (end_point) {
                case "searchContext.create":

                case "searchContext.destroy":

                case "maskContext.create":

                case "maskContext.destroy":

                case "searchContext.search":

                case "maskContext.mask":

                case "files/fileSearchContext.create":

                case "files/fileMaskContext.create":

                case "files/fileSearchContext.destroy":
                case "files/fileSearchContext.search":
                case "files/fileMaskContext.destroy":
                    break;
                case "files/fileMaskContext.mask":
                case "files/fileSearchContext.mask":
                    
                    parts = parseMultipartResponse(new Uint8Array(xhr.response));
                    if (parts.length == 0) {
                        break;
                    }
                    var resultsBlob = new Blob([parts[0].buffer]);
                    let maskedFileUrl = URL.createObjectURL(new Blob([parts[1].buffer])); // parts[1] should be the masked file, parts[0] should be the JSON results file.
                    let resultsFileUrl = URL.createObjectURL(resultsBlob); // parts[1] should be the masked file, parts[0] should be the JSON results file.
                    

                    
                    let link = document.createElement("a");
                    link.href = maskedFileUrl;
                    link.download = "masked_" + file.name;
                    link.click();
                    link.href = resultsFileUrl;
                    str = file.name;
                    str = str.substring(0, str.indexOf("."));
                    link.download = str + "_results.json";
                    link.click();
                    break;
                case "searchContext.mask":
                    const obj = JSON.parse(xhr.response);
                    let linkText = document.createElement("a");
                    let maskedTextUrl = URL.createObjectURL(new Blob([obj.maskedText], {type: "text/plain"}));
                    linkText.href = maskedTextUrl;
                    linkText.download = "masked_" + "text.txt";
                    linkText.click();
                    let resultsTextUrl = URL.createObjectURL(new Blob([xhr.responseText], {type: "application/json"}));
                    linkText.href = resultsTextUrl;
                    linkText.download = "results.json";
                    linkText.click();
                    break;
                default:
                    break;
            }
        }

    };

    switch (end_point) {
        case "searchContext.create":

        case "searchContext.destroy":

        case "maskContext.create":

        case "maskContext.destroy":

        case "searchContext.search":

        case "maskContext.mask":

        case "files/fileSearchContext.create":

        case "files/fileMaskContext.create":

        case "files/fileSearchContext.destroy":

        case "files/fileMaskContext.destroy":
            // Set the request header i.e. which type of content you are sending
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(document.getElementById("payloadText").value);
            break;
        case "files/fileSearchContext.search":
        case "files/fileMaskContext.mask":
        case "files/fileSearchContext.mask":

            var formData = new FormData();
            formData.append("context", document.getElementById("payloadText").value);
            formData.append("file", file);
            if (end_point != "files/fileSearchContext.search") {
                xhr.responseType = "arraybuffer";
            }
            if (end_point == "files/fileMaskContext.mask") {
                formData.append("annotations", document.getElementById('annotationFile').files[0]);
            }
            xhr.send(formData);
            break;
        case "searchContext.mask":
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(document.getElementById("payloadText").value);
            break;
        default:
            break;
    }
    makeElementVisible("blueLoadSpin")
}

function sendRequest(end_point) {
    // Creating a XHR object
    let url = "http://" + getElementValue("host") + ":" + getElementValue("port") + "/api/darkshield/" + end_point;
    let text = document.getElementById("textForBaseAPI").value;
    let files = document.getElementById("formFile").files;
    if (window.sessionStorage.getItem('api_type') == "darkshield-base") {
        handleFile(url, text, end_point);
    } else if (window.sessionStorage.getItem('api_type') == "darkshield-files") {
        if (files.length <= 1) {
            handleFile(url, files[0], end_point)
        }
        else if (files.length > 1) {
            for (let i = 0; i < files.length; i++) {
                handleFile(url, files[i], end_point)
            }
        }
    } else {
        reset();
    }
}