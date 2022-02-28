let maskedResult = [];
let match = [];
let matcher = [];

function upload() {
    let files = document.getElementById("formFile").files;
    if (files.length <= 1) {
        var file = document.querySelector('input[type=file]').files[0];
        setReader(file);
    } else if (files.length > 1) {
        var reader;
        for (let i = 0; i < files.length; i++) {
            
            var file = document.querySelector('input[type=file]').files[i];
            setReader(file);
        }

    }
}

function setReader(file) {
    var reader = new FileReader();  
    reader.onload = function(e) {  
        // get file content  
        var text = e.target.result;
        const obj = JSON.parse(text);
        run(obj, file.name);
    }
    reader.readAsText(file, "UTF-8");
}


function findAllVals(obj) {

    for (let k in obj) {
        if (typeof obj[k] === "object") {
            findAllVals(obj[k])
        } else {
            // base case, stop recurring
            
            if (k == 'match') {
                match.push(obj[k]);
            } else if (k == 'matcher') {
                matcher.push(obj[k]);
            } else if (k == 'maskedResult') {
                maskedResult.push(obj[k]);
                
            }
        }
    }

}





function run(obj, filename) {
    
    findAllVals(obj);
    let array = sortMerge(match, matcher, maskedResult);
    
    console.log(filename);
    tableCreate(array, match.length, filename);
}

function sortMerge(match, matcher, maskedResult) {
    let len = match.length;
    let array = ["Match", "Matcher", "Masked Result"];
    for (let n = 0; n < len; n++) {
        array.push(match[n]);
        array.push(matcher[n]);
        array.push(maskedResult[n]);
    }

    return array;
}


function tableCreate(array, len, filename) {
    let div = document.getElementById("demo");
    let table = document.createElement("table");

    
    table.setAttribute("class", "results");
    let rowCnt = len + 1;
    let cellCnt = 3;
    let p = document.createElement("p");
    p.id = "title";
    p.innerHTML = "Results From " + filename;
    div.append(p);
    div.append(table);
    for (let n = 0; n < rowCnt; n++) {
        let row = table.insertRow(n);
        for (let m = 0; m < cellCnt; m++) {
            let cell = row.insertCell(m);
            cell.innerHTML = array[m];
        }
        array.shift();
        array.shift();
        array.shift();
    }

    filename = "";
    maskedResult = [];
    match = [];
    matcher = [];
}


