function updatePayload() {
    document.getElementById("payloadText").textContent = JSON.stringify(generateContext());
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
