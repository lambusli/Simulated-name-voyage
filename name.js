// data = [{key:, value:}, {key:, value:}, ...]
function valOfKey(data, key) { 
    for (var i in data) {
        if (data[i]["key"] == key) return data[i]["values"];  
    }
    return "None"; 
}

/*-------------
Select elements
-------------*/
const nameForm = d3.select("#nameform"); 

const genForm = d3.select("#genform"); 

/*-------------
Insertion and selection
-------------*/

// initialize name list
const nameList = [
    {"name": "Aiko", "gender": "F"}, 
    {"name": "Lambus", "gender": "M"}, 
    {"name": "Thor", "gender": "M"}, 
    {"name": "Black widow", "gender": "F"}, 
    {"name": "Scarlet", "gender": "F"}
];  

// current selected gender
var currGen = "E"; 

// list nested by gender
var nestedList = []; 

// initially, check "both" radio button
document.chooseGen.b[0].checked = true; 

// initially, display all 
updateList("E"); 

// ? why event listener won't work?
// Add name to list
function handleClick() {
     
    var nom = document.getElementById("myVal").value; 
    var gen = document.getElementById("myGen").value; 
    console.log(nom + " " + gen); 
    var nameOb = {"name": nom, "gender": gen}; 
    nameList.push(nameOb); 
    updateList(currGen); 
    
    d3.selectAll(".text").property("value", "");
    return false;
}

// Change displayed gender
genForm.selectAll(".radio").on("change", function(){
    let gender = d3.select(this).property("value");  
    currGen = gender; 
    updateList(currGen); 
}); 


// update list
function updateList(gender) {
    
    nestedList = d3.nest()
        .key((d) => d["gender"])
        .entries(nameList); 
    
    var wantedList = []; 
    
    if (gender == "E") {
        wantedList = nameList; 
    }
    else if (gender == "F") {
        wantedList = valOfKey(nestedList, "F"); 
    }
    else if (gender == "M") {
        wantedList = valOfKey(nestedList, "M"); 
    }
    
    
    selection = d3.select(".selection")
        .select("ul")
        .selectAll("li")
        .data(wantedList)
        .style("color", "black");
    
    selection.enter()//)
        .append("li")
        .text(function(d, i){ 
            return d["name"]; 
        }); 
    
    selection.html((d, i) => d["name"]); 
    
    selection.exit().remove();  
    
    
}


