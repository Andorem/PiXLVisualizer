"use strict";

var width = 752;
var height = 580;
var scaleMultiplier = 1.5;
var heatmap = d3.select('#heatmap-svg'); //.attr('transform', `scale(${scaleMultiplier})`);

var data = JSON.parse(atob(heatmap.attr("data")));
heatmap.attr('data', ""); // clear passed data
// Render original image

var heatmapImage = heatmap.append("svg:image").attr("xlink:href", "../img/main.jpg").attr('class', 'img-fluid'); // Render heatmap overlay

var overlay = heatmap.append("svg").attr('class', 'overlay').attr('x', 0).attr('y', 0); // Zoom and pan

heatmap.call(d3.zoom().scaleExtent([1, 10]).translateExtent([[0, 0], [width, height]]).extent([[0, 0], [width, height]]).on("zoom", function () {
  heatmap.attr("transform", d3.event.transform);
})); // Detector Selection Dropdown

var spinner = $("#detector-dropdown-group .spinner-border");
$(document).ready(function () {
  $("#detector-dropdown a").click(function (e) {
    e.preventDefault();
    var detectorName = $(this).attr('data');
    $('#detector-dropdown-group button').text($(this).text());
    $("#detector-dropdown-group button").attr('data', detectorName);
    spinner.attr('display', 'block');
    setTimeout(function () {
      update(detectorName);
      spinner.attr('display', 'none');
    }, 100);
  });
});

function update(name) {
  // $('#test').text(JSON.stringify(data[value], null, 2));
  var detectorValues = data[name];
  updateHeatmap(detectorValues);
} // Get data for heatmap overlay


function updateHeatmap(values) {
  // Get coordinates as data arrays
  var xCoords = values.map(value => {
    return parseFloat(value.coords.x);
  }).sort();
  var yCoords = values.map(value => {
    return parseFloat(value.coords.y);
  }).sort();
  var absValues = values.map(value => {
    return parseFloat(value.absolute);
  }).sort();
  var relValues = values.map(value => {
    return parseFloat(value.relative);
  }).sort();
  var max = {
    x: d3.max(xCoords),
    y: d3.max(yCoords),
    abs: d3.max(absValues),
    rel: d3.max(relValues)
  };
  var min = {
    x: d3.min(xCoords),
    y: d3.min(yCoords),
    abs: d3.min(absValues),
    rel: d3.min(relValues)
  }; // console.log(`overlay coords: x = ${xCoords}, y = ${yCoords}`);
  // Overlay Dimensions

  var overlayHeight = Math.abs(yCoords[yCoords.length - 1] - yCoords[0]);
  var overlayWidth = Math.abs(xCoords[xCoords.length - 1] - xCoords[0]);
  var horizontalCenter = (xCoords[0] + xCoords[xCoords.length - 1]) / 2;
  var verticalCenter = (yCoords[0] + yCoords[yCoords.length - 1]) / 2; // console.log(`overlay dimensions: ${overlayHeight} = h, ${overlayWidth} = w`);
  // Heatmap Title

  var title = overlay.append("text").attr("x", horizontalCenter).attr("y", yCoords[0] - 10).attr("text-anchor", "middle").style("font-size", "20px").style('fill', 'white').style('font-weight', 'bold').style('stroke', 'black').text("".concat(data.type.abbreviation, " Heatmap")); // Heatmap Tooltip 

  var heatmapWrapper = d3.select("#heatmap-wrapper");
  var tooltip = $("#heatmap-tooltip").length ? // don't create duplicate legend
  d3.select("#heatmap-tooltip") : heatmapWrapper.append("div").attr("id", "heatmap-tooltip").style("display", "none"); // Heatmap Color Range

  var getColor = d3.scaleSequential().interpolator(d3.interpolateMagma).domain([0, max.rel]); // X Scale

  var xScale = d3.scaleBand().domain(xCoords).range([0, overlayWidth]).paddingInner(20).paddingOuter(10 / 2); // Y Scale

  var yScale = d3.scaleBand().domain(yCoords).range([0, overlayHeight]).paddingInner(.2).paddingOuter(.2); // Legend

  var legendColorScale = d3.scaleSequential(d3.interpolateMagma).domain([0, max.rel]);
  var legend = overlay.append("svg").attr("id", "heatmap-legend");
  continuous("#heatmap-legend", legendColorScale);
  var legend = d3.select("#heatmap-legend").attr('y', overlayHeight + "px").attr('x', xCoords[0] - 75 + "px"); // Legend Title

  var title = overlay.append("text").attr("x", xCoords[0] - 50 + "px").attr("y", overlayHeight + "px").attr("text-anchor", "middle").style("font-size", "12px").style('fill', 'black').style('font-weight', 'bold').style('stroke', 'black').text("".concat(data.type.abbreviation, "_%")); // Data Points

  overlay.selectAll('rect').data(values).enter().append("rect").style("class", "heatmap-data").attr("x", function (d) {
    return parseFloat(d.coords.x);
  }).attr("y", function (d) {
    return parseFloat(d.coords.y);
  }).attr("width", 3).attr("height", 3).style("fill", function (d) {
    return getColor(d.relative);
  }).style("stroke-width", 4).style("stroke", "none").style("opacity", 0.8).on("mouseover", function (d) {
    tooltip.html("<b>X:</b> ".concat(d.coords.x, ", <b>Y:</b> ").concat(d.coords.y, "<br>\n                <b>Relative:</b> ").concat(d.relative, "<br>\n                <b>Absolute:</b> ").concat(d.absolute, "\n            "));
    tooltip.style("display", null).style("left", d3.mouse(heatmapWrapper.node())[0] + 20 + "px") // mouse relative to heatmap
    .style("top", d3.mouse(heatmapWrapper.node())[1] + "px").style("background-color", getColor(d.relative));
    if (d.relative / max.rel > .80) tooltip.style("color", "black"); // make text easier to see for light color values
    else tooltip.style("color", "white");
  }).on("mouseout", function (d) {
    tooltip.style("display", "none");
  });
}

function multiplier(values, multiplier) {
  var newValues = old => {
    Object.keys(old).forEach(key => {
      old[key].coords.x = old[key].coords.x * multiplier;
      old[key].coords.y = old[key].coords.y * multiplier;
    });
    return newValues;
  };
}