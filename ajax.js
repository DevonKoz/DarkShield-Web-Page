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
    console.log(bytes)
    let utf8Encode = new TextEncoder();
    //bytesec = utf8Encode.encode(bytes)
    console.log(bytes)
    console.log(bytes.length)
    for (i = 0; i < bytes.length - 3; i++) {
        if (addThis && bytes[i] == 13 && bytes[i + 1] == 10 && bytes[i + 2] == 45 && bytes[i + 3] == 45) {
            sections.push(Uint8Array.from(bytes.slice(lastSplit + 4, i)));
            lastSplit = i;
            addThis = false;
            continue;
        }
        if (bytes[i] == 13 && bytes[i + 1] == 10 && !addThis) {
            console.log("line29")
            blocal = bytes.slice(lastSplit, i);
            sLocal = String.fromCharCode(...blocal);
            console.log(sLocal)
            if (sLocal.startsWith("\r\ncontent-transfer-encoding: binary")) {
                addThis = true;
            }
            lastSplit = i;
        }
       // console.log(i)
    }
    console.log(typeof sections)
    console.log(sections)
    return sections;
}

/* 
 * MultiPart_parse decodes a multipart/form-data encoded response into a named-part-map.
 * The response can be a string or raw bytes.
 *
 * Usage for string response:
 *      var map = MultiPart_parse(xhr.responseText, xhr.getResponseHeader('Content-Type'));
 *
 * Usage for raw bytes:
 *      xhr.open(..);     
 *      xhr.responseType = "arraybuffer";
 *      ...
 *      var map = MultiPart_parse(xhr.response, xhr.getResponseHeader('Content-Type'));
 *
 * TODO: Can we use https://github.com/felixge/node-formidable
 * See http://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
 * See http://www.w3.org/Protocols/rfc1341/7_2_Multipart.html
 *
 * Copyright@ 2013-2014 Wolfgang Kuehn, released under the MIT license.
*/
function MultiPart_parse(body, contentType) {
    // Examples for content types:
    //      multipart/form-data; boundary="----7dd322351017c"; ...
    //      multipart/form-data; boundary=----7dd322351017c; ...
    var m = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);

    if (!m) {
        throw new Error('Bad content-type header, no multipart boundary');
    }

    var boundary = m[1] || m[2];

    function Header_parse(header) {
        var headerFields = {};
        var matchResult = header.match(/^.*name="([^"]*)"$/);
        if (matchResult) headerFields.name = matchResult[1];
        return headerFields;
    }

    function rawStringToBuffer(str) {
        var idx, len = str.length, arr = new Array(len);
        for (idx = 0; idx < len; ++idx) {
            arr[idx] = str.charCodeAt(idx) & 0xFF;
        }
        return new Uint8Array(arr).buffer;
    }

    // \r\n is part of the boundary.
    var boundary = '\r\n--' + boundary;

    var isRaw = typeof (body) !== 'string';

    if (isRaw) {
        var view = new Uint8Array(body);
        s = String.fromCharCode.apply(null, view);
    } else {
        s = body;
    }

    // Prepend what has been stripped by the body parsing mechanism.
    s = '\r\n' + s;

    var parts = s.split(new RegExp(boundary)),
        partsByName = {};

    // First part is a preamble, last part is closing '--'
    for (var i = 1; i < parts.length - 1; i++) {
        var subparts = parts[i].split('\r\n\r\n');
        var headers = subparts[0].split('\r\n');
        for (var j = 1; j < headers.length; j++) {
            var headerFields = Header_parse(headers[j]);
            if (headerFields.name) {
                fieldName = headerFields.name;
            }
        }

        partsByName[fieldName] = isRaw ? rawStringToBuffer(subparts[1]) : subparts[1];
    }

    return partsByName;
}
function saveData(blob, fileName) // does the same as FileSaver.js
{
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";

    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
}

function sendJSON() {

    let result = document.querySelector('.result');
    let response = document.querySelector('.responseCode');
    //    let name = document.querySelector('#name');
    //    let email = document.querySelector('#email');
    //   
    // Creating a XHR object
    let xhr = new XMLHttpRequest();
    let url = "http://" + getElementValue("host") + ":" + getElementValue("port") + "/api/darkshield/" + getElementValue("endpoint");

    // open a connection
    xhr.open("POST", url, true);




    // Create a state change callback
    xhr.onreadystatechange = function () {
        // if (xhr.readyState === 4 && xhr.status === 200) {
        //
        // }
        makeElementInvisible("blueLoadSpin")
        response.innerHTML = xhr.status;
        // Print received data from server
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
                result.innerHTML = this.responseText;
                break;
            case "files/fileSearchContext.search":
            case "files/fileMaskContext.mask":
            case "files/fileSearchContext.mask":
                // saveData(this.formData.get("file"), document.getElementById("formFile").value + "_masked");
                // var map = MultiPart_parse(this.responseText, this.getResponseHeader('Content-Type'));
                //   saveData(map["file"], document.getElementById("formFile").value + "_masked");
                parts = parseMultipartResponse(new Uint8Array(xhr.response));
                if (parts.length == 0){
                    console.log("No parts")
                    break;
                }
                console.log(parts)
               // result.innerHTML = this.responseText;
                var blobUrl = URL.createObjectURL(new Blob([parts[1].buffer]));
                var link = document.createElement("a"); // Or maybe get it from the current document
                link.href = blobUrl;
                link.download = document.getElementById("formFile").files[0].name + "_masked";
                link.innerHTML = "Click here to download the file";
                document.body.appendChild(link); // Or append it whereever you want
                // saveData(parts[1], document.getElementById("formFile").value + "_masked");
                //  console.log(typeof this.response)
                //  console.log(this.response)
                //  parts = parseMultipartResponse(this.response);
                //  saveData(parts[1], document.getElementById("formFile").value + "_masked");
                // result.innerHTML = this.response
                break;
            default:
                break;
        }


        //  }
    };


    // Sending data with the request
    // xhr.send(JSON.stringify(generateContext()));
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
            // xhr.setRequestHeader("Content-Type", "multipart/form-data");
            var formData = new FormData();
            formData.append("context", document.getElementById("payloadText").textContent);
            formData.append("file", document.getElementById('formFile').files[0]);
            if (endPoint == "files/FileMaskContext.mask") {
                formData.append("annotations", document.getElementById('annotationFile').files[0]);
            }
            // console.log(formData);
            xhr.responseType = "arraybuffer";
            xhr.send(formData);
            break;
        default:
            break;
    }
    makeElementVisible("blueLoadSpin")
}