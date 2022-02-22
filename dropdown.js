const map = new Map();

function dropDownFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

function generateRulePair() {
    map.clear()
    var searchMatchers = getSelections("searchMatchers");
    var maskRules = getSelections("maskRules");
    var panel = document.getElementById("searchMask");
    panel.innerHTML = "";
    for (let searchMatcher of searchMatchers) {
        if (document.getElementById("div" + searchMatcher) == null) {
            var div = document.createElement("DIV")
            div.id = "div" + searchMatcher;
            var p = document.createElement("P");
            p.id = "p" + searchMatcher
            p.innerHTML = searchMatcher;
            div.appendChild(p);
            panel.appendChild(div);
        }
        generateMask(searchMatcher, maskRules);
        let ele = document.getElementById("maskSelect" + searchMatcher);
        map.set(searchMatcher, ele.value);
        ele.addEventListener('change', function (e) {
            map.set(searchMatcher, ele.value);
        }, false);

    }
}

function getSelections(id) {
    var div = document.getElementById(id);
        // get an array of child nodes
    var children = div.children;
        //divChildren = div.childNodes;
    
    selections = [];
    for (var i = 0; i < children.length; i++) {
        if (children[i].children[0].checked) {
            selections.push(children[i].children[0].id)
        }
    }
    return selections;
}

function generateMask(searchMatcher, maskRules) {
    var panel = document.getElementById("searchMask");
    if (document.getElementById("maskSelect" + searchMatcher) == null) {
        var select = document.createElement("select")
        select.id = "maskSelect" + searchMatcher;
        var div = document.getElementById("div" + searchMatcher);
        div.style.marginTop = "15px";
        div.appendChild(select)
        panel.appendChild(div);
    }
    for (let rule of maskRules) {
        if (document.getElementById("ruleList_" + searchMatcher + rule) == null) {
            var option = document.createElement("OPTION");
            option.setAttribute("value", rule);
            option.id = "ruleList_" + searchMatcher + rule;
            var text = document.createTextNode(rule);
            option.appendChild(text);
            document.getElementById("maskSelect" + searchMatcher).appendChild(option);
        }
    }
}

function clearRulePair() {
    var divS = document.getElementById("searchMatchers");
    var divM = document.getElementById("maskRules");
    // get an array of child nodes
    let divSearchChildren = divS.children;
    let divMaskChildren = divM.children;
    for (var i = 0; i < divSearchChildren.length; i++) {
        divSearchChildren[i].children[0].checked = false;
    }
    for (var i = 0; i < divMaskChildren.length; i++) {
        divMaskChildren[i].children[0].checked = false;
    }
    map.clear();
    toggleOff();
}

function toggleOff() {
    var i;
    for (i = 0; i < acc.length; i++) { 
        acc[i].classList.toggle("active");
        var panel2 = acc[i].nextElementSibling;
        panel2.style.display = "none";
    }
}