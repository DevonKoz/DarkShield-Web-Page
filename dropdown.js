const map = new Map();

function dropDownFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

function generateRulePair() {
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
    var div = document.getElementById(id),
        // get an array of child nodes
        divChildren = div.childNodes;
    selections = [];
    for (var i = 0; i < divChildren.length; i++) {
        if (divChildren[i].checked) {
            selections.push(divChildren[i].id)
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
