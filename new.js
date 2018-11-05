// assign index values to each letter lowercase and uppercase
const dict = {
  "a": 0,
  "b": 1,
  "c": 2,
  "d": 3,
  "e": 4,
  "f": 5,
  "g": 6,
  "h": 7,
  "i": 8,
  "j": 9,
  "k": 10,
  "l": 11,
  "m": 12,
  "n": 13,
  "o": 14,
  "p": 15,
  "q": 16,
  "r": 17,
  "s": 18,
  "t": 19,
  "u": 20,
  "v": 21,
  "w": 22,
  "x": 23,
  "y": 24,
  "z": 25,
  "A": 26,
  "B": 27,
  "C": 28,
  "D": 29,
  "E": 30,
  "F": 31,
  "G": 32,
  "H": 33,
  "I": 34,
  "J": 35,
  "K": 36,
  "L": 37,
  "M": 38,
  "N": 39,
  "O": 40,
  "P": 41,
  "Q": 42,
  "R": 43,
  "S": 44,
  "T": 45,
  "U": 46,
  "V": 47,
  "W": 48,
  "X": 49,
  "Y": 50,
  "Z": 51
}

// initially check "both" filter for gender
document.chooseGen.b[2].checked = true;

const url = 'http://www.cs.middlebury.edu/~candrews/classes/cs465-f18/data/names1880-2012.csv';

d3.csv(url).then((data)=>{
    console.log(data);

    var nameList = []; // array of all {name, gender} added
    var currGen = "Both" // user selected gender filter
    var nestedList = [];  // nameList nested by gender
    var wantedList = []; // Either a male list or female list, "got" from nestedList

    var doubleList = d3.nest() // nested list of the originL data
      .key((d) => d["Name"])
      .key((d) => d["Gender"])
      .map(data);

    var nastyList = d3.nest()
      .key((d) => d["Name"])
      .key((d) => d["Gender"])
      .key((d) => d["Year"])
      .map(data);

    const margins = {top:20, bottom:40, left:80, right:10}

    const width = 470;

    const height = 470;

    const svg = d3.select("#chart")   // svg tag
      .attr("width", width + margins.left + margins.right)
      .attr("height", height + margins.top + margins.bottom);

    const chart = svg.append("g")   // g tag for the line chart
      .attr("transform", `translate(${margins.left}, ${margins.top})`);

    const labels = svg.append("g")  // g tag for the axis labels
      .attr("transform", `translate(${margins.left}, ${margins.top})`);

    const x_scale = d3.scaleLinear();

    const y_scale = d3.scaleLinear();

    const x_axis = chart.append("g")  // g tag for x axis
      .attr("id", "x_axis");

    const y_axis = chart.append("g")  // g tag for y axis
      .attr("id", "y_axis");

    const refLine = chart.append("g")  // reference line
      .attr("class", "ref")

    /*
    * res -> [[{}, {}, {},...], [{}, {}, {},...], [{}, {}, {},...], [{}, {}, {},...]]
    * array of array containing objects
    * the first-order (outer) array groups the second-order (inner) array by name and gender
    * Each object in the inner array shares name and gender, but differs in year and count
    */
    var res = [];



    /*----------------------------------------
    * First part: Visualization
    * Attention: functions in this Vis part will be called in the second part (non-Vis)
    -----------------------------------------*/

    /*
    * update visualization upon each event
    * params:
      ** wanted: a list of {name, gender} that is to be shown in the line chart
      ** strokewidth: differs by occasions
    */
    function updateVis(wanted, strokewidth) {

        // scaleParam is an object containing parameters that adjust x and y scales upon each change of data
        var scaleParam = adjustScale(wanted);

        x_scale.range([0, width]) // adjust x scale
          .domain([scaleParam["minYear"], scaleParam["maxYear"]]);

        y_scale.range([height, 0]) // adjust y scale
          .domain([0, scaleParam["maxCount"]]); // adjust to scale to max

        x_axis.attr("transform", `translate(0, ${height})`) // adjust x axis with new x scale
          .call(d3.axisBottom(x_scale))

        y_axis.call(d3.axisLeft(y_scale)); // adjust y axis with new y scale

        // append axis-labels
        labels.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", `translate(${width/2}, ${height+margins.bottom})`)
          .style("font-size", "18px")
          .attr("font-family", "sans-sarif")
          .text("Year");

        labels.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", `translate(${- 3 * margins.left / 4}, ${height / 2})rotate(-90)`)
          .style("font-size", "18px")
          .attr("font-family", "sans-sarif")
          .text("Count");

        res = []; // initialize res as empty
        // generate new res
        for (let i = 0; i < wanted.length; i++) {
            var nameObj = wanted[i];

            var objInfo = doubleList.get(nameObj["name"]).get(nameObj["gender"]);
            res.push(objInfo);
        }

        // binding lines with data in res
        var lines = chart.selectAll(".line")
        .data(res);

        // for existing lines (update selection), we wipe the original trace that does not fit the new scales
        lines.html("");

        // Add up-to-date trajectory to existing lines, with animation
        lines.append("path")
          .datum((d) => d)
          .style("mix-blend-mode", "multiply")
          .attr("class", "linepath")
          .attr("d", d3.line().x((d)=>x_scale(d.Year)).y((d)=>y_scale(d.Count)))
          .attr("fill", "none")
          .attr("stroke", (d, i) => giveColor(d[i]["Name"], d[i]["Gender"]))
          .attr("stroke-width", strokewidth)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("opacity", 0)
          .transition()
          .attr("opacity", 1)
          .duration(500).delay(0);

        // enter selection: append new line
        // id of ".line" tag is for future reference of data
        // id is also to dinstinguish the metadata of lines
        newLines = lines.enter().append("g")
          .classed("line", true)
          .attr("id", (d, i) => d[i]["Name"] + d[i]["Gender"]);

        // append path to ".line" tag, with animation
        // data reference here is messy, may need improvement
        newLines.append("path")
          .datum((d) => d)
          .attr("d", d3.line().x((d)=>x_scale(d.Year)).y((d)=>y_scale(d.Count)))
          .style("mix-blend-mode", "multiply")
          .attr("class", "linepath")
          .attr("fill", "none")
          .attr("stroke", (d, i) => giveColor(d[i]["Name"], d[i]["Gender"]))
          .attr("stroke-width", strokewidth)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("opacity", 0)
          .transition()
          .attr("opacity", 1)
          .duration(500).delay(0);

        // remove exit selection, with animation
        lines.exit()
          .style("mix-blend-mode", "multiply")
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", strokewidth)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("opacity", 1)
          .transition()
          .attr("opacity", 0)
          .duration(500).delay(100)
          .remove();


        /* -----------
        * actions when we hover on a line
        -----------*/
        function onLine(d, i, domelem) {
            let coord = [d3.event.pageX, d3.event.pageY]; // page coordinate

            // get the year corresponding to the mouse position on the chart. This needs to be an integer
            // x_scale.invert: transform a coordinate into Year
            // d3.mouse(DOM element) returns coordinate [x, y] with reference to this DOM element
            let selectedYear = Math.floor(x_scale.invert(d3.mouse(domelem)[0]));
            // get the count of corresponding year
            let selectedCount = nastyList.get(d[0]["Name"]).get(d[0]["Gender"]).get(selectedYear)[0]["Count"];

            let chartX = x_scale(selectedYear); // the real X coordinate on the chart
            let chartY = y_scale(selectedCount); // the real y coordinate on the chart

            d3.select(domelem).selectAll(".linepath").attr("stroke-width", 6) // highlight the line

            //  appending info to tooltip
            d3.select("#name").text(d[0]["Name"]);
            d3.select("#gender").text(d[0]["Gender"]);
            d3.select("#year").text(selectedYear);
            d3.select("#count").text(selectedCount);

            // appending reference line
            var lineFunction = d3.line()
              .x(function(d) { return d.x; })
              .y(function(d) { return d.y; })
              .curve(d3.curveLinear);

            //The data for our line
            var lineDataV = [
              {"x": chartX, "y": chartY},
              {"x": chartX, "y": y_scale(0)}
            ];

            var lineDataH = [
              {"x": chartX, "y": chartY},
              {"x": 0, "y": chartY}
            ]

            refLine.html(""); // clear the previous reference line

            // vertical reference line
            refLine.append("path")
              .attr("d", lineFunction(lineDataV))
              .attr("stroke", "black")
              .attr("stroke-width", 1)
              .attr("fill", "none")
              .style("stroke-dasharray", ("3, 3"));

            // horizontal reference line
            refLine.append("path")
              .attr("d", lineFunction(lineDataH))
              .attr("stroke", "black")
              .attr("stroke-width", 1)
              .attr("fill", "none")
              .style("stroke-dasharray", ("3, 3"));


            // show and style the tooltip
            d3.select("#tooltip") // select tooltip
                .classed("hidden", false)
                .style("left", (coord[0]) + 25 + "px")
                .style("top", (coord[1]) + 25 + "px");
        }

        // event listener for hovering up the line
        // highlights the line without animation
        // shows a tooltip with partial information
        d3.selectAll(".line").on("mouseover", function(d, i){onLine(d, i, this)});

        d3.selectAll(".line").on("mousemove", function(d, i){onLine(d, i, this)});

        // event listener for unhovering up the line
        d3.selectAll(".linepath").on("mouseout", function(d, i){
            d3.select('#tooltip').classed("hidden", true); // hide the tooltip
            d3.select(this).attr("stroke-width", 1.5);  // unhighlight the line
            refLine.html(""); // remove reference line
        });
    }


    /*
    * find the min, max of Year, Count, given wantedList of names
    * for adjusting the scales with each change of data
    * called in updateVis()
    */
    function adjustScale(wanted){
        var maxYear = -1;
        var minYear = 2147483647;
        var maxCount = -1;
        for (i = 0; i < wanted.length; i++){
          var D = doubleList.get(wanted[i].name).get(wanted[i].gender)
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

    /*
    * given a name and a gender, generate a distinct color
    * it is guaranteed that each distinct name has a one-on-one correspondence to a color
    * returned as a string of rgb that can be directly applied as css property
    */
    function giveColor(nom, gen) {
        var colorSum = 0;
        for (i = 0; i <= nom.length - 1; i++){
          var v = dict[nom.charAt(i)];
          if (v >= 26) v -= 26;
          colorSum += v * (1 / Math.pow(26, i + 1));
        }
        // color scale depends on Gender
        if (gen == "F"){
          return d3.interpolateRdPu(colorSum);
        }
        else{
          return d3.interpolateYlGnBu(colorSum);
        }
    }




    /*----------------
    * Part 2: Non-visual
    * Mainly focus on calculation
    ----------------*/

    /*
    * event listener for adding name
    */
    d3.select(".addButton").on("click", function(){
        // alert for greater than 10 names
        if (nameList.length >= 10) {
            alert("Stop pressuring our chart with more than 10 names!");
            return ;
        }

        var nom = document.getElementById("myVal").value; // newly added name
        var gender = document.getElementById("selectGender").value; // newly added gender

        // alert if name does not exist
        if (doubleList.get(nom) == null) {
            alert("This name does not exist!");
            return ;
        }

        // if user adds a name with only one gender
        if (gender != "B"){
            // alert if name duplicates
            for (let i = 0; i < nameList.length; i++) {
                if (nameList[i]["name"] == nom && nameList[i]["gender"] == gender) {
                    alert(gender + " " + nom + " already exists! ");
                    return;
                }
            }

            // alert if a name does not exist
            if (doubleList.get(nom).get(gender) == null) {
                alert(gender + " " + nom + " does not exist!");
                return;
            }

            // updating nameList
            var nameObj = {"name": nom, "gender": gender};
            nameList.push(nameObj);
        }
        // if user adds a name with both gender
        else {
          // if after adding 2 names, the list grows over 10
          if (nameList.length >= 9) {
              alert("You are about to add 2 names by selecting both gender and cause a name overflow");
              return ;
          }

          var nameObjF = {"name": nom, "gender": "F"}; // The female part
          var nameObjM = {"name": nom, "gender": "M"}; // The male part
          var Mexist = true, Fexist = true; // the two booleans indicate whether the name with that gender should be added

          // if the name is not a female name, alert
          if (doubleList.get(nom).get("F") == null) {
              Fexist = false;
              alert("Female" + " " + nom + " does not exist!");
          }

          // if the female version of this name duplicates, alert
          for (let i = 0; i < nameList.length; i++) {
              if (nameList[i]["name"] == nom && nameList[i]["gender"] == "F") {
                  alert("Female" + " " + nom + " already exists! ");
                  Fexist = false;
              }
          }

          // if the name is not a male name, alert
          if (doubleList.get(nom).get("M") == null) {
            Mexist = false;
            alert("Male" + " " + nom + " does not exist!");
          }

          // if the male version of this name duplicates, alert
          for (let i = 0; i < nameList.length; i++) {
              if (nameList[i]["name"] == nom && nameList[i]["gender"] == "M") {
                  alert("Male" + " " + nom + " already exists! ");
                  Mexist = false;
              }
          }

          // update nameList
          if (Fexist) nameList.push(nameObjF);
          if (Mexist) nameList.push(nameObjM);
        }

        // update wanted list according to gender filter
        updateList(currGen);
    });

    /*
    * event listener for changing radio button of filtered gender
    */
    d3.select('#genform').selectAll(".radio").on("change", function(){
        currGen = d3.select(this).property("value");
        updateList(currGen); // update wantedList
    });


    /*
    * return a list according to gender filter
    */
    function filterGen(gender){
        // create subarray with name objects with given gender
        var r = [];
        if (gender == "Both") r = nameList;
        if (gender == "M") r = nestedList.get("M");
        if (gender == "F") r = nestedList.get("F");
        if (r != null) return r;
        else return [];
    }

    /*
    * update wantedList upon each event
    */
    function updateList() {

        nestedList = d3.nest()  // nestedList of nameList
          .key((d) => d["gender"])
          .map(nameList);

        wantedList = filterGen(currGen); // wantedList

        updateVis(wantedList, 1.5);  // update line chart with wantedList and non-highlighted lines

        const selection = d3.select(".selection").select("ul") // append name into info bar (legend)
          .selectAll("li")
          .data(wantedList)
          .style("color", "black");


        newLi = selection.enter()  // enter selection of <li>
          .append("li")
          .style("margin", "7px 0")
          .html(
            ((d, i) => '<button class="del"><i class="fas fa-trash-alt"></i></button><span style="float: left;">' + icon(d["name"], d["gender"]) + '</span>')
          );

        // Correspond the icon color with a unique name
        // should be the same color as correponding line
        function icon(nom, gender) {
            return '<i class="fas fa-user" style="margin-right: 2px; color:' + giveColor(nom, gender) + ';"></i>' + nom + ", " + gender;
        }

        /*??????????????????????????
        * I don't know what I'm doing with this
        * but without it, the enter, exit of <li> won't function properly
        ?????????????????????*/
        selection.html((d, i) => '<button class="del"><i class="fas fa-trash-alt"></i></button><span style="float: left;">' + icon(d["name"], d["gender"]) + '</span>');

        selection.exit().remove(); // remove exit selection

        // event listener for delete button
        // delete name
        d3.selectAll('.del').on("click", function(){
            var toParse = d3.select(this.parentNode).select("span").text();
            var info = toParse.split(", ");  // get the necessary info of the name to delete

            // delete this info in nameList
            for (let i = 0; i < nameList.length; i++) {
                let elem = nameList[i];
                if (elem["name"] == info[0] && elem["gender"] == info[1]) {
                    nameList.splice(i, 1);
                }
            }

            // update wantedList
            updateList();
        });

        // event listener for hover on a <li> of name and gender
        // remove all the other lines with animation
        // highlight this line with animation
        newLi.on("mouseover", function(d, i) {
            d3.select(this).style("background-color", "#f5d8d7");

            // update visualization with only this (name, gender) and highlight
            updateVis([d], 6);

        });

        // event for mouse leaving list and unhighlight
        // add back all the other lines with animation
        // unhighlight this line with animation
        newLi.on("mouseleave", function(d, i) {
            d3.select(this).style("background-color", "transparent");
            updateVis(wantedList, 1.5);
        });

    }

});
