"use strict";

let width = 752;
let height = 580;
let heatmap = d3.select('#heatmap').attr('style', `width: ${width}; height: ${height};`);

let data = JSON.parse(atob(heatmap.attr("data")));
heatmap.attr('data', ""); // clear passed data

console.log(data);

$(document).ready(function() {
    $("#detector-dropdown a").click(function(e) {
        e.preventDefault();
        var detectorName = $(this).attr('data');
        $('#detector-dropdown-group button').text($(this).text());
        $("#detector-dropdown-group button").attr('data', detectorName);
        update(detectorName);
    });
});

function update(name) {
    // $('#test').text(JSON.stringify(data[value], null, 2));
    let detectorValues = data[name];
    updateHeatmap(detectorValues);
}

// Render original image
heatmap.append("svg:image")
    .attr("xlink:href", "../img/main.jpg")
    .attr('class', 'img-fluid');

// Heatmap Color Range
var getColor = d3.scaleSequential()
.interpolator(d3.interpolateInferno)
.domain([1,100]);

// Get data for heatmap overlay
function updateHeatmap(values) {
    // Size scales
    let overlayHeight = Math.abs(values[values.length - 1].coords.y - values[0].coords.y);
    let overlayWidth = Math.abs(values[values.length - 1].coords.x - values[0].coords.x);
    console.log(`overlay dimensions: ${overlayHeight} = h, ${overlayWidth} = w`);

    let xCoords = values.map((value) => {return value.coords.x}).sort();
    let yCoords = values.map((value) => {return value.coords.y}).sort();
    console.log(`overlay coords: x = ${xCoords}, y = ${yCoords}`);

    // X
    var xScale = d3.scaleBand()
    .domain(xCoords)
    .range([overlayWidth, 0])
    .padding(0.4);
    // Y
    var yScale = d3.scaleBand()
    .domain(yCoords)
    .range([0, overlayHeight])
    .padding(0.1)

    heatmap.selectAll('rect')
    .data(values)
    .enter()
    .append("rect")
      .attr("x", function(d) { return d.coords.x })
      .attr("y", function(d) { return d.coords.y })
      .attr("width", xScale.bandwidth() )
      .attr("height", yScale.bandwidth() )
//   .attr('x', d => {
//     return xScale(d.coords.x);
//   })
//   .attr('y', d => {
//     return yScale(d.coords.y);
//   })
//   .attr('width', xScale.bandwidth())
//   .attr('height', yScale.bandwidth())
      .style("fill", function(d) { return getColor(d.relative)} )
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mouseleave", mouseleave);
    
}

    var mouseover = function(d) {
        tooltip
          .style("opacity", 1)
        d3.select(this)
          .style("stroke", "black")
          .style("opacity", 1)
      }
      var mouseleave = function(d) {
        tooltip
          .style("opacity", 0)
        d3.select(this)
          .style("stroke", "none")
          .style("opacity", 0.8)
      }