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

d3.csv(url).then((data)=>{
    console.log(data);  
    
    const currGen = "B"; 
    
    const nestedData = d3.nest()
        .key((d) => d["Gender"])
        .key((d) => d["Name"])
        .map(data); 
    
    const x_scale = d3.scaleLinear()
        .range([0, width])
        .domain([1880, 1989]);

    const y_scale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, 4000]); // adjust to scale to max
    
    chart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x_scale));

    chart.append("g")
        .call(d3.axisLeft(y_scale));
    
    /*-----------
    Calculation
    -----------*/
    
    const wantedName = ["Aaisha", "Andre", "Billyjoe"]; 
    
    const nameList = []; 
    
    for (var i = 0; i < wantedName.length; i++) {
        insertName(wantedName[i]); 
    }
    
    // console.log(nameList);  
    /*
    for (var i = 0; i < nameList.length; i++) {
        filtered = getTrend(nameList[i], currGen); 
    
        
        
    }*/
    
    // Attention! Given name and year, sum up all the counts over the same year and the desired gender. 
    
    filtered = getTrend(nameList[1], "E"); 
    console.log(filtered); 
    appendLine(filtered); 
    
    
    function appendLine(filteredData) {
        var line = d3.line()
            .x((d) => x_scale(d["Year"]))
            .y((d) => y_scale(d["Count"])); 
        
        chart.append("path")
            .datum(filteredData)
            .attr("d", line)
            .style("stroke", "blue")
            .style("fill", "none"); 
    }
    
    
    
    
    
    /*---------------
    functions
    ---------------*/
    
    function insertName(nom){
        
        var gen = "unknown"; 
        var isMale = false, isFemale = false; 
        
        if (nestedData.get("M").get(nom) != null) isMale = true; 
        if (nestedData.get("F").get(nom) != null) isFemale = true;   
        
        if (isMale && isFemale) gen = "B"; 
        else if (isMale && !isFemale) gen = "M"; 
        else if (!isMale && isFemale) gen = "F"; 
        else {
            alert("This person is not in record"); 
            return; 
        }
        
        
        var nameOb = {"name": nom, "gender": gen}; 
        
        nameList.push(nameOb); 
        
    }
    
    
    function getTrend(nameOb, genderChoice) {
        var Fpart = nestedData.get("F").get(nameOb["name"]); 
        var Mpart = nestedData.get("M").get(nameOb["name"]);
        
        
        if (genderChoice == "E") {
            if (nameOb["gender"] == "F") return Fpart; 
            else if (nameOb["gender"] == "M") return Mpart; 
            else if (nameOb["gender"] == "B") return Fpart.concat(Mpart); 
        }
        
        else if (genderChoice == "M") {
            if (nameOb["gender"] == "M" || nameOb["gender"] == "B")
                return Mpart; 
            else return []; 
        }
        
        else if (genderChoice == "F") {
            if (nameOb["gender"] == "F" || nameOb["gender"] == "B")
                return Fpart; 
            else return []; 
        }
        
        else if (genderChoice == "B") {
            if (nameOb["gender"] == "B") 
                return Fpart.concat(Mpart); 
            else return []; 
        }
        
    }





}); 