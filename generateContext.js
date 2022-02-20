function updatePayload() {
    document.getElementById("payloadText").textContent = JSON.stringify(generateContext());
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
function generateContext() {
    endPoint = getElementValue("endpoint");
    switch (endPoint) {
        case "searchContext.create":
            var searchContext = {
                name: "SearchContext2",
                matchers: []
            };
            for (const [key, value] of map.entries()) {
                searchContext.matchers.push(generateSearchMatcher(key));
            }
            console.log(searchContext);
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
                text: document.getElementById("textForBaseAPI").textContent
            }
            return context;
        case "searchContext.mask":
            var context = {
                searchContextName: "SearchContext2",
                maskContextName: "MaskContext2",
                text: document.getElementById("textForBaseAPI").textContent
            }
            return context;
        case "maskContext.mask":
            var context = {
                maskContextName: "MaskContext2",
                text: document.getElementById("textForBaseAPI").textContent
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


function sendRequest2(endpoint, context) {
    // Creating a XHR object
    let xhr = new XMLHttpRequest();
    let url = "http://" + getElementValue("host") + ":" + getElementValue("port") + "/api/darkshield/" + endpoint;

    // open a connection
    xhr.open("POST", url, true);


    // Create a state change callback
    xhr.onreadystatechange = function () {
        makeElementInvisible("blueLoadSpin")
        console.log(xhr.status)
        // response.innerHTML = xhr.status;
        // endPoint = getElementValue("endpoint");
        switch (endpoint) {
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
                console.log(this.responseText);
                break;
            case "files/fileMaskContext.mask":
            case "files/fileSearchContext.mask":
                console.log(xhr.response);
                parts = parseMultipartResponse(new Uint8Array(xhr.response));
                if (parts.length == 0) {
                    break;
                }
                var maskedFileUrl = URL.createObjectURL(new Blob([parts[1].buffer])); // parts[1] should be the masked file, parts[0] should be the JSON results file.
                var resultsFileUrl = URL.createObjectURL(new Blob([parts[0].buffer])); // parts[1] should be the masked file, parts[0] should be the JSON results file.
                var link = document.createElement("a");
                link.href = maskedFileUrl;
                link.download = "masked_" + document.getElementById("formFile").files[0].name;
                link.click()
                link.href = resultsFileUrl;
                link.download = document.getElementById("formFile").files[0].name + "_results.json";
                link.click()
                break;
            default:
                break;
        }
    };
    switch (endpoint) {
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
            xhr.send(JSON.stringify(context));
            break;
        case "files/fileSearchContext.search":
        case "files/fileMaskContext.mask":
        case "files/fileSearchContext.mask":
            var formData = new FormData();
            formData.append("context", JSON.stringify(context));
            formData.append("file", document.getElementById('formFile').files[0]);
            if (endpoint == "files/fileMaskContext.mask") {
                formData.append("annotations", document.getElementById('annotationFile').files[0]);
            }
            if (endpoint != "files/fileSearchContext.search") {
                xhr.responseType = "arraybuffer";
            }
            xhr.send(formData);
            break;
        default:
            break;
    }
    makeElementVisible("blueLoadSpin")
}

function generateSampleContexts() {
    search_context_name = "SampleSearchContext"
    mask_context_name = "SampleMaskContext"
    file_search_context_name = "SampleFileSearchContext"
    file_mask_context_name = "SampleFileMaskContext"
    search_context = {
        "name": search_context_name,
        "matchers": [
            {
                "name": "CcnMatcher",
                "type": "pattern",
                "pattern": "\\b(4\\d{12}(\\d{3})?)|(5[1-5]\\d{14})|(3[47]\\d{13})|(3(0[0-5]|[68]\\d)\\d{11})|(6(011|5\\d{2})\\d{12})|((2131|1800|35\\d{3})\\d{11})|(8\\d{15})\\b"
            },
            {
                "name": "DateMatcher",
                "type": "pattern",
                "pattern": "\\b([0]\\d|[1][012])[-/.]?([012]\\d|[3][01])[-/.]?(\\d{4})\\b"
            },
            {
                "name": "EmailMatcher",
                "type": "pattern",
                "pattern": "\\b[\\w._%+-]+@[\\w.-]+\\.[A-Za-z]{2,4}\\b"
            },
            {
                "name": "IpAddressMatcher",
                "type": "pattern",
                "pattern": "\\b((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b"
            },
            {
                "name": "NERMatcher",
                "type": "ner",
                "modelUrl": "http://opennlp.sourceforge.net/models-1.5/en-ner-person.bin",
                "sentenceDetectorUrl": "http://opennlp.sourceforge.net/models-1.5/en-sent.bin",
                "tokenizerUrl": "http://opennlp.sourceforge.net/models-1.5/en-token.bin"
            },
            {
                "name": "PhoneMatcher",
                "type": "pattern",
                "pattern": "\\b(\\+?1?([ .-]?)?)?(\\(?([2-9]\\d{2})\\)?([ .-]?)?)([2-9]\\d{2})([ .-]?)(\\d{4})(?: #?[eE][xX][tT]\.? \\d{2,6})?\\b"
            },
            {
                "name": "SsnMatcher",
                "type": "pattern",
                "pattern": "\\b(\\d{3}[-]?\\d{2}[-]?\\d{4})\\b"
            },
            {
                "name": "URLMatcher",
                "type": "pattern",
                "pattern": "\\b(\\w+):\\/\\/([\\w\\.-@]+)\\.([A-Za-z\\.]{2,6})([\\/\\w \\(\\)\\.-]*)*\\/?\\b"
            },
            {
                "name": "USZipMatcher",
                "type": "pattern",
                "pattern": "\\b\\d{5}(?:-\\d{4})?\\b"
            },
            {
                "name": "VINMatcher",
                "type": "pattern",
                "pattern": "\\b([A-HJ-NPR-Z\\d]{3})([A-HJ-NPR-Z\\d]{5})([\\dX])(([A-HJ-NPR-Z\\d])([A-HJ-NPR-Z\\d])([A-HJ-NPR-Z\\d]{6}))\\b"
            }
        ]
    }

    mask_context = {
        "name": mask_context_name,
        "rules": [
            {
                "name": "HashEmailRule",
                "type": "cosort",
                "expression": "hash_sha2(${EMAIL})"
            },
            {
                "name": "RedactSsnRule",
                "type": "cosort",
                "expression": "replace_chars(${SSN},'*',1,3,'*',5,2)"
            },
            {
                "name": "FpeRule",
                "type": "cosort",
                "expression": "enc_fp_aes256_alphanum(${INPUT})"
            }
        ],
        "ruleMatchers": [
            {
                "name": "FpeRuleMatcher",
                "type": "name",
                "rule": "FpeRule",
                "pattern": ".*"
            }
        ]
    }

    file_search_context = {
        "name": file_search_context_name,
        "matchers": [
            {
                "name": search_context_name,
                "type": "searchContext"
            }
        ]
    }

    file_mask_context = {
        "name": file_mask_context_name,
        "rules": [
            {
                "name": mask_context_name,
                "type": "maskContext"
            }
        ]
    }
    sendRequest2("searchContext.create", search_context)
    sendRequest2("maskContext.create", mask_context)
    sendRequest2("files/fileSearchContext.create", file_search_context)
    sendRequest2("files/fileMaskContext.create", file_mask_context)

}
function deleteSampleContexts(){
    search_context_name = "SampleSearchContext";
    mask_context_name = "SampleMaskContext";
    file_search_context_name = "SampleFileSearchContext";
    file_mask_context_name = "SampleFileMaskContext";
    var destroySearchContext = { name: search_context_name};
    var destroyMaskContext = { name: mask_context_name};
    var destroyFileSearchContext = { name: file_search_context_name};
    var destroyFileMaskContext = { name: file_mask_context_name};
    sendRequest2("searchContext.destroy", destroySearchContext);
    sendRequest2("maskContext.destroy", destroyMaskContext);
    sendRequest2("files/fileSearchContext.destroy", destroyFileSearchContext);
    sendRequest2("files/fileMaskContext.destroy", destroyFileMaskContext);
}
