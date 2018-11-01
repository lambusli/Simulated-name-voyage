// initially, check "both" radio button
document.chooseGen.b[2].checked = true;

var itr = 0;


const url = 'http://www.cs.middlebury.edu/~candrews/classes/cs465-f18/data/names1880-2012.csv';

d3.csv(url).then((data)=>{
    console.log(data);

    const nameList = []; // user input array
    var currGen = "Both" // user selected gender
    var nestedList = [];  // nested only by gender
    var wantedList = []; // the list that should be displayed

    var doubleList = d3.nest()
      .key((d) => d["Name"])
      .key((d) => d["Gender"])
      .map(data);

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

    const x_scale = d3.scaleLinear();

    const y_scale = d3.scaleLinear();

    const x_axis = chart.append("g")
      .attr("id", "x_axis");

    const y_axis = chart.append("g")
      .attr("id", "y_axis");

    var res = [];


    /*----------------
    * Visualization
    *
    ----------------*/

    // update visualization upon each event
    function updateVis() {

/////////////////////////////////////////
        var scaleParam = adjustScale();

        x_scale.range([0, width])
            .domain([scaleParam["minYear"], scaleParam["maxYear"]]);

        y_scale.range([height, 0])
            .domain([0, scaleParam["maxCount"]]); // adjust to scale to max

        x_axis
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x_scale))

        y_axis
            .call(d3.axisLeft(y_scale));

        res = [];
        for (let i = 0; i < wantedList.length; i++) {
            var nameObj = wantedList[i];

            var objInfo = doubleList.get(nameObj["name"]).get(nameObj["gender"]);
            res.push(objInfo);
        }

        // console.log(res)

        var lines = chart.selectAll(".line")
          .data(res);

        lines.html("");

        lines.append("path")
          .datum((d) => d)
          .style("mix-blend-mode", "multiply")
          .attr("d", d3.line().x((d)=>x_scale(d.Year)).y((d)=>y_scale(d.Count)))
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 1.5)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round");

        console.log(lines.nodes());
        console.log(lines.enter().node());

        lines.enter().append("g")
          .classed("line", true)
          .append("path")
          .datum((d) => d)
          .style("mix-blend-mode", "multiply")
          .attr("d", d3.line().x((d)=>x_scale(d.Year)).y((d)=>y_scale(d.Count)))
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 1.5)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round");

        lines.exit().remove();

        // paths.attr("d", d3.line().x((d)=>x_scale(d.Year)).y((d)=>y_scale(d.Count)));


        // paths.enter().append("path")



        // paths.exit().remove();


    }

    // find the min, max of Year, Count, given wantedList of names
    function adjustScale(){
      var maxYear = -1;
      var minYear = 2147483647;
      var maxCount = -1;
      for (i = 0; i < wantedList.length; i++){
        var D = doubleList.get(wantedList[i].name).get(wantedList[i].gender)
        maxYear = Math.max(maxYear, d3.max(D, (d) => +d["Year"]));
        minYear = Math.min(minYear, d3.min(D, (d) => +d["Year"]));
        maxCount = Math.max(maxCount, d3.max(D, (d) => +d["Count"]));
      }
      return {
        "maxYear": maxYear,
        "minYear": minYear,
        "maxCount": maxCount
      };

    }




    /*----------------
    * Non-visual
    *
    ----------------*/

    // event listener for adding name
    d3.select(".addButton").on("click", function(){
        var nom = document.getElementById("myVal").value;
        var gender = document.getElementById("selectGender").value;
        var nameObj = {"name": nom, "gender": gender};
        nameList.push(nameObj);

        updateList(currGen);
    });

    // event listener for changing radio button and filter gender
    d3.select('#genform').selectAll(".radio").on("change", function(){
        currGen = d3.select(this).property("value");
        updateList(currGen); // needs d3 enter exit
    });

    // return a list with only desired gender
    function filterGen(gender){
        // create subarray with name objects with given gender
        var res = [];
        if (gender == "Both") res = nameList;
        if (gender == "M") res = nestedList.get("M");
        if (gender == "F") res = nestedList.get("F");
        if (res != null) return res;
        else return []; 
    }

    // update a List upon each event
    function updateList() {


        nestedList = d3.nest()
            .key((d) => d["gender"])
            .map(nameList);

        wantedList = filterGen(currGen);

        const selection = d3.select(".selection").select("ul")
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

        updateVis();

    }




});
