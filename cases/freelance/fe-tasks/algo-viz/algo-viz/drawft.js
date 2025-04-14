//helper Function
// Returns gradient of f at (x, y) for different functions
function grad_f(x, y) {
    const functionName = window.currentFunction.name;
    
    switch(functionName) {
        case 'himmelblau':
            return [
                4 * x * (x * x + y - 11) + 2 * (x + y * y - 7),
                2 * (x * x + y - 11) + 4 * y * (x + y * y - 7)
            ];
        case 'rastrigin':
            return [
                2 * x + 20 * Math.PI * Math.sin(2 * Math.PI * x),
                2 * y + 20 * Math.PI * Math.sin(2 * Math.PI * y)
            ];
        case 'rosenbrock':
            return [
                2 * (x - 1) + 400 * x * (x * x - y),
                200 * (y - x * x)
            ];
        case 'booth':
            return [
                2 * (x + 2*y - 7) + 2 * (2*x + y - 5),
                2 * (x + 2*y - 7) * 2 + 2 * (2*x + y - 5)
            ];
        case 'beale':
            return [
                2 * (1.5 - x + x*y) * (-1 + y) +
                2 * (2.25 - x + x*y*y) * (-1 + y*y) +
                2 * (2.625 - x + x*y*y*y) * (-1 + y*y*y),
                2 * (1.5 - x + x*y) * x +
                2 * (2.25 - x + x*y*y) * 2*x*y +
                2 * (2.625 - x + x*y*y*y) * 3*x*y*y
            ];
        default:
            return [0, 0];
    }
}

//SGD algorithms
function get_sgd_data(x0, y0, learning_rate, num_steps) {
    let path = [[x0, y0]];
    let x = x0;
    let y = y0;
    let converged = false;
    let convergenceCount = 0;
    const convergenceThreshold = 1e-5;
    const requiredStableSteps = 5;

    for (let i = 0; i < num_steps && !converged; i++) {
        let [dx, dy] = grad_f(x, y);
        let new_x = x - learning_rate * dx;
        let new_y = y - learning_rate * dy;
        
        // Bound checking
        new_x = Math.max(-6, Math.min(6, new_x));
        new_y = Math.max(-6, Math.min(6, new_y));
        
        // Check for convergence
        const change = Math.sqrt(Math.pow(new_x - x, 2) + Math.pow(new_y - y, 2));
        if (change < convergenceThreshold) {
            convergenceCount++;
            if (convergenceCount >= requiredStableSteps) {
                converged = true;
            }
        } else {
            convergenceCount = 0;
        }
        
        x = new_x;
        y = new_y;
        path.push([x, y]);
    }
    
    return path;
}

function get_momentum_data(x0, y0, learning_rate, num_steps) {
    const dampening = 0.5;
    const momentum = 0.9;
    let path = [[x0, y0]];
    let vx = 0, vy = 0;
    let x = x0, y = y0;

    for (let i = 0; i < num_steps; i++) {
        const [gx, gy] = grad_f(x, y);
        
        // Update velocity with momentum and dampening
        vx = momentum * vx - (1 - dampening) * learning_rate * gx;
        vy = momentum * vy - (1 - dampening) * learning_rate * gy;
        
        // Update position
        x = Math.max(-6, Math.min(6, x + vx));
        y = Math.max(-6, Math.min(6, y + vy));
        
        path.push([x, y]);
    }
    return path;
}

function get_rmsprop_data(x0, y0, learning_rate, num_steps) {
    const decay_rate = 0.9;
    const epsilon = 1e-8;
    let path = [[x0, y0]];
    let x = x0, y = y0;
    let squared_grad_x = 0;
    let squared_grad_y = 0;

    for (let i = 0; i < num_steps; i++) {
        const [gx, gy] = grad_f(x, y);
        
        // Update squared gradients
        squared_grad_x = decay_rate * squared_grad_x + (1 - decay_rate) * gx * gx;
        squared_grad_y = decay_rate * squared_grad_y + (1 - decay_rate) * gy * gy;
        
        // Compute adaptive learning rates
        const dx = learning_rate * gx / (Math.sqrt(squared_grad_x) + epsilon);
        const dy = learning_rate * gy / (Math.sqrt(squared_grad_y) + epsilon);
        
        // Update position
        x = Math.max(-6, Math.min(6, x - dx));
        y = Math.max(-6, Math.min(6, y - dy));
        
        path.push([x, y]);
    }
    return path;
}

function get_adam_data(x0, y0, learning_rate, num_steps) {
    const beta1 = 0.9;
    const beta2 = 0.999;
    const epsilon = 1e-8;
    let path = [[x0, y0]];
    let x = x0, y = y0;
    let m_x = 0, m_y = 0;  // First moment estimates
    let v_x = 0, v_y = 0;  // Second moment estimates
    
    for (let i = 1; i <= num_steps; i++) {
        const [gx, gy] = grad_f(x, y);
        
        // Update biased first moment estimates
        m_x = beta1 * m_x + (1 - beta1) * gx;
        m_y = beta1 * m_y + (1 - beta1) * gy;
        
        // Update biased second moment estimates
        v_x = beta2 * v_x + (1 - beta2) * gx * gx;
        v_y = beta2 * v_y + (1 - beta2) * gy * gy;
        
        // Compute bias-corrected first and second moment estimates
        const m_x_hat = m_x / (1 - Math.pow(beta1, i));
        const m_y_hat = m_y / (1 - Math.pow(beta1, i));
        const v_x_hat = v_x / (1 - Math.pow(beta2, i));
        const v_y_hat = v_y / (1 - Math.pow(beta2, i));
        
        // Update position
        x = Math.max(-6, Math.min(6, x - learning_rate * m_x_hat / (Math.sqrt(v_x_hat) + epsilon)));
        y = Math.max(-6, Math.min(6, y - learning_rate * m_y_hat / (Math.sqrt(v_y_hat) + epsilon)));
        
        path.push([x, y]);
    }
    return path;
}

// Get optimization path based on selected algorithm
function getOptimizationPath(x0, y0, learning_rate, num_steps) {
    const algorithm = document.getElementById('algorithm-select').value;
    
    switch(algorithm) {
        case 'sgd':
            return get_sgd_data(x0, y0, learning_rate, num_steps);
        case 'momentum':
            return get_momentum_data(x0, y0, learning_rate, num_steps);
        case 'rmsprop':
            return get_rmsprop_data(x0, y0, learning_rate, num_steps);
        case 'adam':
            return get_adam_data(x0, y0, learning_rate, num_steps);
        default:
            console.error('Unknown algorithm:', algorithm);
            return [];
    }
}

// Animation control
let animationId = null;
let currentStep = 0;
let optimizationPath = [];
let animationSpeed = 5;
let isAnimating = false;
let activeTransitions = 0;
let currentTimeouts = [];  // 存储所有活动的 timeout

// Function to clean up all animations and elements
function cleanupAnimation(keepPaths = false) {
    // 取消所有正在进行的 timeout
    currentTimeouts.forEach(timeout => clearTimeout(timeout));
    currentTimeouts = [];
    
    // 取消所有正在进行的动画
    d3.selectAll('.optimization-path-group, #current-point')
        .transition()
        .duration(0);
    
    // Cancel any ongoing animation frame
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // Clear paths only if not keeping them
    if (!keepPaths) {
        window.graphArea.selectAll(".optimization-path-group")
            .remove();
    }
    
    // Always remove the current point
    window.graphArea.selectAll("#current-point")
        .remove();
    
    // Reset animation state
    currentStep = 0;
    optimizationPath = [];
    isAnimating = false;
    activeTransitions = 0;
}

// Function to animate one step of the optimization
function animateStep(path, index) {
    if (!path || !Array.isArray(path) || index >= path.length || !isAnimating) {
        // Animation has ended or was interrupted
        const algorithm = document.getElementById('algorithm-select').value;
        if (algorithm === 'sgd') {
            // For SGD, clean up but keep the paths
            const currentPoint = d3.select('#current-point');
            if (!currentPoint.empty()) {
                currentPoint
                    .transition()
                    .duration(300)
                    .style('opacity', 0)
                    .remove();
            }
            isAnimating = false;
        } else {
            isAnimating = false;
            if (path && path.length > 0) {
                const currentFunction = document.getElementById('function-select').value;
                const minima = window.functionMinima[currentFunction];
                const lastPoint = path[path.length - 1];
                
                if (minima && minima.length > 0 && lastPoint && Array.isArray(lastPoint) && lastPoint.length >= 2) {
                    handleFinalPoint(lastPoint, minima);
                } else {
                    cleanupAnimation(true);
                }
            }
        }
        return;
    }

    const point = path[index];
    if (!point || !Array.isArray(point) || point.length < 2 || 
        isNaN(point[0]) || isNaN(point[1])) {
        cleanupAnimation(false);
        return;
    }

    const currentPoint = d3.select('#current-point');
    if (!currentPoint.empty() && isAnimating) {
        // Smooth transition to next point
        activeTransitions++;
        currentPoint
            .transition()
            .duration(50)
            .ease(d3.easeLinear)
            .attr('cx', window.xScale(point[0]))
            .attr('cy', window.yScale(point[1]))
            .on('end', function() {
                activeTransitions--;
            });
        
        // Update coordinates display
        updateCoordinates(point[0], point[1]);
        
        // Draw path segment
        if (index > 0) {
            const prevPoint = path[index - 1];
            if (prevPoint && Array.isArray(prevPoint) && prevPoint.length >= 2 &&
                !isNaN(prevPoint[0]) && !isNaN(prevPoint[1])) {
                drawPathSegment(prevPoint, point);
            }
        }
        
        // Continue animation with speed control
        const delay = Math.max(20, Math.min(200, 200 / animationSpeed));
        if (isAnimating) {  // 只有在动画仍在进行时才继续
            const timeout = setTimeout(() => animateStep(path, index + 1), delay);
            currentTimeouts.push(timeout);
        }
    } else {
        cleanupAnimation(false);
    }
}

// Helper function to draw path segment
function drawPathSegment(prevPoint, currentPoint) {
    const pathGroup = window.graphArea.append('g')
        .attr('class', 'optimization-path-group')
        .attr("transform", d3.zoomTransform(window.graphArea.node()));
        
    pathGroup.append('line')
        .attr('class', 'optimization-path')
        .attr('x1', window.xScale(prevPoint[0]))
        .attr('y1', window.yScale(prevPoint[1]))
        .attr('x2', window.xScale(prevPoint[0]))
        .attr('y2', window.yScale(prevPoint[1]))
        .style('stroke', '#ff4444')
        .style('stroke-width', 2)
        .style('opacity', 0)
        .transition()
        .duration(50)
        .style('opacity', 1)
        .attr('x2', window.xScale(currentPoint[0]))
        .attr('y2', window.yScale(currentPoint[1]));
}

// Helper function to handle the final point animation
function handleFinalPoint(lastPoint, minima) {
    const currentFunction = document.getElementById('function-select').value;
    const algorithm = document.getElementById('algorithm-select').value;
    
    // For SGD, just stop at the final point without additional animation
    if (algorithm === 'sgd') {
        const currentPoint = d3.select('#current-point');
        if (!currentPoint.empty()) {
            currentPoint
                .transition()
                .duration(300)
                .style('opacity', 0)
                .remove();
        }
        return;
    }

    // Find the closest minimum point
    let closestMin = minima[0];
    let minDist = Number.MAX_VALUE;
    
    minima.forEach(min => {
        if (min && typeof min.x === 'number' && typeof min.y === 'number') {
            const dist = Math.sqrt(
                Math.pow(lastPoint[0] - min.x, 2) + 
                Math.pow(lastPoint[1] - min.y, 2)
            );
            if (dist < minDist) {
                minDist = dist;
                closestMin = min;
            }
        }
    });

    // Adjust threshold based on the current function
    const distanceThreshold = currentFunction === 'rastrigin' ? 0.1 : 0.5;
    
    if (minDist > distanceThreshold) {
        // If we're too far from minimum, just fade out the point
        const currentPoint = d3.select('#current-point');
        if (!currentPoint.empty()) {
            currentPoint
                .transition()
                .duration(300)
                .style('opacity', 0)
                .remove();
        }
        return;
    }

    // Create smooth transition to closest minimum
    const currentPoint = d3.select('#current-point');
    if (!currentPoint.empty() && !isNaN(closestMin.x) && !isNaN(closestMin.y)) {
        const transitionDuration = 500;
        
        // Create final path segment to minimum
        const pathGroup = window.graphArea.append('g')
            .attr('class', 'optimization-path-group')
            .attr("transform", d3.zoomTransform(window.graphArea.node()));
            
        pathGroup.append('line')
            .attr('class', 'optimization-path')
            .attr('x1', window.xScale(lastPoint[0]))
            .attr('y1', window.yScale(lastPoint[1]))
            .attr('x2', window.xScale(lastPoint[0]))
            .attr('y2', window.yScale(lastPoint[1]))
            .style('stroke', '#ff4444')
            .style('stroke-width', 2)
            .style('opacity', 0.5)
            .transition()
            .duration(transitionDuration)
            .attr('x2', window.xScale(closestMin.x))
            .attr('y2', window.yScale(closestMin.y))
            .on('end', function() {
                // Remove the point immediately after path completion
                currentPoint
                    .transition()
                    .duration(200)
                    .style('opacity', 0)
                    .remove();
            });

        // Move point to minimum and fade out
        currentPoint
            .transition()
            .duration(transitionDuration)
            .attr('cx', window.xScale(closestMin.x))
            .attr('cy', window.yScale(closestMin.y))
            .style('opacity', 1);
            
        // Update coordinates
        updateCoordinates(closestMin.x, closestMin.y);
    }
}

// Function to handle mouse click and start optimization
function animatealgorithms() {
    // 如果动画正在进行，强制停止并清理
    if (isAnimating) {
        cleanupAnimation(false);
        // 给一个小延迟确保清理完成
        setTimeout(() => {
            startNewAnimation(this);
        }, 100);
        return;
    }
    
    startNewAnimation(this);
}

// Function to start a new animation
function startNewAnimation(context) {
    const algorithm = document.getElementById('algorithm-select').value;
    
    // Always clean up previous paths for RMSprop and Adam
    if (algorithm === 'rmsprop' || algorithm === 'adam') {
        cleanupAnimation(false);
    } else {
        cleanupAnimation(true);
    }
    
    // Get click coordinates
    const coords = d3.mouse(context);
    if (!coords || coords.length < 2) return;
    
    const x0 = window.currScale.x.invert(coords[0]);
    const y0 = window.currScale.y.invert(coords[1]);
    
    if (isNaN(x0) || isNaN(y0)) return;
    
    isAnimating = true;
    
    // Add starting point with stable positioning
    const startPoint = window.graphArea.append("circle")
        .attr("id", "current-point")
        .attr("r", 4)
        .attr("fill", "#ff4444")
        .style("stroke", "#fff")
        .style("stroke-width", 1)
        .style("opacity", 0)
        .attr("cx", window.currScale.x(x0))
        .attr("cy", window.currScale.y(y0));
    
    // Use transition for smooth appearance
    startPoint
        .transition()
        .duration(200)
        .style("opacity", 1)
        .on("end", function() {
            if (isAnimating) {  // 只有在动画仍在进行时才开始优化
                startOptimization(x0, y0);
            }
        });
}

// Function to start the optimization animation
function startOptimization(x0, y0) {
    if (typeof x0 === 'undefined' || typeof y0 === 'undefined' || 
        isNaN(x0) || isNaN(y0)) {
        cleanupAnimation(false);
        return;
    }
    
    // Get parameters from UI
    const learningRate = parseFloat(document.getElementById("learning-rate").value);
    const numSteps = parseInt(document.getElementById("num-steps").value);
    animationSpeed = parseInt(document.getElementById("animation-speed").value);
    const algorithm = document.getElementById("algorithm-select").value;
    
    if (isNaN(learningRate) || isNaN(numSteps) || isNaN(animationSpeed)) {
        cleanupAnimation(false);
        return;
    }
    
    // Generate optimization path
    optimizationPath = getOptimizationPath(x0, y0, learningRate, numSteps);
    if (!optimizationPath || !Array.isArray(optimizationPath)) {
        cleanupAnimation(false);
        return;
    }
    
    // For RMSprop and Adam, ensure we start with a clean slate
    if (algorithm === 'rmsprop' || algorithm === 'adam') {
        window.graphArea.selectAll(".optimization-path-group").remove();
    }
    
    currentStep = 0;
    animateStep(optimizationPath, currentStep);
}

// Function to update coordinates display
function updateCoordinates(x, y) {
    if (typeof x === 'undefined' || typeof y === 'undefined' || isNaN(x) || isNaN(y)) {
        return;
    }
    const f = window.currentFunction ? window.currentFunction(x, y) : 0;
    
    d3.select("#x-coord").text(x.toFixed(3));
    d3.select("#y-coord").text(y.toFixed(3));
    d3.select("#f-val").text(f.toFixed(3));
}

// Initialize event listeners
document.addEventListener("DOMContentLoaded", function() {
    // Update displayed values when sliders change
    document.getElementById("learning-rate").addEventListener("input", function() {
        document.getElementById("learning-rate-value").textContent = this.value;
    });
    
    document.getElementById("num-steps").addEventListener("input", function() {
        document.getElementById("steps-value").textContent = this.value;
    });
    
    document.getElementById("animation-speed").addEventListener("input", function() {
        document.getElementById("speed-value").textContent = this.value;
        animationSpeed = parseInt(this.value);
    });
    
    // Handle function selection
    document.getElementById("function-select").addEventListener("change", function() {
        const functionName = this.value;
        
        // Cancel any ongoing animation
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        // Reset animation state
        currentStep = 0;
        optimizationPath = [];
        
        // Update function
        window.setFunction(functionName);
        document.getElementById("function-description").textContent = window.functionInfo[functionName].description;
    });
    
    // Handle algorithm selection
    document.getElementById("algorithm-select").addEventListener("change", function() {
        const algorithmName = this.value;
        
        // Cancel any ongoing animation
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        // Reset animation state
        currentStep = 0;
        optimizationPath = [];
        
        // Clear existing paths and points
        window.graphArea.selectAll(".optimization-path-group").remove();
        window.graphArea.selectAll("#current-point").remove();
        
        // Update algorithm description
        document.getElementById("algorithm-description").textContent = algorithmInfo[algorithmName].description;
    });
    
    // Set initial descriptions
    document.getElementById("function-description").textContent = functionInfo.himmelblau.description;
    document.getElementById("algorithm-description").textContent = algorithmInfo.sgd.description;
    
    // Handle graph clicks to set starting point
    const graphContainer = document.getElementById("graph-container");
    if (graphContainer) {
        graphContainer.addEventListener("click", function(event) {
            const rect = graphContainer.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // Convert screen coordinates to graph coordinates
            const x0 = xScale.invert(x - margin.left);
            const y0 = yScale.invert(y - margin.top);
            
            // Clear previous path
            window.graphArea.selectAll(".optimization-path-group").remove();
            
            // Start new optimization
            startOptimization(x0, y0);
        });
    }
});

// Event listener for algorithm changes
document.getElementById("algorithm-select").addEventListener("change", function() {
    cleanupAnimation(false);
});

// Event listener for function changes
document.getElementById("function-select").addEventListener("change", function() {
    cleanupAnimation(false);
});