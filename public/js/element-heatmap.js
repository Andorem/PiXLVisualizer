"use strict";

var width = 752;
var height = 580;
var zoomDefault = 2,
    zoomLevel = zoomDefault;
var opacityDefault = .6,
    opacityLevel = opacityDefault;
var valueTypes = {
  "original": 1,
  "relative": 2.5
};
var valueDefault = "relative",
    valueWidth = valueTypes[valueDefault],
    valueType = valueDefault;
var heatmap = d3.select('#heatmap-svg');
var data = JSON.parse(atob(heatmap.attr("data-element")));
heatmap.attr('data-element', ""); // clear passed data
// Render original image

var heatmapImage = heatmap.append("svg:image").attr("xlink:href", "../../img/main.jpg").attr('class', 'img-fluid');
/* Toggles and Controls */
// Detector Selection Dropdown

var detectorSpinner = $("#heatmap .detector-dropdown-group .spinner-border");
var detectorLabel = $('#heatmap .detector-dropdown-group .detector-label');
var detectorButton = $('#heatmap .detector-dropdown-group button'); // Render heatmap on dropdown selection

$(document).ready(function () {
  $("#heatmap .detector-dropdown a").click(function (e) {
    e.preventDefault();
    var detectorName = $(this).attr('data');
    detectorLabel.text($(this).text()).attr('data', detectorName);
    detectorSpinner.addClass('d-block');
    detectorButton.addClass('disabled');
    setTimeout(function () {
      update(detectorName);
      detectorSpinner.removeClass('d-block');
      detectorButton.removeClass('disabled');
    }, 100);
  });
});
/* Zoom Functionality */
// Zoom and Pan

var zoomSlider = d3.selectAll("#heatmap-zoom-form input").datum({});
var zoomAction = d3.zoom().scaleExtent([1, 10]).translateExtent([[-1 * width, -1 * height], [width, height]]).extent([[-1 * width, -1 * height], [width, height]]).on("zoom", function () {
  heatmap.attr("transform", d3.event.transform);
  zoomSlider.property("value", d3.event.transform.k.toFixed(2));
});
heatmap.call(zoomAction); // Zoom Range Slider

zoomSlider.attr("min", zoomAction.scaleExtent()[0]).attr("max", zoomAction.scaleExtent()[1]).attr("step", (zoomAction.scaleExtent()[1] - zoomAction.scaleExtent()[0]) / 100).on("input", rangeSlideAction);

function rangeSlideAction(d) {
  zoomLevel = d3.select(this).property("value");
  zoomAction.scaleTo(heatmap, d3.select(this).property("value"));
} // Zoom Defaults


zoomSlider.property("value", zoomDefault);
zoomAction.scaleTo(heatmap, zoomDefault);
/* Opacity Functionality */
// Opacity Slider

var opacitySlider = d3.selectAll("#heatmap-opacity-form input");
opacitySlider.attr("min", 0).attr("max", 1).attr("step", .1).on("input", opacitySlideAction);

function opacitySlideAction(d) {
  opacityLevel = d3.select(this).property("value");
  d3.selectAll('.heatmap-data').style('opacity', opacityLevel);
} // Opacity Defaults


opacitySlider.property("value", opacityDefault);
d3.selectAll('.heatmap-data').style('opacity', opacityDefault);
/* Data Value Type Functionality */
// Data Value Type Select

var valueSelect = d3.selectAll("#heatmap-values select");
valueSelect.property("value", valueDefault).on("input", valueSelectAction);

function valueSelectAction(d) {
  valueType = d3.select(this).property("value");
  valueWidth = valueTypes[valueType];
  d3.selectAll('.heatmap-data').attr('width', valueWidth).classed("value-original", valueType == "original");
} // Opacity Defaults


valueSelect.property("value", valueDefault);

function update(name) {
  // $('#test').text(JSON.stringify(data[value], null, 2));
  var detectorValues = data[name];

  if ($("#heatmap .overlay").length) {
    // clear old heatmap
    d3.select("#heatmap .overlay").remove();
  }

  updateHeatmap(detectorValues);
} // Get data for heatmap overlay


function updateHeatmap(values) {
  // Render heatmap overlay
  var overlay = heatmap.append("svg").attr('class', 'overlay').attr('x', 0).attr('y', 0); // Get coordinates as data arrays

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

  var title = overlay.append("text").attr('class', 'heatmap-title').attr("x", horizontalCenter).attr("y", yCoords[0] - 10).attr("text-anchor", "middle").style("font-size", "20px").style('fill', 'white').style('font-weight', 'bold').style('stroke', 'black').text("".concat(data.type.abbreviation, " Heatmap")); // Heatmap Tooltip 

  var heatmapWrapper = d3.select("#heatmap-wrapper");
  var tooltip = $("#heatmap-tooltip").length ? // don't create duplicate tooltip
  d3.select("#heatmap-tooltip") : heatmapWrapper.append("div").attr("id", "heatmap-tooltip").style("display", "none"); // Heatmap Color Range

  var getColor = d3.scaleSequential().interpolator(getElementColor(data.type.abbreviation)).domain([0, max.rel]); // X Scale

  var xScale = d3.scaleLinear().domain([min.x, max.x]).range([0, overlayWidth]);
  var xAxisGen = d3.axisBottom().scale(xScale);
  var xAxis = overlay.append("g").call(xAxisGen).attr('class', 'axis x-axis').attr("transform", "translate(".concat(overlayWidth * 2.5 + 45, ", ").concat(overlayHeight * 1.5 + 75, ")")); // Y Scale

  var yScale = d3.scaleLinear().domain([min.y, max.y]).range([0, overlayHeight]);
  var yAxisGen = d3.axisLeft().scale(yScale);
  var yAxis = overlay.append("g").call(yAxisGen).attr("transform", "translate(".concat(overlayWidth * 2.5 + 43, ", ").concat(overlayHeight - 40, ")")).attr('class', 'axis y-axis'); // Legend

  var legendColorScale = d3.scaleSequential(getElementColor(data.type.abbreviation)).domain([0, max.rel]);
  var legendSliderScale = d3.scaleLinear().range([0, max.rel]).domain([0, max.rel]); // Legend Color Bar

  if ($("#heatmap-legend").length) {
    // don't create duplicate legend
    d3.select("#heatmap-legend").remove();
  }

  var legend = overlay.append("svg").attr("id", "heatmap-legend").attr('y', overlayHeight + "px").attr('x', xCoords[0] - 60 + "px").style('overflow', 'auto');
  var legendData = continuous("#heatmap-legend", legendColorScale); // Legend Title

  var title = overlay.append("text").attr('class', 'heatmap-legend-title').attr("x", xCoords[0] - 45 + "px").attr("y", overlayHeight + "px").attr("text-anchor", "middle").style("font-size", "12px").style('fill', 'black').style('font-weight', 'bold').style('stroke', 'black').text("".concat(data.type.abbreviation, "_%")); // Legend Slider

  var triangleSymbol = d3.symbol().type(d3.symbolTriangle).size(25);
  legend.append("g").attr("transform", "rotate(90)").append("g").attr("class", "heatmap-legend-slider").attr("transform", "translate(90, 2)").append("path").attr("d", triangleSymbol()); // Data Points

  overlay.selectAll('rect').data(values).enter().append("rect").attr("class", "heatmap-data").attr("x", function (d) {
    return parseFloat(d.coords.x);
  }).attr("y", function (d) {
    return parseFloat(d.coords.y);
  }).attr("width", valueWidth).attr("height", 2.5).style("fill", function (d) {
    return getColor(d.relative);
  }).style("opacity", opacityLevel).on("mouseover", function (d) {
    // Show tooltip
    tooltip.html("<b>X:</b> ".concat(d.coords.x, ", <b>Y:</b> ").concat(d.coords.y, "<br>\n                <b>Relative:</b> ").concat(d.relative, "<br>\n                <b>Absolute:</b> ").concat(d.absolute, "\n            "));
    tooltip.style("display", null).style("left", d3.mouse(heatmapWrapper.node())[0] + 20 + "px") // mouse relative to heatmap
    .style("top", d3.mouse(heatmapWrapper.node())[1] + "px").style("background-color", getColor(d.relative));
    if (d.relative / max.rel < .80) tooltip.style("color", "black"); // make text easier to see for light color values
    else tooltip.style("color", "white"); // Highlight data point

    d3.select(this).style("fill", function (d) {
      return d3.rgb(getColor(d.relative)).brighter(2);
    }).style('opacity', 1).style("stroke", d3.rgb(getElementColor(data.type.abbreviation)(1)).darker(2)).style("stroke-width", ".5px"); // Move legend slider

    d3.select(".heatmap-legend-slider").transition().delay(25).attr("transform", "translate(".concat(legendData.scale(d.relative) + 10, ", 2)"));
  }).on("mouseout", function (d) {
    tooltip.style("display", "none");
  }).on("mouseleave", function (d) {
    // Remove hover effects
    d3.select(this).style("fill", function (d) {
      return getColor(d.relative);
    }).style('opacity', opacityLevel).style("stroke", "none");
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