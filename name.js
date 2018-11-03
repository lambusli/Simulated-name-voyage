// data = [{key:, value:}, {key:, value:}, ...]
function valOfKey(data, key) {
    for (var i in data) {
        if (data[i]["key"] == key) return data[i]["values"];
    }
    return "None";
}




/*-----------------
Visualization part
------------------*/
const margins = {top:10, bottom:40, left:50, right:10}

const width = 500;

const height = 500;

const svg = d3.select("#chart")
    .attr("width", width + margins.left + margins.right)
    .attr("height", height + margins.top + margins.bottom);

const chart = svg.append("g")
    .attr("transform", `translate(${margins.left}, ${margins.top})`);

const labels = svg.append("g")
    .attr("transform", `translate(${margins.left}, ${margins.top})`);

const url = 'http://www.cs.middlebury.edu/~candrews/classes/cs465-f18/data/names1880-2012.csv';

const nameForm = d3.select("#nameform");

const genForm = d3.select("#genform");



d3.csv(url).then((data)=>{
    console.log(data);
    const newData = data.slice(0, 30);
    newData.push({Name: "Maude", Gender: "M", Count: "2", Year: "1880"});

    const nestedData = d3.nest()
        .key((d) => d["Gender"])
        .key((d) => d["Name"])
        .map(data);
    /*
    console.log(nestedData);
    console.log(nestedData.get("F").get("Maude") != null);
    console.log(nestedData.get("M").get("Anna") != null);
    */
    /*-------------
    Insertion and selection
    -------------*/

    // initialize name list
    const nameList = [
        {"name": "Lambus", "gender": "M"},
        {"name": "Aiko", "gender": "F"},
        {"name": "Loki", "gender": "M"},
        {"name": "Black widow", "gender": "F"},
        {"name": "Alex", "gender": "B"}
    ];

    // current selected gender
    var currGen = "E";

    // list nested by gender
    var nestedList = [];

    // initially, check "both" radio button
    document.chooseGen.b[2].checked = true;

    // initially, display all
    updateList("E");

    // ? why event listener won't work?
    // Add name to list
    d3.selectAll("#nameform").on("submit", insertName);

    function insertName(event){

        var nom = document.getElementById("myVal").value;
        var gen = "unknown";
        var isMale = false, isFemale = false;

        if (nestedData.get("M").get(nom) != null) isMale = true;
        if (nestedData.get("F").get(nom) != null) isFemale = true;

        if (isMale && isFemale) gen = "B";
        if (isMale && !isFemale) gen = "M";
        if (!isMale && isFemale) gen = "F";
        else {
            alert("This person is not in record");
            return;
        }


        var nameOb = {"name": nom, "gender": gen};

        nameList.push(nameOb); 
        updateList(currGen);

        alert("clicked");
        console.log(nameOb);
        d3.event.stopPropagation();
        //d3.selectAll(".text").property("value", "");

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
        else if (gender == "B") {
            wantedList = valOfKey(nestedList, "B");
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

    // calculate max count
    // feed the data inputted in textbox
    // const maxCount = d3.max(data, (d)=>d.Count);

    // const dataset = Array.from({length: 15}, (d)=>d.Count);


    /*
    const x_scale = d3.scaleLinear()
        .range([0, width])
        .domain([0, dataset.length]);

    const y_scale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, maxCount]); // adjust to scale to max

    const line = d3.line()
        .x((d,i) => x_scale(i))
        .y((d) => y_scale(d));

    chart.append("path")
        .datum(dataset)            // datum: not data-joined
        .attr("d", line)
        .style("stroke", "blue")
        .style("fill", "none");

    chart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x_scale));

    chart.append("g")
        .call(d3.axisLeft(y_scale));

    chart.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${width/2}, ${height+margins.bottom - 10})`)
        .style("font-size", "10px")
        .attr("font-family", "sans-serif")
        .text("Year");

    chart.append("text")
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .attr("font-family", "sans-serif")
        .attr("transform", `translate(${-(3*margins.left/4)}, ${height/2})rotate(-90)`)
        .text("Count");
    */
});
