"use strict";

let width = 752;
let height = 580;

let zoomDefault = 2;
let heatmap = d3.select('#heatmap-svg');

let data = JSON.parse(atob(heatmap.attr("data")));
heatmap.attr('data', ""); // clear passed data

 // Render original image
 var heatmapImage = heatmap.append("svg:image")
 .attr("xlink:href", "../img/main.jpg")
 .attr('class', 'img-fluid');

 // Render heatmap overlay
 var overlay = heatmap.append("svg")
 .attr('class', 'overlay')
 .attr('x', 0)
 .attr('y', 0)


/* Toggles and Controls */

// Detector Selection Dropdown
let detectorSpinner = $("#detector-dropdown-group .spinner-border");
let detectorLabel = $('#detector-dropdown-group button .detector-label');
let detectorButton = $('#detector-dropdown-group button');

$(document).ready(function() {
    $("#detector-dropdown a").click(function(e) {
        e.preventDefault();
        var detectorName = $(this).attr('data');
        detectorLabel.text($(this).text())
            .attr('data', detectorName);
        detectorSpinner.addClass('d-block');
        detectorButton.addClass('disabled');
        setTimeout(function() {
            update(detectorName);
            detectorSpinner.removeClass('d-block');
            detectorButton.removeClass('disabled');
        }, 100);
    });
});

/* Zoom Functionality */
// Zoom and Pan
var zoomSlider = d3.selectAll("#heatmap-zoom-form input")
  .datum({});
var zoomAction = d3.zoom()
.scaleExtent([1, 10])
.translateExtent([[-1 * width, -1 * height], [width, height]])
.extent([[-1 * width, -1 * height], [width, height]])
.on("zoom", function () {
    heatmap.attr("transform", d3.event.transform);
    zoomSlider.property("value", d3.event.transform.k.toFixed(2));
});
heatmap.call(zoomAction);

// Zoom Range Slider
zoomSlider.attr("value", zoomAction.scaleExtent()[0])
  .attr("min", zoomAction.scaleExtent()[0])
  .attr("max", zoomAction.scaleExtent()[1])
  .attr("step", (zoomAction.scaleExtent()[1] - zoomAction.scaleExtent()[0]) / 100)
  .on("input", rangeSlideAction);

function rangeSlideAction(d){
    let zoomLevel = d3.select(this).property("value");
    zoomAction.scaleTo(heatmap, d3.select(this).property("value"));
}

// Zoom Defaults
zoomSlider.property("value", zoomDefault);
zoomAction.scaleTo(heatmap, zoomDefault);


function update(name) {
    // $('#test').text(JSON.stringify(data[value], null, 2));
    let detectorValues = data[name];
    updateHeatmap(detectorValues);
}



// Get data for heatmap overlay
function updateHeatmap(values) {
    
    // Get coordinates as data arrays
    let xCoords = values.map((value) => {return parseFloat(value.coords.x)}).sort();
    let yCoords = values.map((value) => {return parseFloat(value.coords.y)}).sort();
    let absValues = values.map((value) => {return parseFloat(value.absolute)}).sort();
    let relValues = values.map((value) => {return parseFloat(value.relative)}).sort();

    let max = {
        x: d3.max(xCoords),
        y: d3.max(yCoords),
        abs: d3.max(absValues),
        rel: d3.max(relValues)
    };

    let min = {
        x: d3.min(xCoords),
        y: d3.min(yCoords),
        abs: d3.min(absValues),
        rel: d3.min(relValues)
    };
    // console.log(`overlay coords: x = ${xCoords}, y = ${yCoords}`);

    // Overlay Dimensions
    let overlayHeight = Math.abs(yCoords[yCoords.length - 1] - yCoords[0]);
    let overlayWidth = Math.abs(xCoords[xCoords.length - 1] - xCoords[0]);    
    let horizontalCenter = (xCoords[0] + xCoords[xCoords.length - 1]) / 2;
    let verticalCenter = (yCoords[0] + yCoords[yCoords.length - 1]) / 2;
    // console.log(`overlay dimensions: ${overlayHeight} = h, ${overlayWidth} = w`);

    // Heatmap Title
    var title = overlay.append("text")
    .attr("x", horizontalCenter)
    .attr("y", yCoords[0] - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style('fill', 'white')
    .style('font-weight', 'bold')
    .style('stroke', 'black')
    .text(`${data.type.abbreviation} Heatmap`);

    // Heatmap Tooltip 
    var heatmapWrapper = d3.select("#heatmap-wrapper");
    var tooltip = ($("#heatmap-tooltip").length ?  // don't create duplicate tooltip
        d3.select("#heatmap-tooltip")
        :
        heatmapWrapper.append("div")	
        .attr("id", "heatmap-tooltip")				
        .style("display", "none")
    );
    
    
    // Heatmap Color Range
    var getColor = d3.scaleSequential()
    .interpolator(getElementColor(data.type.abbreviation))
    .domain([0, max.rel]);

    // X Scale
    var xScale = d3.scaleBand()
    .domain(xCoords)
    .range([0, overlayWidth])
    .paddingInner(20).paddingOuter(10/2);
    
    // Y Scale
    var yScale = d3.scaleBand()
        .domain(yCoords)
        .range([0, overlayHeight])
        .paddingInner(.2).paddingOuter(.2);

 
    // Legend
    var legendColorScale = d3.scaleSequential(getElementColor(data.type.abbreviation))
    .domain([0, max.rel]);

    if ($("#heatmap-legend").length) { // don't create duplicate legend
    console.log("already heatmap. delete");
        d3.select("#heatmap-legend").remove();
    }
    overlay.append("svg")
        .attr("id", "heatmap-legend");
    continuous("#heatmap-legend", legendColorScale);
    var legend = d3.select("#heatmap-legend")
        .attr('y', overlayHeight + "px")
        .attr('x', (xCoords[0] - 75) + "px");

    // Legend Title
    var title = overlay.append("text")
    .attr("x", (xCoords[0] - 50) + "px")
    .attr("y", overlayHeight + "px")
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style('fill', 'black')
    .style('font-weight', 'bold')
    .style('stroke', 'black')
    .text(`${data.type.abbreviation}_%`);

    // Data Points
    overlay.selectAll('rect')
    .data(values)
    .enter()
    .append("rect")
    .style("class", "heatmap-data")
      .attr("x", function(d) { return parseFloat(d.coords.x) ; })
      .attr("y", function(d) { return parseFloat(d.coords.y); })
      .attr("width", 2.5)
      .attr("height", 2.5)
      .style("fill", function(d) { return getColor(d.relative)} )
      .style("opacity", 0.6) 
      .on("mouseover", function(d) {
            tooltip.html(`<b>X:</b> ${d.coords.x}, <b>Y:</b> ${d.coords.y}<br>
                <b>Relative:</b> ${d.relative}<br>
                <b>Absolute:</b> ${d.absolute}
            `);
            tooltip.style("display", null)
                .style("left", (d3.mouse(heatmapWrapper.node())[0] + 20) + "px") // mouse relative to heatmap
                .style("top", (d3.mouse(heatmapWrapper.node())[1]) + "px")
                .style("background-color", getColor(d.relative));
            if ((d.relative / max.rel) < .80) tooltip.style("color", "black"); // make text easier to see for light color values
            else tooltip.style("color", "white");
            
            d3.select(this).style("fill", function(d) {
                return d3.rgb(getColor(d.relative)).brighter(2);
            })
            .style('opacity', 1);
      })
      .on("mouseout", function(d) { tooltip.style("display", "none"); })
      .on("mouseleave", function(d) { 
            d3.select(this).style("fill", function(d) {
                return getColor(d.relative);
            })
            .style('opacity', .6);
        });
   
}

function multiplier(values, multiplier) {
    let newValues = (old) => {
        Object.keys(old).forEach((key) => {
            old[key].coords.x = old[key].coords.x * multiplier;  
            old[key].coords.y = old[key].coords.y * multiplier; 
        });
        return newValues;
      }
}
