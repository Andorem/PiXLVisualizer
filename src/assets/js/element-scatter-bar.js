"use strict";
let dimensions = {
    scatter: {width: 350, height: 300}
}

let mainData, mainValues, mainName;
let compareData, compareValues, compareName;
let detectorName = 'A';
let isLoading = false;

let scatter, scatterWrapper = d3.select('#scatter-wrapper');
let barchart, barWrapper = d3.select('#bar-wrapper');

mainData = JSON.parse(atob(scatterWrapper.attr("data-element")));
setMainElement(mainData);
setCompareElement(mainData); // default to comparing to self
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


function update(name) {
    detectorName = name;
    mainValues = mainData[detectorName];
    compareValues = compareData[detectorName];
    isLoading = false;
    updateScatterplot(mainValues, compareValues);
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

function updateScatterplot(mainValues, compareValues) {
    if (isLoading) return;

    if ($("#scatter-wrapper svg").length) { // clear old scatterplot
        d3.selectAll("#scatter-wrapper svg").remove();
    }

    var margin = { top: 20, right: 20, bottom: 50, left: 70 },
        width = dimensions.scatter.width - margin.left - margin.right,
        height = dimensions.scatter.height - margin.top - margin.bottom;

    scatter = scatterWrapper.append("svg").attr("id", "scatter-svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Get values as data arrays
    let absValues = {}, relValues = {};
    absValues[mainName] = mainValues.map((value) => { return parseFloat(value.absolute) }).sort();
    relValues[mainName] = mainValues.map((value) => { return parseFloat(value.relative) }).sort();

    absValues[compareName] = compareValues.map((value) => { return parseFloat(value.absolute) }).sort();
    relValues[compareName] = compareValues.map((value) => { return parseFloat(value.relative) }).sort();

    let max = {}, min = {};
    max[mainName] = {
        abs: d3.max(absValues[mainName]),
        rel: d3.max(relValues[mainName])
    };
    max[compareName] = {
        abs: d3.max(absValues[compareName]),
        rel: d3.max(relValues[compareName])
    };

    min[mainName] = {
        abs: d3.min(absValues[mainName]),
        rel: d3.min(relValues[mainName])
    };
    min[compareName] = {
        abs: d3.min(absValues[compareName]),
        rel: d3.min(relValues[compareName])
    };

    // Combine data for both elements into single data point (x and y)
    let scatterData = [];
    mainValues.forEach((item, index) => {
        let scatterDataItem = {};
        scatterDataItem.mainValue = item; // y
        scatterDataItem.compareValue = compareValues[index]; // x
        scatterData.push(scatterDataItem);
    });

    // Add X axis
    var x = d3.scaleLinear()
        .domain([0, max[compareName].rel])
        .range([0, width]);
    scatter.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // X Axis label (element to compare)
    scatter.append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text(`${compareData.type.abbreviation}_%`);

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, max[mainName].rel])
        .range([height, 0]);
    scatter.append("g")
        .call(d3.axisLeft(y));


    // Y Axis label (current main element)
    scatter.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(`${mainData.type.abbreviation}_%`);


    // Add dots
    scatter.append('g')
        .selectAll(".main-value")
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