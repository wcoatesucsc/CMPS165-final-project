// canvas and positioning magic numbers
var w = 1600;
var h = 800;
// map magic numbers
var projectionScale = 1250;
var mapVertOffset = 100;
var mapHorizOffset = 300;
// bar chart magic numbers
var barWidth = 50;
var barHeight = 250;
var barVertOffset = 50;
var barHorizOffset = 1200;
// pie chart magic numbers
var pieRadius = 125;
var pieVertOffset = 150;
var pieHorizOffset = 1250;
// tooltip magic numbers
var tooltipXOffset = 0;
var tooltipYOffset = 250;

// US states indexed by GeoJSON number
// NOTE: It doesn't go 01-50, it goes 01, 02, 04(!), 05, 06, 08(!)... for some reason,
// until "STATE":"72"
var states = {
    "01": "Alabama",
    "02": "Alaska",
    "04": "Arizona",
    "05": "Arkansas",
    "06": "California",
    "08": "Colorado",
    "09": "Connecticut",
    "10": "Delaware",
    "11": "District of Columbia",
    "12": "Florida",
    "13": "Georgia",
    "15": "Hawaii",
    "16": "Idaho",
    "17": "Illinois",
    "18": "Indiana",
    "19": "Iowa",
    "20": "Kansas",
    "21": "Kentucky",
    "22": "Louisiana",
    "23": "Maine",
    "24": "Maryland",
    "25": "Massachusetts",
    "26": "Michigan",
    "27": "Minnesota",
    "28": "Mississippi",
    "29": "Missouri",
    "30": "Montana",
    "31": "Nebraska",
    "32": "Nevada",
    "33": "New Hampshire",
    "34": "New Jersey",
    "35": "New Mexico",
    "36": "New York",
    "37": "North Carolina",
    "38": "North Dakota",
    "39": "Ohio",
    "40": "Oklahoma",
    "41": "Oregon",
    "42": "Pennsylvania",
    "44": "Rhode Island",
    "45": "South Carolina",
    "46": "South Dakota",
    "47": "Tennessee",
    "48": "Texas",
    "49": "Utah",
    "50": "Vermont",
    "51": "Virginia",
    "53": "Washington",
    "54": "West Virginia",
    "55": "Wisconsin",
    "56": "Wyoming",
    "72": "Puerto Rico",
}


function generateTooltipHeader(countyName, stateNum){
    
    // look up state and county name for feature
    let header = countyName;
    
    // Alaska counties are sometimes called Boroughs, sometimes Census Areas, etc.
    // Should expand to 
    if(stateNum == "02"){
        header += " Borough, ";
    }
    // Louisiana counties are called Parishes
    else if(stateNum == "22"){
        header += " Parish, ";
    }
    else if(stateNum != "11"){
        header += " County, ";
    }
    // District of Columbia shouldn't read
    // "District of Columbia, District of Columbia"
    
    if(stateNum != "11"){
        header += states[stateNum];
    }
   
    return header;
}
//Define map projection
var projection = d3.geoAlbersUsa()
				   .translate([(w/2) - mapHorizOffset, (h/2) - mapVertOffset])
				   .scale([projectionScale]);

//Define path generator
var path = d3.geoPath()
             .projection(projection);

//Create SVG element
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);


/*
  Mike Bostock's stacked Bar Chart example: 
  https://bl.ocks.org/mbostock/3886208
  */
var margin = {top: 25, right: -900, bottom: 230, left: 1000},
    width = +svg.attr("width") - margin.left - margin.right - 1000,
    height = +svg.attr("height") - margin.top - margin.bottom - 200,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var barChartX = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1);

var barChartY = d3.scaleLinear()
    .rangeRound([height, 0]);

var barChartColor = d3.scaleOrdinal()
//.range(['rgb(152,78,163)','rgb(55,126,184)','rgb(228,26,28)','rgb(77,175,74)']);
.range(['rgb(228,26,28, 1.0)','rgb(55,126,184, 0.5)','rgb(77,175,74, 0.5)','rgb(152,78,163, 0.5)','rgb(255,127,0, 0.5)','rgb(169, 169, 169, 0.5)']);

function drawBarChart(commodity){
   
    //let commodity = "steel";
    let path = "../Data/US_Imports/";
    
    if(commodity == "steel"){
        path += "Steel_Items_Tariffed/steel_display_transposed.csv";
    }
    
    
//    d3.csv("../Data/US_Imports/Steel_Items_Tariffed/steel_display_transposed.csv", function(d, i, columns){
d3.csv(path, function(d, i, columns){
        // sums up the values in each column to determine yScale later
      for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
      d.total = t;
      return d;
    
    }, function(error, data){
    
      if (error) throw error;

   
      var keys = data.columns.slice(1);
    
      console.log(keys);

      barChartX.domain(data.map(function(d) { console.log("mapping: " + d.country); return d.country; }));
    
      barChartY.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
    
      barChartColor.domain(keys);

      g.append("g")
        .selectAll("g")
        .data(d3.stack().keys(keys)(data))
        .enter().append("g")
          .attr("fill", function(d) { return barChartColor(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
          .attr("x", function(d) { return barChartX(d.data.country); })
          .attr("y", function(d) { return barChartY(d[1]); })
          .attr("height", function(d) { return barChartY(d[0]) - barChartY(d[1]); })
          .attr("width", barChartX.bandwidth());

      g.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(barChartX))
        // rotate text: from a block by d3noob:
        // https://bl.ocks.org/d3noob/3c040800ff6457717cca586ae9547dbf
          .selectAll("text")
          .attr("class", "axis")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)");

      g.append("g")
          .attr("class", "axis")
          .call(d3.axisLeft(barChartY).ticks(null, "s"))
        .append("text")
          .attr("x", 2)
          .attr("y", barChartY(barChartY.ticks().pop()) + 0.5)
          .attr("dy", "0.32em")
          .attr("fill", "#000")
          .attr("font-weight", "bold")
          .attr("text-anchor", "start")
          .text("US Imports ($)");

    
    
      var legend = g.append("g")
          .attr("class", "legend")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .attr("text-anchor", "end")
          .attr("transform", "translate(50, 0)")
        .selectAll("g")
        .data(keys.slice())
        .enter().append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
          .attr("class", "legend")
          .attr("x", width - 19)
          .attr("width", 19)
          .attr("height", 19)
          .attr("fill", barChartColor);

      legend.append("text")
          .attr("class", "legend")
          .attr("x", width - 24)
          .attr("y", 9.5)
          .attr("dy", "0.32em")
          .text(function(d) { return d; });
    });

}

/*=======================================================================
 *
 * Radio Button Functionality
 *
 *=====================================================================*/

/*
 Functions for when each radio button is called
 */
function updateSteel(){
    console.log("update steel");
    // update geomap
    updateColorGreen();
    // update bar chart
    svg.selectAll("rect").remove();
    svg.selectAll("g.axis").remove();
    svg.selectAll("g.legend").remove();
    svg.selectAll("text.legend").remove();
    drawBarChart("steel");
}
function updateAluminum(){
    console.log("update aluminum");
    updateColorGreen();
}
function updateHighTech(){
    console.log("update high tech");
    updateColorGreen();
}
function updatePork(){
    console.log("update pork");
    updateColorRed();
}
function updateSoybeans(){
    console.log("update Soybeans");
    updateColorRed();
}
function updateTransportation(){
    console.log("update transportation");
    updateColorRed();
}

// button input, changes color value depending on clicked button
function updateColorGreen() {
    console.log("update color green")
    var color = d3.scaleQuantize()
    .domain([0, 10])
    .range(['rgb(237,248,233)','rgb(186,228,179)','rgb(116,196,118)','rgb(49,163,84)','rgb(0,109,44)']);

    svg.selectAll("path#map")
    .style("fill", function(d){
        let rand = Math.round(Math.random() * 10);
        return color(rand);
    })
}

function updateColorRed() {
    console.log("update color red")
    var color = d3.scaleQuantize()
    .domain([0, 10])
    .range(['rgb(254,229,217)','rgb(252,174,145)','rgb(251,106,74)','rgb(222,45,38)','rgb(165,15,21)']);
    
    svg.selectAll("path#map")
    .style("fill", function(d){
        let rand = Math.round(Math.random() * 10);
        return color(rand);
    })   
}

// radio button input, changes value of commodity string based on selected button
// value is Steel by default
var commodity = "Steel";


function radioUpdate() {
    d3.selectAll("input[name='commodity']").on("change", function(){
        var commodity = this.value;
        console.log("commodity = " + commodity);
    });
}


/*=======================================================================
 *
 * Bar Chart
 *
 *=====================================================================*/
drawBarChart("steel");

/* =====================================================================
    BAR CHART ALL ABOVE THIS POINT
    GEOMAP ALL BELOW THIS POINT
*
*
*
*
*
*
*
*
   ====================================================================*/







// color scale for showing population density appropriately:
// the darker the blue, the higher the population density
// colors from colorbrewer2.org
var color = d3.scaleQuantize()
.domain([0, 10])
.range(['rgb(237,248,233)','rgb(186,228,179)','rgb(116,196,118)','rgb(49,163,84)','rgb(0,109,44)']);



d3.json("gz_2010_us_050_00_500k_all_employment.json", function(json){
    svg.selectAll("path")
    .data(json.features)
	.enter()
    .append("path")
    .attr("d", path)
    .attr("id", "map")
    .style("fill", function(d){
        let rand = Math.round(Math.random() * 10);
        return color(rand);
    })
    // tooltips!
    .on("mouseover", function(d){
        var xPosition = (d3.mouse(this)[0] + tooltipXOffset);
        var yPosition = (d3.mouse(this)[1] + tooltipYOffset);
        
        
        //Update the tooltip position and value
        d3.select("#tooltip")
          .style("left", xPosition + "px")
          .style("top", yPosition + "px")
          .select("#tooltipheader")
          //.text(d.properties.NAME + " County, ")
          .text(generateTooltipHeader(d.properties.NAME, d.properties.STATE));
        
        //Show the tooltip
        d3.select("#tooltip").classed("hidden", false);
    })
    .on("mouseout", function(){
        //Hide the tooltip
        d3.select("#tooltip").classed("hidden", true);
    });
   
});



