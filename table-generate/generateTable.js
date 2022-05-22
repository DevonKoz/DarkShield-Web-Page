let maskedResult = [];
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
            if (k == 'matcher') {
                matcher.push(obj[k]);
            } 
        }
    }
}





function run(obj, filename) {
    findAllVals(obj);
    let map = sortMerge(matcher, maskedResult);
    tableCreate(map, matcher.length, filename);
}

function sortMerge(matcher, maskedResult) {
    let len = matcher.length;
    const map = new Map();
    map.set("Matcher", "Count");
    for (let n = 0; n < len; n++) {
    if(map.has(matcher[n])) {
        map.set(matcher[n], map.get(matcher[n]) + 1);
        }
        else{
        map.set(matcher[n], 1);
        }
    }
    const mapSort = new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
    return mapSort;
}


function tableCreate(map, len, filename) {
    let div = document.getElementById("demo");
    let table = document.createElement("table");
    table.setAttribute("class", "results");
    let rowCnt = len + 1;
    let cellCnt = 2;
    let p = document.createElement("p");
    p.id = "title";
    p.innerHTML = "Results From " + filename;
    div.append(p);
    div.append(table);
    let n = 0;
    map.forEach((value, key) => {
    let row = table.insertRow(n++);
    let cell = row.insertCell(0);
    cell.innerHTML = key;
    let cell2 = row.insertCell(1);
    cell2.innerHTML = value;
})
    filename = "";
    maskedResult = [];
    matcher = [];
}


