// Display properties
var crosshairWidth = 0.5;
var minRadius = 0.05, radarRadius = 0.2;
var minZoom = 1, maxZoom = 3;
var simulate = false;
var radarColor = "#ff0000";
var helpTextColor = "#fff";
var coordBoxColor = "#ffffb8";
var coordTextColor = "#000";
var contourLineColor = "#666";
var axisLabelWeight = "600";
var crosshairColor = "#fff";
var cutoffWidth = 500; 

// Contour plot properties
var thresholds = d3.merge([d3.range(d3.min(z), 50, 10), d3.range(100, d3.max(z), 100)]);
var contours = d3.contours()
                 .size([n, m])
                 .thresholds(thresholds);
var color = d3.scaleLinear()
              .domain(d3.extent(thresholds))
              .range(['#222', 'yellow'])
              .interpolate(d3.interpolateHcl);

 // D3 elements
var xScale, yScale, currScale; // Initial and current axis scales
var g_transform,last_transform;
var xAxis, yAxis; // Axis building functions and svg groups containing the axes
var xLabel, yLabel; // Axis labels
var svg, clipArea, graphArea, contourPlot, gX, gY,menu_g, gradient_path_g; // SVG elements containing different parts of the plot
var zoom, zoomHelpText; // Handles zooming
var minCircle, radarCircle; // Display minimum values of Himmelblau function
var margin; // Margins around graph
var labelPositions; // Position of x/y axis labels
var height, width; // Height and width of graph area
var coordText, coordBox; // Display current coordinates/function value

// Calculate axis distance under current scale
function scaledDistance(axis, dist){
    return currScale[[axis]](dist) - currScale[[axis]](0);
}


// Set plot margins based on screen size
function setMargins(){
    var viewPortWidth = window.innerWidth;

    if (viewPortWidth > cutoffWidth){
        margin = {
            left: 60,
            right: 60,
            top: 60,
            bottom: 60
        };
    }else{
        margin = {
            left: 35,
            right: 20,
            top: 20,
            bottom: 35
        };
    }
}

// Set axis label positions based on current margins
function setLabelPositions(){
    labelPosition = {
        x: margin.top + height + (3 * margin.bottom / 4),
        y: margin.left / 4
    };  
}

//Scale and translate graph when user zooms
function zoomed() {
    if (zoomHelpText) {
        zoomHelpText.remove();
    }

    // Get current zoom scale
    currScale = {
        x: d3.event.transform.rescaleX(xScale),
        y: d3.event.transform.rescaleY(yScale)
    };

    // Transform contour plot, minimum circles, axes according to zoom
    contourPlot.attr("transform", d3.event.transform);
    radarCircle.attr("transform", d3.event.transform);
    minCircle.attr("transform", d3.event.transform);

    gX.call(xAxis.scale(currScale.x));
    gY.call(yAxis.scale(currScale.y));

    // Update paths
    graphArea.selectAll(".sgd-path").attr("transform", d3.event.transform);
    graphArea.selectAll(".start-point").attr("transform", d3.event.transform);

    // Hide coordinate display while zooming
    showCoords(this, false);
}

// Display current coordinates and function value on mouse over
function showCoords(e, show){
    var viewPortWidth = window.innerWidth;

    if (viewPortWidth <= cutoffWidth){
        return;
    }

    if (show){
        var currX = currScale.x.invert(d3.mouse(e)[0]);
        var currY = currScale.y.invert(d3.mouse(e)[1]);
        var currF = himmelblau(currX, currY);

        d3.select("#x-coord").text(currX.toFixed(2));
        d3.select("#y-coord").text(currY.toFixed(2));
        d3.select("#f-val").text(currF.toFixed(2));

        coordText.style("opacity", 1);
        coordBox.style("opacity", 1);
    }else{
        coordText.style("opacity", 0);
        coordBox.style("opacity", 0);
    }
}

// Iniitalize graph on page load
function initGraph(){
    // Set size and margin of plotting area
    var clientSize = d3.select("#graph-container").node().getBoundingClientRect();
    setMargins()
    width = clientSize.width - margin.left - margin.right;
    height = width + (margin.left + margin.right) - (margin.bottom + margin.top);

   // Create axes, labels and scales
    xScale = d3.scaleLinear() 
               .domain([d3.min(x), d3.max(x)])
               .range([0, width]);

    yScale = d3.scaleLinear() 
               .domain([d3.min(y), d3.max(y)])
               .range([height, 0]);

    currScale = {
        x: xScale,
        y: yScale
    };

    // Set zoom behaviour
    zoom = d3.zoom()
             .scaleExtent([minZoom, maxZoom])
             .extent([[0, 0], [width, height]])
             .translateExtent([[0, 0], [width, height]])
             .on("zoom", zoomed);

    // Create plot elements
    svg = d3.select("#graph-container")
             .append("svg")
               .attr("width", width + margin.left + margin.right)
               .attr("height", height + margin.top + margin.bottom);

    clipArea = svg.append("defs")
                   .append("clipPath")
                   .attr("id", "clip")
                   .append("rect")
                   .attr("width", width)
                   .attr("height", height);

    graphArea = svg.append("g")
                      .attr("id", "graph")
                      .attr("height", height)
                      .attr("width", width)
                      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                      .attr("clip-path", "url(#clip)")
                      .on("mouseover", function(){
                          showCoords(this, true);
                      })
                      .on("mousemove", function(){
                          showCoords(this, true);
                      })
                      .on("mouseout", function(){
                          showCoords(this, false);
                      })
                      .on("mousedown", animatealgorithms)
                      .call(zoom);
					  
	

    contourPlot = graphArea.selectAll("path")
                           .data(contours(z))
                           .enter()
						   .append("path")
                           .attr("d", d3.geoPath(d3.geoIdentity().scale(width / m)))
                           .attr("fill", function(d){return color(d.value);})
                           .attr("stroke", contourLineColor);
							 
	

	
    xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    yAxis = d3.axisLeft(yScale).tickSizeOuter(0);

    gY = svg.append("g")
               .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
               .call(yAxis);

    gX = svg.append("g")
               .attr("transform", "translate(" + margin.left + "," + (margin.top + height) + ")")
               .call(xAxis);

    setLabelPositions();

    yLabel = svg.append("text")
                   .attr("text-anchor", "middle")
                   .attr("transform", "translate(" + labelPosition.y + "," + (margin.top + (height / 2)) + ")")
                   .attr("font-weight", axisLabelWeight)
                   .text("Y");

    xLabel = svg.append("text")
                   .attr("text-anchor", "middle")
                   .attr("transform", "translate(" + (margin.left + (width / 2)) + "," + labelPosition.x + ")")
                   .attr("font-weight", axisLabelWeight)
                   .text("X");

    // Set minimum  points 
    minCircle = graphArea.selectAll(".stationaryMin")
                           .data(mins)
                         .enter().append("circle")
                           .attr("class", "stationary-min")
                           .attr("fill", radarColor)
                           .attr("r", scaledDistance("x", minRadius))
                           .attr("cx", function(d){return xScale(d.x)})
                           .attr("cy", function(d){return yScale(d.y)});

    radarCircle = graphArea.selectAll(".min")
                             .data(d3.merge([mins, mins]))
                           .enter().append("circle")
                             .attr("class", "min")
                             .attr("fill", radarColor)
                             .attr("stroke", radarColor)
                             .attr("cx", function(d){return xScale(d.x)})
                             .attr("cy", function(d){return yScale(d.y)});


    // Create display to hold current coordinates/function value
    coordBox = svg.append("rect")
                     .style("opacity", 0)
                     .attr("x", margin.left + width / 8)
                     .attr("y", margin.top / 4)
                     .attr("width", 3 * width / 4)
                     .attr("height", margin.top / 2)
                     .attr("stroke", coordTextColor)
                     .attr("stroke-width", 0.3)
                     .attr("fill", coordBoxColor);

    coordText = svg.append("text")
                      .style("opacity", 0)
                      .style("white-space", "pre")
                      .attr("text-anchor", "middle")
                      .attr("dy", "0.35em")
                      .attr("transform", "translate(" + (margin.left + width / 2) + "," + margin.top / 2 + ")");

    coordText.append("tspan")
               .text("x:  ")
               .style("font-weight", "bold");

    coordText.append("tspan")
               .attr("id", "x-coord");

    coordText.append("tspan")
               .text("     y:  ")
               .style("font-weight", "bold");

    coordText.append("tspan")
               .attr("id", "y-coord");

    coordText.append("tspan")
               .text("     f(x,y):  ")
               .style("font-weight", "bold");

    coordText.append("tspan")
               .attr("id", "f-val");

    // Help text telling user they can zoom
    if (window.innerWidth > cutoffWidth){
        var scrollAction = "Scroll";
    }else{
        var scrollAction = "Pinch";
    }

    zoomHelpText = graphArea.append("text")
                              .attr("text-anchor", "middle")
                              .attr("fill", helpTextColor)
                              .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
                              .text("Use " + scrollAction + " to Zoom")
                              .on("mouseover", function(){zoomHelpText.remove();});
}

// Redraw graph after window resizes
function reDraw(){
    // Reset zoom 
    svg.call(zoom.transform, d3.zoomIdentity);

    // Set new size and margin of plotting area
    var clientSize = d3.select("#graph-container").node().getBoundingClientRect();
    setMargins()
    width = clientSize.width - margin.left - margin.right;
    height = width + margin.left + margin.right - margin.bottom - margin.top;

    // Adjust zoom behaviour
    zoom.extent([[0, 0], [width, height]])
    .translateExtent([[0, 0], [width, height]]);

    // Adjust size of plot elements
    svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    clipArea.attr("width", width)
            .attr("height", height);

    graphArea.attr("height", height)
             .attr("width", width)
             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    contourPlot.attr("d", d3.geoPath(d3.geoIdentity().scale(width / m)))
               .attr("fill", function(d){return color(d.value);})
               .attr("stroke", "#666");

    // Adjust axes, labels and scales
    xScale.range([0, width]);
    yScale.range([height, 0]);

    currScale = {
        x: xScale,
        y: yScale
    };

    xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    yAxis = d3.axisLeft(yScale).tickSizeOuter(0);

    gY.attr("transform", "translate(" + margin.left + "," + margin.top + ")").call(yAxis);
    gX.attr("transform", "translate(" + margin.left + "," + (margin.top + height) + ")").call(xAxis);

    setLabelPositions();

    yLabel.attr("transform", "translate(" + labelPosition.y  + "," + (margin.top + (height / 2)) + ")");
    xLabel.attr("transform", "translate(" + (margin.left + (width / 2)) + "," + labelPosition.x + ")");

    // Adjust minimum points
    minCircle.attr("r", scaledDistance("x", minRadius))
             .attr("cx", function(d){return xScale(d.x)})
             .attr("cy", function(d){return yScale(d.y)});

    radarCircle.attr("cx", function(d){return xScale(d.x)})
               .attr("cy", function(d){return yScale(d.y)});


    // Adjust coordinates display
    coordText.attr("transform", "translate(" + (margin.left + width / 2) + "," + margin.top / 2 + ")");
    coordBox.attr("x", margin.left + width / 8)
            .attr("y", margin.top / 4)
            .attr("width", 3 * width / 4)
            .attr("height", margin.top / 2);

    // Adjust zoom help text
    zoomHelpText.attr("transform", "translate(" + (margin.left + width / 2) + "," + (margin.top + height / 2) + ")");
}

initGraph();
window.addEventListener("resize", reDraw);