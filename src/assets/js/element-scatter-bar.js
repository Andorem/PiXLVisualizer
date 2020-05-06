"use strict";

let margin = { top: 20, right: 20, bottom: 50, left: 70 };
let dimensions = {
    scatter: {width: 450, height: 400}
}
let scatterWidth = dimensions.scatter.width - margin.left - margin.right;
let scatterHeight = dimensions.scatter.height - margin.top - margin.bottom;

let mainData, mainValues, mainName;
let compareData, compareValues, compareName;

let absValues = {}, relValues = {}, max = {}, min = {}, scatterData = [];

let scatterWrapper = d3.select('#scatter-wrapper');
let scatter = scatterWrapper.append("svg").attr("id", "scatter-svg")
    .attr("width", scatterWidth + margin.left + margin.right)
    .attr("height", scatterHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

let barchart, barWrapper = d3.select('#bar-wrapper');

let originalData = JSON.parse(atob(scatterWrapper.attr("data-element")));
mainData = originalData;

let miniHeatmap = new MiniHeatmap({
    width: 100,
    wrapperId: "#heatmap-wrapper",
    data: mainData,
    detector: "A",
    scale: 3
    }, (data, clear) => {
        if (clear) update(detectorName);
        else update(detectorName, true, data);
    }
);

// Defaults
let detectorName = 'A';
let isLoading = false;
setMainElement(mainData);
setCompareElement(mainData); // default to comparing to self
setValues(mainData[detectorName], compareData[detectorName]);

scatterWrapper.attr('data-element', ""); // clear passed data
barWrapper.attr('data-element', "");

/* Toggles and Controls */

// Detector Selection Dropdown
let detectorSpinner = $("#compare .detector-dropdown-group .spinner-border");
let detectorLabel = $('#compare .detector-dropdown-group button .detector-label');
let detectorButton = $('#compare .detector-dropdown-group button');

// Compare Element Type Select
var compareSelect = d3.selectAll("#compare-values select");
compareSelect.property("value", mainName); // default

function disableControls() {
    detectorSpinner.addClass('d-block');
    detectorButton.addClass('disabled');
    compareSelect.attr('disabled', 'true');
}

function enableControls() {
    detectorSpinner.removeClass('d-block');
    detectorButton.removeClass('disabled');
    compareSelect.attr('disabled', null);
}

// Dropdown functionality
$(document).ready(function () {
    $("#compare .detector-dropdown a").click(function (e) {
        e.preventDefault();
        var detectorName = $(this).attr('data');
        detectorLabel.text($(this).text())
            .attr('data', detectorName);
        disableControls();
        setTimeout(function () {
            update(detectorName);
            enableControls();
        }, 100);
    });
});

// Compare Element Type Functionality
compareSelect.property("value", mainName)
    .on("input", compareSelectAction);
function compareSelectAction(d) {
    compareName = d3.select(this).property("value");
    isLoading = true;
    disableControls();
    $.getJSON('/api/element/' + compareName, function (data) {
        setCompareElement(data);
        isLoading = false;
        updateScatterplot(mainValues, compareValues);
        enableControls();
    });
}

/* Brush and Zoom */

// Set initial axises
let x = d3.scaleLinear()
    // .domain([0, max[compareName].rel])
    .range([0, scatterWidth]);
let xAxis = d3.axisBottom(x);
let xAxisGroup = scatter.append("g")
    .attr('class', 'axis x-axis')
    .attr("transform", "translate(0," + scatterHeight + ")");
let xLabel = scatter.append("text")
        .attr("transform",
            "translate(" + (scatterWidth / 2) + " ," + (scatterHeight + margin.top + 20) + ")")
        .style("text-anchor", "middle")

let y = d3.scaleLinear()
    // .domain([0, max[mainName].rel])
    .range([scatterHeight, 0]);
let yAxis = d3.axisLeft(y);
let yAxisGroup = scatter.append("g")
    .attr('class', 'axis y-axis');
let yLabel = scatter.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (scatterHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle");

// Define brush event
let brush = d3.brush()
    .extent([[0, 0], [scatterWidth, scatterHeight]])
    .on("end", selectBrushRegion),
idleTimeout,
idleDelay = 350;

// Select brush region to zoom into
function selectBrushRegion() {

    var selectedRegion = d3.event.selection;
    if (!selectedRegion) { // selection event is null
        if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
        x.domain(d3.extent(scatterData, function (d) { return d.compareValue.relative; })).nice();
        y.domain(d3.extent(scatterData, function (d) { return d.mainValue.relative; })).nice();
        // miniHeatmap.clearSelected();
    }
    else {
        x.domain([selectedRegion[0][0], selectedRegion[1][0]].map(x.invert, x));
        y.domain([selectedRegion[1][1], selectedRegion[0][1]].map(y.invert, y));
        scatter.select(".brush-overlay").call(brush.move, null);
    }
    // miniHeatmap.updateSelected(getSelectedData());
    zoomToBrushRegion();
}

function idled() {
    idleTimeout = null;
}

function getSelectedData() {
    let k = brush.extent();
    let j = scatterData.filter(function(d){
        return k[0] <= d.mainValue && k[1] >=d.compareValue;
    }).map((d) => d.mainValue)
    return j;
}

function zoomToBrushRegion() {

    var zoomDuration = scatter.transition().duration(750);
    xAxisGroup.transition(zoomDuration).call(xAxis);
    yAxisGroup.transition(zoomDuration).call(yAxis);
    scatter.selectAll("circle").transition(zoomDuration)
    .attr("cx", function (d) { return x(d.compareValue.relative); })
    .attr("cy", function (d) { return y(d.mainValue.relative); });
}

// Define brush region
let brushRegion = scatter.append("defs").append("svg:clipPath")
.attr("id", "brush-region")
.append("svg:rect")
.attr("width", scatterWidth)
.attr("height", scatterHeight)
.attr("x", 0) 
.attr("y", 0); 

// Only show data within brush region
let scatterDataRegion = scatter.append("g")
.attr("id", "scatter-data")
.attr("clip-path", "url(#brush-region)");

// Brush overlay
let brushOverlay = scatter.append("g")
.attr("class", "brush-overlay")
.call(brush);

function update(name, newData=false, data) {
    detectorName = name;
    mainValues = (newData ? data : mainData[detectorName]);
    compareValues = compareData[detectorName];
    isLoading = false;
    updateScatterplot(mainValues, compareValues);
    if (!newData) miniHeatmap.update(mainValues);
}

function setMainElement(data) {
    mainData = data;
    mainValues = mainData[detectorName];
    mainName = mainData.type.abbreviation;
}

function setCompareElement(data) {
    compareData = data;
    compareValues = compareData[detectorName];
    compareName = compareData.type.abbreviation;
}

function setValues(mainValues, compareValues) {
    setAbsoluteValues(mainValues, compareValues);
    setRelativeValues(mainValues, compareValues);
    setMaxValues();
    setMinValues();
    setScatterData(mainValues, compareValues);
}

function setMaxValues() {
    max[mainName] = {
        abs: d3.max(absValues[mainName]),
        rel: d3.max(relValues[mainName])
    };
    max[compareName] = {
        abs: d3.max(absValues[compareName]),
        rel: d3.max(relValues[compareName])
    };
}

function setMinValues() {
    min[mainName] = {
        abs: d3.min(absValues[mainName]),
        rel: d3.min(relValues[mainName])
    };
    min[compareName] = {
        abs: d3.min(absValues[compareName]),
        rel: d3.min(relValues[compareName])
    };
}

function setAbsoluteValues(mainValues, compareValues) {
    absValues[mainName] = mainValues.map((value) => { return parseFloat(value.absolute) }).sort();
    absValues[compareName] = compareValues.map((value) => { return parseFloat(value.absolute) }).sort();
}

function setRelativeValues(mainValues, compareValues) {
    relValues[mainName] = mainValues.map((value) => { return parseFloat(value.relative) }).sort();
    relValues[compareName] = compareValues.map((value) => { return parseFloat(value.relative) }).sort();
}

// Combine data for both elements into single data point (x and y)
function setScatterData(mainValues, compareValues) {
    scatterData = [];
    mainValues.forEach((item, index) => {
        let scatterDataItem = {};
        scatterDataItem.mainValue = item; // y
        scatterDataItem.compareValue = compareValues[index]; // x
        scatterData.push(scatterDataItem);
    });
}

function updateScatterplot(mainValues, compareValues) {
    if (isLoading) return;

    if ($("#scatter-wrapper svg circle").length) { // clear old scatterplot data
        d3.selectAll("#scatter-wrapper svg circle").remove();
    }

    // Update min, max, absolute, relative, and scatter data arrays
    setValues(mainValues, compareValues);

    // Update X axis
    x.domain([0, max[compareName].rel]);
    xAxisGroup.call(xAxis);

    // X Axis label (element to compare)
    xLabel.text(`${compareData.type.abbreviation}_%`);

    // Update Y axis
    y.domain([0, max[mainName].rel]);
    yAxisGroup.call(yAxis);

    // Y Axis label (current main element)
    yLabel.text(`${mainData.type.abbreviation}_%`);

    // Add dots
    scatterDataRegion
        .selectAll(".scatter-data")
        .data(scatterData)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.compareValue.relative); })
        .attr("cy", function (d) { return y(d.mainValue.relative); })
        .attr("r", 4)
        .style("opacity", .5)
        .style("stroke-width", 1)
        .style("fill", "none")
        .style("stroke", getElementColor(mainData.type.abbreviation)(1));

}


update(detectorName);
