//helper Function
// Returns gradient of f at (x, y) 
function grad_f(x,y) {
    var grad_x = (himmelblau(x + h, y) - himmelblau(x, y)) / h;
        grad_y = (himmelblau(x, y + h) - himmelblau(x, y)) / h;
    return [grad_x, grad_y];
}

//SGD algorithms
function get_sgd_data(x0, y0, learning_rate, num_steps) {
    var sgd_history = [{"x": x0, "y": y0}];
    var x1, y1, gradient;

    for (var i = 0; i < num_steps; i++) {
        gradient = grad_f(x0, y0);
        x1 = x0 - learning_rate * gradient[0];
        y1 = y0 - learning_rate * gradient[1];

        // 限制坐标在合法范围内
        x1 = Math.max(-6, Math.min(6, x1));
        y1 = Math.max(-6, Math.min(6, y1));

        sgd_history.push({"x": x1, "y": y1});
        x0 = x1;
        y0 = y1;
    }

    return sgd_history;
}



// Animate all steps of the SGD algorithm
function animatealgorithms() {
	
    // Get initial position of point
    var point = d3.mouse(this);
    var x0 = currScale.x.invert(point[0]); 
    var y0 = currScale.y.invert(point[1]); 

    // Animate steps of SGD algorithm
    var learning_rate = parseFloat(document.getElementById("learning-rate").value);
    var num_steps = parseInt(document.getElementById("num-steps").value);
    var SGDdata = get_sgd_data(x0, y0, learning_rate, num_steps);

    // Remove the previous pathe and starting point
    graphArea.selectAll(".sgd-path").remove();
    graphArea.selectAll(".start-point").remove();

    // The starting point
    graphArea.append("circle")
            .attr("class", "start-point")
            .attr("cx", currScale.x(x0))
            .attr("cy", currScale.y(y0))
            .attr("r", 5)
            .attr("fill", "red");

    var line_function = d3.line()
                          .x(function(d) { return currScale.x(d.x); })
                          .y(function(d) { return currScale.y(d.y); });

    // Create path element
    var path = graphArea.append("path")
                .datum(SGDdata)
                .attr("class", "sgd-path")
                .attr("d", line_function)
                .attr("stroke", "blue")
                .attr("stroke-width", 2)
                .attr("fill", "none");

    // Caculate the total length of the path
    var totalLength = path.node().getTotalLength();

    // Set the initial stroke-dasharray and stroke-dashoffset
    path.attr("stroke-dasharray", totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(5000) 
        .ease(d3.easeLinear) // Use a linear easing Function
        .attr("stroke-dashoffset", 0) // The end offset is 0
        .on("end", function() {
        console.log("Path animation completed");
        });

}