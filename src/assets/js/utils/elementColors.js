const ELEMENT_COLORS = {
    "Si": d3.interpolateOranges,
    "Al": d3.interpolatePurples,
    "Fe": d3.interpolateReds,
    "Ca": d3.interpolateBlues,
    "Ti": d3.interpolateGreens,
    "Mg": d3.interpolatePuRd
}

function getElementColor(abbr) {
    return ELEMENT_COLORS[abbr];
}