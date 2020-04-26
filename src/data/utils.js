export function encode(object, isJSON=false) {
    return Buffer.from((isJSON ? object : JSON.stringify(object))).toString("base64");
}