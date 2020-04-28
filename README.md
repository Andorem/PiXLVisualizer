# COMP 584 Project
PiXL visualization built with Node.js and d3.js using MVC architecture

## Contributors
Tommy Avetisyan
Henry Dinh
Kyle Felkel
Alexis Siguenza
Elvis Ventura

## Installation
```
git clone https://github.com/andorem/COMP584Project.git
npm install
npm start // Start server and build frontend
npm run watch // Start dev server with live reload
npm run prod // Build and serve
```

## Structure
```javascript
src // All source files to build and run
    server.js
    assets // SCSS, CSS, and frontend JS assets
        css
        scss
        js
    data // CSV and JSON data set and supporting utils
    models
    views
        layouts // html base templates
        partials // html template parts
    controllers 
public // Frontend
    css
    js
    server.js
```


