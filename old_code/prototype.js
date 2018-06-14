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
var pieVertOffset = 50;
var pieHorizOffset = 1100;


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


d3.json("GeoJSON/gz_2010_us_050_00_500k.json", function(json){
    svg.selectAll("path")
    .data(json.features)
	.enter()
    .append("path")
    .attr("d", path)
    .style("fill", function(d){
        let rand = Math.round(Math.random() * 5);
        return color(rand);
    });
    
});




// prototype bar chart
//Original data
var stackedBar = true;

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

svg.append("text")
    .attr("x", w/2)
    .attr("y", h - 200)
    .text("Buttons!");
// radio buttons (borrowed from: https://stackoverflow.com/questions/19302318/radio-buttons-in-d3-how-to-align-text-correctly-and-select-a-default?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa)
/*
var labelText = ["hello", "world", "foo", "bar"];
var form = svg.append("form")
var buttonLabels = form.selectAll("label")
                        .data(labelText)
                        .enter()
                        .append("label")
                        .text(function(d){console.log(d); return d;})
                        .insert("input")
                        .attr({
                            type: "radio",
                            class: "shape",
                            name: "mode",
                            value: function(d, i) {return i;},
                            x: barHorizOffset,
                            y: barVertOffset + 300
                        });
                        //.property("checked", function(d, i) {return i===j;});
*/