"use strict";

var chart = d3.select('#elements-barchart'); // var data = JSON.parse(atob(chart.attr("data"))); // console.log(data);

console.log(chart.attr("data"));
var barHeight = 20; // .append("rect")
//         .attr("x", m[0])
//         .attr("y", m[1])
//         .attr("height", 0)
//         .attr("width", 0);
// .selectAll('rect').data(data).enter().append('rect').attr('width', function (d) { return d; }).attr('height', barHeight - 1).attr('transform', function (d, i) { return "translate(0," + i * barHeight + ")"; });