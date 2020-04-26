"use strict";

var width = 752;
var height = 580;
var heatmap = d3.select('#heatmap').attr('style', "width: ".concat(width, "; height: ").concat(height, ";"));
var data = JSON.parse(atob(heatmap.attr("data")));
heatmap.attr('data', ""); // clear passed data

$(document).ready(function () {
  $("#detector-dropdown a").click(function (e) {
    e.preventDefault();
    var detectorName = $(this).attr('data');
    $('#detector-dropdown-group button').text($(this).text());
    $("#detector-dropdown-group button").attr('data', detectorName);
    update(detectorName);
  });
});

function update(name) {
  // $('#test').text(JSON.stringify(data[value], null, 2));
  var detectorValues = data[name];
  updateHeatmap(detectorValues);
} // Render original image


heatmap.append("svg:image").attr("xlink:href", "../img/main.jpg").attr('class', 'img-fluid'); // Heatmap Color Range

var getColor = d3.scaleSequential().interpolator(d3.interpolateInferno).domain([1, 100]); // Get data for heatmap overlay

function updateHeatmap(values) {
  // Size scales
  var overlayHeight = Math.abs(values[values.length - 1].coords.y - values[0].coords.y);
  var overlayWidth = Math.abs(values[values.length - 1].coords.x - values[0].coords.x);
  console.log("overlay dimensions: ".concat(overlayHeight, " = h, ").concat(overlayWidth, " = w"));
  var xCoords = values.map(function (value) {
    return value.coords.x;
  }).sort();
  var yCoords = values.map(function (value) {
    return value.coords.y;
  }).sort();
  console.log("overlay coords: x = ".concat(xCoords, ", y = ").concat(yCoords)); // X

  var xScale = d3.scaleBand().domain(xCoords).range([overlayWidth, 0]).padding(0.4); // Y

  var yScale = d3.scaleBand().domain(yCoords).range([0, overlayHeight]).padding(0.1);
  d3.select("#heatmap").append("text").attr("x", overlayWidth / 2).attr("y", 0).attr("text-anchor", "middle").style("font-size", "20px").style('fill', 'white').text("Heatmap");
  d3.select("#heatmap").selectAll('rect').data(values).enter().append("rect").attr("x", function (d) {
    return d.coords.x;
  }).attr("y", function (d) {
    return d.coords.y;
  }).attr("width", xScale.bandwidth()).attr("height", yScale.bandwidth()).style("fill", function (d) {
    return getColor(d.absolute);
  }).style("stroke-width", 4).style("stroke", "none").style("opacity", 0.8).append("text").attr("text-anchor", "middle").attr("transform", "translate(" + 10 / 2 + "," + 5 / 2 + ")rotate(-90)").text(function (d) {
    return d.absolute;
  });
}