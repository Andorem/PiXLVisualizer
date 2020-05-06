"use strict";

class MiniHeatmap {

    constructor(width, id, data, detector, scale) {
        this.width = width;
        this.height = (580 / 752) * this.width;

        this.detector = detector;

        this.scale = scale;

        this.opacityDefault = .6;
        this.opacityLevel = this.opacityDefault;

        this.valueTypes = {
            "original": .4,
            "relative": 2.5
        }
        this.valueDefault = "original";
        this.valueWidth = this.valueTypes[this.valueDefault];
        this.valueType = this.valueDefault;

        this.heatmap = d3.select(id).attr("transform", `scale(${this.scale})`);
        this.data = data;

        this.init();
    }

    init() {
        this.renderImage();
        this.update(this.data[this.detector]);
    }

    renderImage() {
        // Render original image
        this.heatmapImage = this.heatmap.append("svg:image")
            .attr("xlink:href", "../../img/main.jpg")
            .attr('class', 'img-fluid')
            .attr('width', this.width)
    }

    update(values) {
        if ($(`${this.id} .overlay`).length) { // clear old heatmap
            d3.select(`${this.id} .overlay`).remove();
        }

        // Render heatmap overlay
        var overlay = this.heatmap.append("svg")
            .attr('class', 'overlay')
            .attr('x', 0)
            .attr('y', 0);

        var relativeWidthScale = d3.scaleLinear()
            .domain([0, 752])
            .range([0, this.width]);

        var relativeHeightScale = d3.scaleLinear()
            .domain([0, 580])
            .range([0, this.height]);

        var elementColor = d3.rgb(getElementColor(this.data.type.abbreviation)(1));

        // Get coordinates as data arrays
        let xCoords = values.map((value) => { return relativeWidthScale(parseFloat(value.coords.x)) }).sort();
        let yCoords = values.map((value) => { return relativeHeightScale(parseFloat(value.coords.y)) }).sort();
        let absValues = values.map((value) => { return parseFloat(value.absolute) }).sort();
        let relValues = values.map((value) => { return parseFloat(value.relative) }).sort();

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

        // Overlay Dimensions
        let overlayHeight = Math.abs(yCoords[yCoords.length - 1] - yCoords[0]);
        let overlayWidth = Math.abs(xCoords[xCoords.length - 1] - xCoords[0]);
        let horizontalCenter = (xCoords[0] + xCoords[xCoords.length - 1]) / 2;
        let verticalCenter = (yCoords[0] + yCoords[yCoords.length - 1]) / 2;


        // Heatmap Color Range
        var getColor = d3.scaleSequential()
            .interpolator(getElementColor(this.data.type.abbreviation))
            .domain([0, max.rel]);

       
        // Data Points
        var dataWidth = this.valueWidth;
        overlay.selectAll('rect')
            .data(values)
            .enter()
            .append("rect")
            .attr("class", "heatmap-data")
            .attr("x", function (d) { return relativeWidthScale(parseFloat(d.coords.x)); })
            .attr("y", function (d) { return relativeHeightScale(parseFloat(d.coords.y)); })
            .attr("width", this.valueWidth)
            .attr("height", this.valueWidth)
            .style("fill", function (d) { return getColor(d.relative) })
            .style("opacity", this.opacityLevel)
            .on("mouseover", function (d) {
                // Highlight data point
                d3.select(this).style("fill", "red")
                    .style('opacity', 1)
                // .style("stroke", elementColor)
                // .style("stroke-width", ".5px");
            })
            .on("mouseleave", function (d) {
                // Remove hover effects
                d3.select(this).style("fill", function (d) {
                    return getColor(d.relative);
                })
                // .style('opacity', this.opacityLevel)
                // .style("stroke", "none");
            });
        overlay.on("mousedown", function () {
            if (!d3.event.altKey) {
                d3.selectAll(".selected").classed("selected", false);
            }
            var p = d3.mouse(this);
            overlay.append("rect")
                .attr('rx', 0)
                .attr('ry', 0)
                .attr('class', 'selection')
                .attr('x', p[0])
                .attr('y', p[1])
                .attr('width', .25)
                .attr('height', .25)
        })
            .on("mousemove", function () {
                var selection = overlay.select("rect.selection");

                if (!selection.empty()) {
                    var p = d3.mouse(this),
                        d = {
                            x: parseInt(selection.attr("x"), 10),
                            y: parseInt(selection.attr("y"), 10),
                            width: parseInt(selection.attr("width"), 10),
                            height: parseInt(selection.attr("height"), 10)
                        },
                        move = {
                            x: p[0] - d.x,
                            y: p[1] - d.y
                        }
                        ;

                    if (move.x < 1 || (move.x * 2 < d.width)) {
                        d.x = p[0];
                        d.width -= move.x;
                    } else {
                        d.width = move.x;
                    }

                    if (move.y < 1 || (move.y * 2 < d.height)) {
                        d.y = p[1];
                        d.height -= move.y;
                    } else {
                        d.height = move.y;
                    }
                    selection.attr('x', parseInt(selection.attr("x"), 10))
                        .attr('y', parseInt(selection.attr("y"), 10))
                        .attr('width', parseInt(selection.attr("width"), 10))
                        .attr('height', parseInt(selection.attr("height"), 10));
                    d3.selectAll('.data-selection.selected').classed("selected", false);

                    d3.selectAll('.heatmap-data').filter(function (cell_d, i) {
                        console.log(this.x);
                        console.log(this.y);
                        if (!d3.select(this).classed("data-selection") &&
                            (this.x.baseVal.value) >= d.x && (this.x.baseVal.value) <= d.x + d.width &&
                            (this.y.baseVal.value) >= d.y && (this.y.baseVal.value) <= d.y + d.height) {

                            d3.select(this)
                                .classed("data-selection", true)
                                .classed("selected", true);
                            console.log("select")
                        }
                    });
                }
            })
            .on("mouseup", function () {
                overlay.selectAll("rect.selection").remove();
                d3.selectAll('.data-selection').classed("data-selection", false);
            })
            .on("mouseout", function () {
                overlay.selectAll("rect.selection").remove();
                d3.selectAll('.data-selection').classed("data-selection", false);
            })
            ;
    }

}

