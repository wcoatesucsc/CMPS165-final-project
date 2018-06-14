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
  */
var margin = {top: 25, right: -900, bottom: 230, left: 1000},
    width = +svg.attr("width") - margin.left - margin.right - 1000,
    height = +svg.attr("height") - margin.top - margin.bottom - 200,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var z = d3.scaleOrdinal()

//.range(['rgb(127,201,127)','rgb(190,174,212)','rgb(253,192,134)','rgb(255,255,153)','rgb(56,108,176)']);
//.range(['rgb(27,158,119)','rgb(217,95,2)','rgb(117,112,179)','rgb(231,41,138)','rgb(102,166,30)']);
//.range(['rgb(251,180,174)','rgb(179,205,227)','rgb(204,235,197)','rgb(222,203,228)','rgb(254,217,166)']);
//.range(['rgb(179,226,205)','rgb(253,205,172)','rgb(203,213,232)','rgb(244,202,228)','rgb(230,245,201)']);
.range(['rgb(228,26,28)','rgb(55,126,184)','rgb(77,175,74)','rgb(152,78,163)']);
//.range(['rgb(102,194,165)','rgb(252,141,98)','rgb(141,160,203)','rgb(231,138,195)','rgb(166,216,84)']);
//.range(['rgb(141,211,199)','rgb(255,255,179)','rgb(190,186,218)','rgb(251,128,114)','rgb(128,177,211)']);



d3.csv("bostockcsv.csv", function(d, i, columns) {
  for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
  d.total = t;
  return d;
}, function(error, data) {
  if (error) throw error;

  var keys = data.columns.slice(1);

  //data.sort(function(a, b) { return b.total - a.total; });
  data.sort(function(a, b) { 
                             if(a.State > b.State) return 1;
                             if(b.State > a.State) return -1;
                             return 0;
                           });
    
  x.domain(data.map(function(d) { return d.State; }));
  y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
  z.domain(keys);

  g.append("g")
    .selectAll("g")
    .data(d3.stack().keys(keys)(data))
    .enter().append("g")
      .attr("fill", function(d) { return z(d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.data.State); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth());

  g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("US Imports ($1000)");

    
    
  var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });
});



/*
  Bostock bar chart over
  */

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
.range(['rgb(237,248,233)','rgb(186,228,179)','rgb(116,196,118)','rgb(49,163,84)','rgb(0,109,44)']);


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
    });
}


d3.csv("all.csv", function(allcsv){
    d3.json("gz_2010_us_050_00_500k_all_employment_for_real.json", function(json){
        
    // Attach the all employment data to each GEOJSON
       
    for(let i = 0; i < allcsv.length; i++){
       
           let employment = allcsv[i].month3_emplvl;
           
           // don't bother adding if employment is 0
           if(employment == 0) continue;
           
           // make each area_fips the same length by adding a leading zero if necessary
           let csv_fips = allcsv[i].area_fips;
           
           // if it's a city, don't bother searching
           if(csv_fips[0] == 'C') continue;
           
           let fips_len = allcsv[i].area_fips.length;
          
           
           if(fips_len < 5){
               csv_fips = ('0' + csv_fips);    
           }
         
           /* check through every feature in the geoJSON to 
              find a matching fips. If the fips matches, add
              the all employment level to the feature's properties
           */
        
	       for (var j = 0; j < json.features.length; j++) {
               
               let properties = json.features[j].properties;
               // if it's a state total don't bother searching
               if(properties.COUNTY == 000) continue;
               
               let json_fips = properties.STATE + properties.COUNTY;
             
               
               
               
               //console.log("json_fips = " + json_fips + "csv_fips = " + csv_fips);
             
               if(json_fips == csv_fips){
                   console.log("Match! json_fips = " + json_fips + " csv_fips = " + csv_fips);
                   console.log("all_employment = " + employment);
                   properties.all_employment = employment;
                   
                   break;
               }
              
               
             /* 
               if(properties.computerselectronics_employment != null || properties.machinery_employment != null || properties.electrical_employment != null){
                   properties.hightech_employment = +0;
                   if (properties.computerselectronics_employment != null) properties.hightech_employment += +properties.computerselectronics_employment;
                   if (properties.machinery_employment!= null) properties.hightech_employment += +properties.machinery_employment;
                   if (properties.electrical_employment!= null) properties.hightech_employment += +properties.electrical_employment;
               }
              */ 
               // look for specific employment in each feature and attach
               // percentage of total employment
               if(properties.steel_employment != null){
                   let steelPercent = (properties.steel_employment / properties.all_employment) * 100;
                   //console.log(properties.all_employment);
                   
                   //console.log("County: " + properties.NAME + " percent steel: " + steelPercent);
                   
                   properties.steel_percent = steelPercent;
               }
               if(properties.aluminum_employment != null){
                   let aluminumPercent = (properties.aluminum_employment / properties.all_employment) * 100;
                   //console.log(properties.all_employment);
                   
                   //console.log("County: " + properties.NAME + " percent aluminum: " + aluminumPercent);
                   
                   properties.aluminum_percent = aluminumPercent;
               }
               if(properties.hightech_employment != null){
                   let hightechPercent = (properties.hightech_employment / properties.all_employment) * 100;
                   //console.log(properties.all_employment);
                   
                   //console.log("County: " + properties.NAME + " percent hightech: " + hightechPercent);
                   
                   properties.hightech_percent = hightechPercent;
               }
               if(properties.pork_employment != null){
                   let porkPercent = (properties.pork_employment / properties.all_employment) * 100;
                   //console.log(properties.all_employment);
                   
                   //console.log("County: " + properties.NAME + " percent pork: " + porkPercent);
                   
                   properties.pork_percent = porkPercent;
               }
               if(properties.oilseed_employment != null){
                   let oilseedPercent = (properties.oilseed_employment / properties.all_employment) * 100;
                   //console.log(properties.all_employment);
                   
                   //console.log("County: " + properties.NAME + " percent oilseed: " + oilseedPercent);
                   
                   properties.oilseed_percent = oilseedPercent;
               }
               if(properties.transportation_employment != null){
                   let transportationPercent = (properties.transportation_employment / properties.all_employment) * 100;
                   //console.log(properties.all_employment);
                   
                   //console.log("County: " + properties.NAME + " percent transportation: " + transportationPercent);
                   
                   properties.transportation_percent = transportationPercent;
               }
           }
    }
       
        console.log(JSON.stringify(json));
    
        
    
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
});





