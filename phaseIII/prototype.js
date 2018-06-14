// canvas and positioning magic numbers
const w = 1600;
const h = 800;
// map magic numbers
const projectionScale = 1250;
const mapVertOffset = 100;
const mapHorizOffset = 300;
// bar chart magic numbers
const barWidth = 50;
const barHeight = 250;
const barVertOffset = 50;
const barHorizOffset = 1200;
// pie chart magic numbers
const pieRadius = 125;
const pieVertOffset = 150;
const pieHorizOffset = 1250;
// tooltip magic numbers
const tooltipXOffset = 20;
const tooltipYOffset = 225;

// percent vs raw numbers
var raw = true;

// US states indexed by GeoJSON number
// NOTE: It doesn't go 01-50, it goes 01, 02, 04(!), 05, 06, 08(!)... for some reason,
// until "STATE":"72"
const states = {
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
/*===============================================================
 *   Mike Bostock's stacked Bar Chart example: 
 *   https://bl.ocks.org/mbostock/3886208
 *===============================================================*/
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
.domain(['China','Canada','Brazil','Mexico','Korea','Russia','Germany','United Arab Em','Bahrain','Japan','Hong Kong','Indonesia','All other']) 
//.range(['rgb(256,80,50,1.0)','rgb(86, 41, 74,0.4)','rgb(128, 153, 108,0.6)','rgb(127, 109, 70,0.50)','rgb(8, 48, 107,0.4)','rgb(31, 80, 130,0.35)','rgb(146, 176, 207,0.6)','rgb(185, 127, 0,0.45)','rgb(128, 173, 108,0.4)','rgb(41, 90, 44,0.4)','rgb(125, 125, 35,0.6)','rgb(183, 141, 71,0.5)','rgb(169, 169, 169,0.6)'])
.range(['red','rgb(106, 61, 154, 0.5)','rgb(178, 223, 138, 0.4)','rgb(177, 89, 40, 0.25)','rgb(8, 48, 107, 0.4)','rgb(31, 120, 180, 0.4)','rgb(166, 206, 227, 0.4)','rgb(255, 127, 0, 0.4)','rgb(202, 178, 214, 0.4)','rgb(51, 160, 44, 0.4)','rgb(255, 255, 51, 0.4)','rgb(253, 191, 111, 0.4)','rgb(169, 169, 169)']);


function drawBarChart(commodity){
    // clear old bar chart
    svg.selectAll("rect").remove();
    svg.selectAll("g.axis").remove();
    svg.selectAll("g.legend").remove();
    svg.selectAll("text.legend").remove();
  
   // customize the path to the data file based on the input commodity 
    let filename = "../Data/";
    if(commodity == "steel"){
        filename += "US_Imports/Steel_Items_Tariffed/steel_display_transposed.csv";
    }
    else if(commodity == "aluminum"){
        filename += "US_Imports/Aluminum_Items_Tariffed/aluminum_display_transposed.csv";
    }
    else if(commodity == "high tech"){
        filename += "US_Imports/High_Tech_85_Items_Tariffed/85Data_display_transpose.csv";
    }
    else if(commodity == "pork"){
        filename += "US_Exports/pork/pork_display_transposed.csv";
    }
    else if(commodity == "soybeans"){
        filename += "US_Exports/oilseed/oilseed_display_transpose.csv";
    }
    else if(commodity == "transportation"){
        filename += "US_Exports/transportation/trans_display_transposed.csv";
    }
    else{
        console.log("somehow you selected a commodity that we haven't graphed");
        return;
    }
//    d3.csv("../Data/US_Imports/Steel_Items_Tariffed/steel_display_transposed.csv", function(d, i, columns){
  d3.csv(filename, function(d, i, columns){
        // sums up the values in each column to determine yScale later
      for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]]/1000000000;
//      for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
      d.total = t;
      return d;
    
    }, function(error, data){
    
      if (error) throw error;

   
      var keys = data.columns.slice(1);
    
      console.log(keys);

      barChartX.domain(data.map(function(d) { /*console.log("mapping: " + d.country);*/ return d.country.substring(5); }));
    
      barChartY.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
    

      g.append("g")
        .selectAll("g")
        .data(d3.stack().keys(keys)(data))
        .enter().append("g")
          .attr("fill", function(d) { return barChartColor(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
          .attr("x", function(d) { return barChartX(d.data.country.substring(5)); })
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

      var importExport = "";
      if(commodity == "steel" || commodity == "aluminum" || commodity == "high tech"){
          importExport = "Imports";
      }
      else{
          importExport = "Exports";
      }
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
          .text("US " + importExport + " (in billion dollars)");

    
    
      var barChartLegend = g.append("g")
          .attr("class", "legend")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .attr("text-anchor", "end")
          .attr("transform", "translate(80, 0)")
        .selectAll("g")
        .data(keys.slice())
        .enter().append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      barChartLegend.append("rect")
          .attr("class", "legend")
          .attr("x", width - 19)
          .attr("width", 19)
          .attr("height", 19)
          .attr("fill", barChartColor);

      barChartLegend.append("text")
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
    radioUpdate();

    // update bar chart
    drawBarChart("steel");
    updateGeomap("steel")
}
function updateAluminum(){
    console.log("update aluminum");
    radioUpdate();

    drawBarChart("aluminum");
    updateGeomap("aluminum")
}
function updateHighTech(){
    console.log("update high tech");
    radioUpdate();

    drawBarChart("high tech");
    updateGeomap("high tech")
}
function updatePork(){
    console.log("update pork");
    radioUpdate();

    drawBarChart("pork");
    updateGeomap("pork")
}
function updateSoybeans(){
    console.log("update Soybeans");
    radioUpdate();

    drawBarChart("soybeans");
    updateGeomap("soybeans")
}
function updateTransportation(){
    console.log("update transportation");
    radioUpdate();

    drawBarChart("transportation");
    updateGeomap("transportation")
}


// radio button input, changes value of commodity string based on selected button
// value is Steel by default
var commodity = "Pork";

$("#commodity").hide().html(commodity).fadeIn('fast');

function radioUpdate() {
    d3.selectAll("input[name='commodity']").on("change", function(){
        commodity = this.value;
        console.log("commodity = " + commodity);
        $("#commodity").hide().html(commodity+" employment by county").fadeIn('slow');
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







var color = d3.scaleQuantize()
.domain([0, 10])
//.range(['rgb(237,248,233)','rgb(186,228,179)','rgb(116,196,118)','rgb(49,163,84)','rgb(0,109,44)']);
.range(['rgb(186,228,179)','rgb(116,196,118)','rgb(49,163,84)','rgb(0,109,44)']);

function drawGeomap(commodity){

    // clear old geomap
    svg.selectAll("path").remove();
    
    
    var field="";
    var percent = "";
    var positive = false;

    if(commodity == "steel"){
      field="steel_employment"
      percent="steel_percent"
      positive = true;
    }
    else if(commodity == "aluminum"){
      field="aluminum_employment"
      percent="aluminum_percent"
      positive = true;
    }
    else if(commodity == "high tech"){
      field="hightech_employment"
      percent="hightech_percent"
      positive = true;
    }
    else if(commodity == "pork"){
      field="pork_employment"
      percent="pork_percent"
      positive = false;
    }
    else if(commodity == "soybeans"){
      field="oilseed_employment"
      percent="oilseed_percent"
      positive = false;
    }
    else if(commodity == "transportation"){
      field="transportation_employment"
      percent="transportation_percent"
      positive = false;
    }
    else{
        console.log("somehow you selected a commodity that we haven't graphed");
        return;
    }

    // if positive impact, make green
    // if negative impact, make red
    if(positive){
      color.range(['rgb(186,228,179)','rgb(116,196,118)','rgb(49,163,84)','rgb(0,109,44)'])
    }else{
      color.range(['rgb(252,174,145)','rgb(251,106,74)','rgb(222,45,38)','rgb(165,15,21)'])
    }

  d3.json("gz_2010_us_050_00_500k_all_employment_percent_aggregated.json", function(json){
    values = [];
    var min = 0;
    var max = 0;
    for (var i = 0; i < json.features.length; i++) {
        if(typeof json.features[i].properties[field] !== "undefined"){
          //console.log(json.features[i].properties[field]);
          if(raw){
              values.push(json.features[i].properties[field])
          }
          else{
              values.push(json.features[i].properties[percent])
          }
        }
     }

    min = Math.min.apply(null, values)
    max = Math.max.apply(null, values)
   /*  
    console.log("commodity = " + commodity);
    console.log("min= "+min)
    console.log("max= "+max)
    */
    // reset domain of scale
    color.domain([min, max]);

      svg.selectAll("path#map")
      .data(json.features)
  	  .enter()
      .append("path")
      .attr("d", path)
      .attr("id", "map")
      .style("fill", function(d){
          //console.log("filling, d.properties[field] = " + d.properties[field]);    
          //let rand = Math.round(Math.random() * 10);
          // if no data, then color grey
          if(d.properties[field] == undefined){
              return "rgb(0, 0, 0)";
          }
          else{
              if(raw){
                  return color(d.properties[field]);
              }
              else{
                  return color(d.properties[percent]);
              }
          }
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
            .text(generateTooltipHeader(d.properties.NAME, d.properties.STATE))

            // tooltip values for # workers and % of workforce
            if(d.properties[field] == undefined){
              $('#workers').empty().append(0)
              $('#percent').empty().append(0) 
            }else{
              $('#workers').empty().append(d.properties[field])
              $('#percent').empty().append(d.properties[percent].toFixed(2)+"%")
            }
          
          //Show the tooltip
          d3.select("#tooltip").classed("hidden", false);
      })
      .on("mouseout", function(){
          //Hide the tooltip
          d3.select("#tooltip").classed("hidden", true);
      });
     
  });
    
            var geomapLegend = d3.select('svg')
                       .append('g')
                       .selectAll('g')
                       .data(color.range())
                       .enter()
                       .append('g')
                       .attr('class', 'legend')
                       .text("hi there")
                       .attr('transform', function(d, i){
                           var height = 30;
                           var x = 900;
                           var y = i * height;
                           return 'translate(' + x + ',' + (y + 400) + ')';
                       });
            // append a rectangle for each color in the range
            geomapLegend.append('rect')
                    .attr('width', 20)
                    .attr('height', 20)
                    .style('fill', function(d){ return d; })
                    .style('stroke', color);
            // append labels for each color rectangle
            geomapLegend.append('text')
                    .attr('x', 25)
                    .attr('y', 16)
                    .text(function(d, i){ 
                    // I had to make a "manual" color scale. 
                    // The quantized scale put almost all regions in the 
                    // lowest bucket because Copenhagen is such an
                    // outlier, so I made custom ranges for each color
                    var ranges = ["1-2", "3-5", "6-10", "11-20"];
                        return ranges[i] + " %";
                    });
}

/* 
 * Instead of redrawing the entire geomap, just 
 * refill the paths with colors based on the new commodity
 */
function updateGeomap(commodity){

    var field="";
    var percent = "";
    var positive = false;
    
    if(commodity == "steel"){
      field="steel_employment"
      percent="steel_percent"
      positive = true;
    }
    else if(commodity == "aluminum"){
      field="aluminum_employment"
      percent="aluminum_percent"
      positive = true;
    }
    else if(commodity == "high tech"){
      field="hightech_employment"
      percent="hightech_percent"
      positive = true;
    }
    else if(commodity == "pork"){
      field="pork_employment"
      percent="pork_percent"
      positive = false;
    }
    else if(commodity == "soybeans"){
      field="oilseed_employment"
      percent="oilseed_percent"
      positive = false;
    }
    else if(commodity == "transportation"){
      field="transportation_employment"
      percent="transportation_percent"
      positive = false;
    }
    else{
        console.log("somehow you selected a commodity that we haven't graphed");
        return;
    }

    if(positive){
      color.range(['rgb(186,228,179)','rgb(116,196,118)','rgb(49,163,84)','rgb(0,109,44)'])
    }else{
      color.range(['rgb(252,174,145)','rgb(251,106,74)','rgb(222,45,38)','rgb(165,15,21)'])
    }

  d3.json("gz_2010_us_050_00_500k_all_employment_percent_aggregated.json", function(json){
    values = [];
    var min = 0;
    var max = 0;
    for (var i = 0; i < json.features.length; i++) {
        if(typeof json.features[i].properties[field] !== "undefined"){
          if(raw){
              values.push(json.features[i].properties[field])
          }
          else{
              values.push(json.features[i].properties[percent])
          }
        }
     }
    // calculate the min/max of input to re-scale
    min = Math.min.apply(null, values);
    max = Math.max.apply(null, values);
      
    // reset domain of scale
    color.domain([min, max]);

      
      // re-fill the paths
      svg.selectAll("path#map")
      .data(json.features)
      .style("fill", function(d){
          if(d.properties[field] == undefined){
              // if no data for a county, paint it black
              return "rgb(0, 0, 0)";
          }
          else{
              // otherwise, fill it with an appropriate color
              if(raw){
                  return color(d.properties[field]);
              }
              else{
                  return color(d.properties[percent]);
              }
          }
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
            .text(generateTooltipHeader(d.properties.NAME, d.properties.STATE))

            // tooltip values for # workers and % of workforce
            if(d.properties[field] == undefined){
              $('#workers').empty().append(0)
              $('#percent').empty().append(0) 
            }else{
              $('#workers').empty().append(d.properties[field])
              $('#percent').empty().append(d.properties[percent].toFixed(2)+"%")
            }
          
          //Show the tooltip
          d3.select("#tooltip").classed("hidden", false);
      })
      .on("mouseout", function(){
          //Hide the tooltip
          d3.select("#tooltip").classed("hidden", true);
      });
  });
    

            var geomapLegend = d3.select('svg')
                       .append('g')
                       .selectAll('g')
                       .data(color.range())
                       .enter()
                       .append('g')
                       .attr('class', 'legend')
                       .text("hi there")
                       .attr('transform', function(d, i){
                           var height = 30;
                           var x = 900;
                           var y = i * height;
                           return 'translate(' + x + ',' + (y + 400) + ')';
                       });
            // append a rectangle for each color in the range
            geomapLegend.append('rect')
                    .attr('width', 20)
                    .attr('height', 20)
                    .style('fill', function(d){ return d; })
                    .style('stroke', color);
            // append labels for each color rectangle
            geomapLegend.append('text')
                    .attr('x', 25)
                    .attr('y', 16)
                    .text(function(d, i){ 
                    // I had to make a "manual" color scale. 
                    // The quantized scale put almost all regions in the 
                    // lowest bucket because Copenhagen is such an
                    // outlier, so I made custom ranges for each color
                    var ranges = ["1-2", "3-5", "6-10", "11-20"];
                        return ranges[i] + " %";
                    });

}
// draw the map for the first time!
drawGeomap('pork');

/*==================================================================
 * setting up annotations:
 * by Susie Lu: http://d3-annotation.susielu.com/
 *=================================================================*/
const type = d3.annotationLabel;

const annotations = [
        {
          note: {
            label: "Basic settings with subject position(x,y) and a note offset(dx, dy)",
            title: "d3.annotationLabel"
          },
          x: 50,
          y: 150,
          dy: 137,
          dx: 162
        },{
          note: {
            label: "Added connector end 'arrow', note wrap '180', and note align 'left'",
            title: "d3.annotationLabel",
            wrap: 150,
            align: "left"
          },
          connector: {
            end: "arrow" // 'dot' also available
          },
          x: 170,
          y: 150,
          dy: 137,
          dx: 162
        },{
          note: {
            label: "Changed connector type to 'curve'",
            title: "d3.annotationLabel",
            wrap: 150
          },
          connector: {
            end: "dot",
            type: "curve",
            //can also add a curve type, e.g. curve: d3.curveStep
            points: [[100, 14],[190, 52]]
          },
          x: 350,
          y: 150,
          dy: 137,
          dx: 262
        },{
          //below in makeAnnotations has type set to d3.annotationLabel
          //you can add this type value below to override that default
          type: d3.annotationCalloutCircle,
          note: {
            label: "A different annotation type",
            title: "d3.annotationCalloutCircle",
            wrap: 190
          },
          //settings for the subject, in this case the circle radius
          subject: {
            radius: 50
          },
          x: 620,
          y: 150,
          dy: 137,
          dx: 102
        }].map(function(d){ d.color = "#E8336D"; return d})

        const makeAnnotations = d3.annotation()
          .type(d3.annotationLabel)
          .annotations(annotations)

        d3.select("svg")
          .append("g")
          .attr("class", "annotation-group")
          .call(makeAnnotations)

