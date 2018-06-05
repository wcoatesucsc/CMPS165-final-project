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
    
    // Alaska counties are called Boroughs
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

//Define Tooltip here
/* initialize the tooltip so that we can move it around
       later */
/*
var div = d3.select("body").append("div")
.attr("class", "tooltip")
.classed("hidden", true);
*/


// color scale for showing population density appropriately:
// the darker the blue, the higher the population density
// colors from colorbrewer2.org
var color = d3.scaleQuantize()
.domain([0, 10])
.range(['rgb(239,243,255)','rgb(189,215,231)','rgb(107,174,214)','rgb(49,130,189)','rgb(8,81,156)']);


// button input, changes color value depending on clicked button
function updateColorGreen() {
    console.log("update color green")
    var color = d3.scaleQuantize()
    .domain([0, 10])
    .range(['rgb(237,248,233)','rgb(186,228,179)','rgb(116,196,118)','rgb(49,163,84)','rgb(0,109,44)']);

    svg.selectAll("path#map")
    .style("fill", function(d){
        let rand = Math.round(Math.random() * 5);
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
        let rand = Math.round(Math.random() * 5);
        return color(rand);
    })   
}


d3.json("gz_2010_us_050_00_500k.json", function(json){
    svg.selectAll("path")
    .data(json.features)
	.enter()
    .append("path")
    .attr("d", path)
    .attr("id", "map")
    .style("fill", function(d){
        let rand = Math.round(Math.random() * 5);
        return color(rand);
    })
    // tooltips!
    .on("mouseover", function(d){
        var xPosition = (d3.mouse(this)[0]);
        var yPosition = (d3.mouse(this)[1]);
        
        
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




// prototype bar chart
//Original data

var stackedBar = false;

if(stackedBar){
    console.log('using bar chart');
    var barDataset = [
                    { apples: 5, oranges: 10, grapes: 22 },
                  ];

    //Set up stack method
    var stack = d3.stack()
                  .keys([ "apples", "oranges", "grapes" ]);
    //Data, stacked
    var series = stack(barDataset);
    //Set up scales
    var xScale = d3.scaleBand()
                   .domain(d3.range(barDataset.length))
                   .range([0, barWidth])
                   .paddingInner(0.05);

    var yScale = d3.scaleLinear()
                    .domain([0,				
                        d3.max(barDataset, function(d) {
                            return d.apples + d.oranges + d.grapes;
                            })
                        ])
                    .range([0, barHeight]);
			    	
    //Easy colors accessible via a 10-step ordinal scale
    var colors = d3.scaleOrdinal(d3.schemeCategory10);

    // Add a group for each row of data
    var groups = svg.selectAll("g")
                    .data(series)
                    .enter()
                    .append("g")
                    .attr("transform", "translate(" + barHorizOffset + "," + barVertOffset + ")")
    				//.translate([w - mapVertOffset, (h/2) - mapVertOffset])
    				//.translate(w/2, h/2)
                    .style("fill", function(d, i) {
                        return colors(i);
                    });

    // Add a rect for each data value
    var rects = groups.selectAll("rect")
                        .data(function(d) { return d; })
                        .enter()
                        .append("rect")
                        .attr("x", function(d, i) {
                            return xScale(i);
        				})
                        .attr("y", function(d) {
                            return yScale(d[0]);
                        })
                        .attr("height", function(d) {
                            return yScale(d[1]) - yScale(d[0]);
                        })
                        .attr("width", xScale.bandwidth())
    // labels
    rects.append("text")
			    .text(function(d, i) {
                    console.log(d);
                    console.log(i);
                    console.log(d.data.oranges);
                    return "hi";
                });
    
		svg.append("text")
            .attr("x", barHorizOffset)
            .attr("y", barVertOffset - 20)
            .text("Market Share");
    
		svg.append("text")
            .attr("x", barHorizOffset)
            .attr("y", barVertOffset + 300)
            .text("Legend");
}

else{
    console.log("using pie chart");
    
    //var pieDataset = [{name:"US", number: 5}, {name:"China", number: 10}, {name:"World", number: 20}];
    var pieDataset = [5, 10, 20];
    
			var outerRadius = pieRadius;
			var innerRadius = 0;
            var pieHorizTranslate = outerRadius + pieHorizOffset;
            var pieVertTranslate = outerRadius + pieVertOffset;
    
			var arc = d3.arc()
						.innerRadius(innerRadius)
						.outerRadius(outerRadius);
			
			var pie = d3.pie();
			
			//Easy colors accessible via a 10-step ordinal scale
			var pieColor = d3.scaleOrdinal(d3.schemeCategory10);

			//Create SVG element
			//Set up groups
			var arcs = svg.selectAll("g.arc")
						  .data(pie(pieDataset))
						  .enter()
						  .append("g")
						  .attr("class", "arc")
						  .attr("transform", "translate(" + pieHorizTranslate + "," + pieVertTranslate + ")");
    
			
			//Draw arc paths
			arcs.append("path")
			    .attr("fill", function(d, i) {
			    	return pieColor(i);
			    })
			    .attr("d", arc);
			
			//Labels
			arcs.append("text")
			    .attr("transform", function(d) {
			    	return "translate(" + arc.centroid(d) + ")";
			    })
			    .attr("text-anchor", "middle")
			    .text(function(d, i) {
                    console.log(i);
                    var name;
                    if(i == 0) name = "US";
                    else if (i == 1) name = "China";
                    else name = "World";
			    	return name + " " + d.value;
			    });
    
		svg.append("text")
            .attr("x", barHorizOffset)
            .attr("y", barVertOffset - 20)
            .text("Market Share");
    
		svg.append("text")
            .attr("x", pieHorizOffset + pieRadius)
            .attr("y", pieVertOffset + 300)
            .text("Legend");
}