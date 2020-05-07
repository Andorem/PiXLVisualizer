# PiXL Visualizer
Interactive visualizations of NASA Mars 2020's PiXL sensor data, built with Node.js and d3.js using MVC architecture.

## Contributors
* Tommy Avetisyan
* Henry Dinh
* Kyle Felkel
* Alexis Siguenza
* Elvis Ventura

## Installation
```
git clone https://github.com/andorem/PiXLVisualizer.git
npm install
npm start
```

### Other Commands
```
npm run watch // Start dev server with reload
npm run prod // Build and serve for live production
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
    img
    server.js
```


