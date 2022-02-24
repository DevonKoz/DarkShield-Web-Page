const createEndPoints = ["searchContext.create", "maskContext.create", "files/fileSearchContext.create", "files/fileMaskContext.create", "files/fileSearchContext.mask"]
const destroyEndPoints =["searchContext.destroy", "maskContext.destroy", "files/fileSearchContext.destroy", "files/fileMaskContext.destroy"]
var counter;
var point;


function updatePayload() {
    var firstPage = document.getElementById("first-page");
    var secondPage = document.getElementById("second-page");
    firstPage.style.display = "none";
    secondPage.style.display = "block";
    counter = 0;
    document.getElementById("payloadText").value = JSON.stringify(generateContext(createEndPoints[counter]));
    var par = document.getElementById("valueofendpoint");
    par.innerHTML = createEndPoints[counter];
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
function generateMaskRule(type, i) {
    var json = {}
    switch (type) {
        case "FPE AES256 Encryption":
            json['name'] = type + "Rule" + i.toString();
            json['type'] = "cosort";
            json['expression'] = "enc_fp_aes256_alphanum(${F})";
            return json;
        case "Hash":
            json['name'] = type + "Rule" + i.toString();
            json['type'] = "cosort";
            json['expression'] = "hash_sha2(${F})";
            return json;
        case "Redaction":
            json['name'] = type + "Rule" + i.toString();
            json['type'] = "cosort";
            json['expression'] = "replace_chars(${F})";
            return json;
        case "AES256 Encryption":
            json['name'] = type + "Rule" + i.toString();
            json['type'] = "cosort";
            json['expression'] = "enc_aes256(${F})";
            return json;
        default:
            return json;
    }
}
function generateMaskRuleMatchers(maskRule, searchMatcher, i) {
    var json = {};
    json['name'] = maskRule + "RuleMatcher";
    json['type'] = "name";
    json['rule'] = searchMatcher + "Rule" + i.toString();
    json['pattern'] = maskRule;
    return json;
}

function generateSearchMatcher(type) {
    var json = {}
    switch (type) {
        case "US SSN":
            json['name'] = "US SSN";
            json['type'] = "pattern";
            json['pattern'] = "\\b(\\d{3}[-]?\\d{2}[-]?\\d{4})\\b";
            break;
        case "Emails":
            json['name'] = "Emails";
            json['type'] = "pattern";
            json['pattern'] = "\\b[\\w._%+-]+@[\\w.-]+\\.[A-Za-z]{2,4}\\b";
            break;
        case "Credit Cards":
            json['name'] = "Credit Cards";
            json['type'] = "pattern";
            json['pattern'] = "\\b(4\\d{12}(\\d{3})?)|(5[1-5]\\d{14})|(3[47]\\d{13})|(3(0[0-5]|[68]\\d)\\d{11})|(6(011|5\\d{2})\\d{12})|((2131|1800|35\\d{3})\\d{11})|(8\\d{15})\\b";
            break;
        case "Phone Numbers":
            json['name'] = "Phone Numbers";
            json['type'] = "pattern";
            json['pattern'] = "\\b(\\+?1?([ .-]?)?)?(\\(?([2-9]\\d{2})\\)?([ .-]?)?)([2-9]\\d{2})([ .-]?)(\\d{4})(?: #?[eE][xX][tT]\.? \\d{2,6})?\\b";
            break;
        case "American_Dates":
            json['name'] = "American_Dates";
            json['type'] = "pattern";
            json['pattern'] = "\\b([0]\\d|[1][012])[-/.]?([012]\\d|[3][01])[-/.]?(\\d{4})\\b"
            break;
        case "European_Dates":
            json['name'] = "European_Dates";
            json['type'] = "pattern";
            json['pattern'] = "\\b([012]\\d|[3][01])[-/.]?([0]\\d|[1][012])[-/.]?(\\d{4})\\b"
            break;
        case "URL":
            json['name'] = "URL";
            json['type'] = "pattern";
            json['pattern'] = "\\b(\\w+):\\/\\/([\\w\\.-@]+)\.([A-Za-z\\.]{2,6})([\\/\w \\(\\)\\.-]*)*\\/?\\b"
            break;
        case "VIN":
            json['name'] = "VIN";
            json['type'] = "pattern";
            json['pattern'] = "\\b([A-HJ-NPR-Z\\d]{3})([A-HJ-NPR-Z\\d]{5})([\\dX])(([A-HJ-NPR-Z\\d])([A-HJ-NPR-Z\\d])([A-HJ-NPR-Z\\d]{6}))\\b"
            break;
        case "US_Postal_Code":
            json['name'] = "US_Postal_Code";
            json['type'] = "pattern";
            json['pattern'] = "\\b\\d{5}(?:-\\d{4})?\\b"
            break;
        case "IP_Address":
            json['name'] = "IP_Address";
            json['type'] = "pattern";
            json['pattern'] = "\\b((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b"
            break;
        case "SIN_Canada":
            json['name'] = "SIN_Canada";
            json['type'] = "pattern";
            json['pattern'] = "\\b(\\d{3}[-]?\\d{3}[-]?\\d{3})\\b"
            break;
        case "Names":
            json['name'] = "Names";
            json['type'] = "ner";
            json['pattern'] = "\\b(\\+?1?([ .-]?)?)?(\\(?([2-9]\\d{2})\\)?([ .-]?)?)([2-9]\\d{2})([ .-]?)(\\d{4})(?: #?[eE][xX][tT]\.? \\d{2,6})?\\b";
            json['modelUrl'] = "http://opennlp.sourceforge.net/models-1.5/en-ner-person.bin";
            json['sentenceDetectorUrl'] = "http://opennlp.sourceforge.net/models-1.5/en-sent.bin";
            json['tokenizerUrl'] = "http://opennlp.sourceforge.net/models-1.5/en-token.bin";
            break;
        default:
            break;
    }
    return json;
}
function generateContext(endPoint) {
    //endPoint = getElementValue("endpoint");
    switch (endPoint) {
        case "searchContext.create":
            var searchContext = {
                name: "SearchContext2",
                matchers: []
            };
            for (const [key, value] of map.entries()) {
                searchContext.matchers.push(generateSearchMatcher(key));
            }
            
            return searchContext;
        case "searchContext.destroy":
            var deleteContext = { name: "SearchContext2" };
            return deleteContext;
        case "maskContext.create":
            var maskContext = {
                name: "MaskContext2",
                rules: [],
                ruleMatchers: []
            };
            var i = 0;
            for (const [key, value] of map.entries()) {
                i++;
                maskContext.rules.push(generateMaskRule(value, i));
                maskContext.ruleMatchers.push(generateMaskRuleMatchers(key, value, i));
            }
            return maskContext;
        case "maskContext.destroy":
            var deleteContext = { name: "MaskContext2" };
            return deleteContext;
        case "searchContext.search":
            var context = {
                name: "SearchContext2",
                text: document.getElementById("textForBaseAPI").value
            }
            return context;
        case "searchContext.mask":
            var context = {
                searchContextName: "SearchContext2",
                maskContextName: "MaskContext2",
                text: document.getElementById("textForBaseAPI").value
            }
            return context;
        case "maskContext.mask":
            var context = {
                maskContextName: "MaskContext2",
                text: document.getElementById("textForBaseAPI").value
            }
            return context;
        case "files/fileSearchContext.create":
            var context = {
                "name": "FileSearchContext2",
                "matchers": [
                    {
                        "name": "SearchContext2",
                        "type": "searchContext"
                    }
                ]
            }
            return context;
        case "files/fileMaskContext.create":
            var context = {
                "name": "FileMaskContext2",
                "rules": [
                    {
                        "name": "MaskContext2",
                        "type": "maskContext"
                    }
                ]
            }
            return context;
        case "files/fileSearchContext.destroy":
            var context = { name: "FileSearchContext2" };
            return context;
        case "files/fileMaskContext.destroy":
            var context = { name: "FileMaskContext2" };
            return context;
        case "files/fileSearchContext.search":
        case "files/fileMaskContext.mask":
        case "files/fileSearchContext.mask":
            var context =
            {
                "fileSearchContextName": "FileSearchContext2",
                "fileMaskContextName": "FileMaskContext2"
            }
            return context;
        default:
            return "";
    }
}

function next() {
    
    if (window.localStorage.getItem('api_type') === 'darkshield-base') {
        nextText();
    } else if (window.localStorage.getItem('api_type') === 'darkshield-files') {
        nextFile();
    }
}

function nextFile() {
    var btn = document.getElementsByClassName("process-payload");
    var fileUpload = document.getElementsByClassName("file-upload");
    var par = document.getElementById("valueofendpoint");
    sendRequest(createEndPoints[counter]);
    if (counter < 4) {
        counter++;
    }
    if (counter === 4){ 
        for (var i = 0; i < fileUpload.length; i++ ) {
            fileUpload[i].style.display = "block";
        }
        btn[0].innerHTML = "Search and Mask";
    }
    par.innerHTML = createEndPoints[counter];
    document.getElementById("payloadText").value = JSON.stringify(generateContext(createEndPoints[counter]));
}

function nextText() {
    var textUpload = document.getElementsByClassName("text-upload");
    var par = document.getElementById("valueofendpoint");
    var btn = document.getElementsByClassName("process-payload");
    
    if (counter === 2) {
        
        sendRequest("searchContext.mask");
    }
    
    if (counter < 2 ) {
        
        sendRequest(createEndPoints[counter]);
        counter++;
    }
    if (counter === 2) {
        for (var i = 0; i < textUpload.length; i++ ) {
            textUpload[i].style.display = "block";
        }
        btn[0].innerHTML = "Search and Mask";
        par.innerHTML = "searchContext.mask";
        document.getElementById("payloadText").value = JSON.stringify(generateContext("searchContext.mask"));
        document.getElementById("process-payload").disabled = true;
        document.getElementById("btn-set-text").style.display = "block";
    } else {
        par.innerHTML = createEndPoints[counter];
        document.getElementById("payloadText").value = JSON.stringify(generateContext(createEndPoints[counter]));
    }          
}


function reset() {
    counter--;
    while (counter >= 0) {
        document.getElementById("payloadText").value = JSON.stringify(generateContext(destroyEndPoints[counter]));
        sendRequest(destroyEndPoints[counter]);
        counter--;
    }
    document.getElementById("payloadText").value = '';
    document.getElementById("textForBaseAPI").value = '';
    clearRulePair();
    toggleOff();
    var firstPage = document.getElementById("first-page");
    var secondPage = document.getElementById("second-page");
    firstPage.style.display = "block";
    secondPage.style.display = "none";
    var fileUpload = document.getElementsByClassName("file-upload");
    for (var i = 0; i < fileUpload.length; i++ ) {
        fileUpload[i].style.display = "none";
    }

    var btn = document.getElementsByClassName("process-payload");
    btn[0].innerHTML = "Next";
    var textUpload = document.getElementsByClassName("text-upload");
    for (var i = 0; i < textUpload.length; i++ ) {
        textUpload[i].style.display = "none";
    }
    btn[0].disabled = false;
}

function setText() {
    let textContent = document.getElementById("textForBaseAPI").value;
    let context = {
        searchContextName: "SearchContext2",
        maskContextName: "MaskContext2",
        text: textContent
    }
    document.getElementById("payloadText").value = JSON.stringify(context);
    document.getElementById("process-payload").disabled = false;
}
