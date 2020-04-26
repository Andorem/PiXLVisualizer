"use strict";

let chart = d3.select('#elements-barchart');
let data = JSON.parse(atob(chart.attr("data"))); 

console.log(data);

$(document).ready(function() {
    $("#detector-dropdown a").click(function(e) {
        e.preventDefault();
        var detector = $(this).attr('data');
        $('#detector-dropdown-group button').text($(this).text());
        $("#detector-dropdown-group button").attr('data', detector);
        update(detector);
    });
});

function update(value) {
    $('#test').text(JSON.stringify(data[value], null, 2));
}

