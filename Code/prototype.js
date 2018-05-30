//Width and height
var w = 1600;
var h = 900;



//Define map projection
			var projection = d3.geoAlbersUsa()
								   .translate([w/2, h/2])
								   .scale([1500]);

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


d3.json("gz_2010_us_050_00_500k.json", function(json){
    svg.selectAll("path")
    .data(json.features)
	.enter()
    .append("path")
    .attr("d", path)
    //.style("fill", "steelblue");
    .style("fill", function(d){
        let rand = Math.round(Math.random() * 5);
        console.log(rand);
        return color(rand);
    });
    
});
        
            

            
			