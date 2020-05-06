"use strict";

class MiniHeatmap {

    constructor(params, callback) {
        this.width = params.width;
        this.height = (580 / 752) * this.width;

        this.detector = params.detector;

        this.scale = params.scale;

        this.opacityDefault = .6;
        this.opacityLevel = this.opacityDefault;
        this.valueTypes = {
            "original": .4,
            "relative": 1
        }
        this.valueDefault = "original";
        this.valueWidth = this.valueTypes[this.valueDefault];
        this.valueType = this.valueDefault;

        this.wrapperId = params.wrapperId;
        this.wrapper = d3.select(this.wrapperId);
        this.heatmap = this.wrapper.append("svg")
            .attr("class", "heatmap-mini")
            .attr("viewBox", `0 0 ${this.width} ${this.width}`)
            .attr("transform", `scale(${this.scale})`);
        this.data = params.data;
        this.callback = callback.bind(this); // function to be called when data is selected

        this.init();
    }

    init() {
        this.renderImage();
        this.renderSelectionButton();
        this.update(this.data[this.detector]);
    }

    renderImage() {
        // Render original image
        this.heatmapImage = this.heatmap.append("svg:image")
            .attr("xlink:href", "../../img/main.jpg")
            .attr('class', 'img-fluid')
            .attr('width', this.width)
    }

    renderSelectionButton() {
        this.selectionButton = this.wrapper.append("button").attr("class", "heatmap-selection-button btn btn-primary btn-sm rounded align-items-center")
            .attr("type", "button")
            .style("position", "absolute")
            .style("left", "0")
            .style("top", "0")
            .style("z-index", "999")
            .style("margin", "10px")
            .style("opacity", ".75")
            .style("display", "none")
            .html("<span class='button-label'>Clear Selection</span>")
            .on("mouseover", () => {
                this.selectionButton.style("opacity", 1);
            })
            .on("mouseleave", () => {
                this.selectionButton.style("opacity", .75)
            })
            .on("click", () => {
                this.callback(this.data, true);
                this.selectionButton.style("display", "none");
                d3.selectAll('.selected').classed("selected", false);
            });
    }

    update(values) {
        if ($(`${this.wrapperId} .heatmap-mini .overlay`).length) { // clear old heatmap
            d3.select(`${this.wrapperId} .heatmap-mini .overlay`).remove();
        }

        if (!d3.selectAll('.data-selection.selected').empty()) {
            this.selectionButton.style("display", "block");
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
                .attr('width', .05)
                .attr('height', .05)
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
                        if (!d3.select(this).classed("data-selection") &&
                            (this.x.baseVal.value) >= d.x && (this.x.baseVal.value) <= d.x + d.width &&
                            (this.y.baseVal.value) >= d.y && (this.y.baseVal.value) <= d.y + d.height) {

                            d3.select(this)
                                .classed("data-selection", true)
                                .classed("selected", true);
                        }
                    });
                }
            })
            .on("mouseup", () => {
                overlay.selectAll("rect.selection").remove();
                d3.selectAll('.data-selection').classed("data-selection", false);
                this.selectionButton.style("display", "block");
                this.callback(d3.selectAll('.selected').data(), false);

            })
            .on("mouseout", () => {
                // overlay.selectAll("rect.selection").remove();
                d3.selectAll('.data-selection').classed("data-selection", false);
            })
            ;
    }

    updateSelected(selectedData) {
        console.log("selected data:");
        console.log(selectedData);
        d3.selectAll('.data-selection').classed("data-selection", false);
        d3.selectAll('.selected').classed("selected", false);

        d3.selectAll('.heatmap-data').filter(function (d) {
            if (selectedData.indexOf(d) != -1) {
                d3.select(this).classed("selected", true);
            }
        });
    }

    clearSelected() {
        this.selectionButton.style("display", "none");
        d3.selectAll('.selected').classed("selected", false);
    }

}

