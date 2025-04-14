"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { functions, gradient, functionDomains } from "@/lib/functions"
import { SGD, MomentumSGD, RMSProp, Adam } from "@/lib/optimizers"

export default function OptimizationVisualization() {
  const visualizationRef = useRef<HTMLDivElement>(null)
  const [currentFunction, setCurrentFunction] = useState("main")
  const [learningRate, setLearningRate] = useState(0.01)
  const [momentum, setMomentum] = useState(0.9)
  const [maxIterations, setMaxIterations] = useState(100)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(50) // ms between steps
  const [currentIteration, setCurrentIteration] = useState(0)
  const [activeOptimizers, setActiveOptimizers] = useState({
    sgd: true,
    momentum: true,
    rmsprop: true,
    adam: true,
  })

  // State for visualization elements
  const svgRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>()
  const contourGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>()
  const pathGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>()
  const xScaleRef = useRef<d3.ScaleLinear<number, number>>()
  const yScaleRef = useRef<d3.ScaleLinear<number, number>>()
  const pathsRef = useRef<Record<string, { points: [number, number][]; path: any }>>({})
  const currentPositionRef = useRef<[number, number] | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const isAnimatingRef = useRef(false)

  // Optimizer instances
  const optimizersRef = useRef({
    sgd: new SGD({ lr: learningRate }),
    momentum: new MomentumSGD({ lr: learningRate, momentum }),
    rmsprop: new RMSProp({ lr: learningRate }),
    adam: new Adam({ lr: learningRate }),
  })

  // Colors for different optimizers
  const colors = {
    sgd: "#1f77b4",
    momentum: "#ff7f0e",
    rmsprop: "#2ca02c",
    adam: "#d62728",
  }

  // Initialize visualization
  useEffect(() => {
    if (!visualizationRef.current) return

    const width = visualizationRef.current.clientWidth
    const height = 500
    const margin = { top: 20, right: 20, bottom: 40, left: 40 }

    // Clear existing content
    visualizationRef.current.innerHTML = ""

    // Create SVG
    const svg = d3.select(visualizationRef.current).append("svg").attr("width", width).attr("height", height)

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    svgRef.current = g

    const domain = functionDomains[currentFunction as keyof typeof functionDomains]

    // Set scales
    const xScale = d3
      .scaleLinear()
      .domain(domain.xDomain)
      .range([0, width - margin.left - margin.right])

    const yScale = d3
      .scaleLinear()
      .domain(domain.yDomain)
      .range([height - margin.top - margin.bottom, 0])

    xScaleRef.current = xScale
    yScaleRef.current = yScale

    // Add X axis
    g.append("g")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale))

    // Add Y axis
    g.append("g").call(d3.axisLeft(yScale))

    // Create contour group
    contourGroupRef.current = g.append("g").attr("class", "contours")

    // Create path group
    pathGroupRef.current = g.append("g").attr("class", "path-group")

    // Create contour plot
    createContourPlot()

    // Add click event
    svg.on("click", (event) => {
      if (isAnimating) return

      const [x, y] = d3.pointer(event)
      const realX = xScale.invert(x - margin.left)
      const realY = yScale.invert(y - margin.top)

      resetPaths()
      startOptimization(realX, realY)
    })

    // Update optimizers with current parameters
    updateOptimizers()

    // Cleanup function
    return () => {
      if (animationIdRef.current) {
        window.clearTimeout(animationIdRef.current)
      }
    }
  }, [currentFunction, visualizationRef])

  // Update optimizers when parameters change
  useEffect(() => {
    updateOptimizers()
  }, [learningRate, momentum])

  // Sync isAnimating state with ref
  useEffect(() => {
    isAnimatingRef.current = isAnimating
  }, [isAnimating])

  // Create contour plot
  const createContourPlot = () => {
    if (!contourGroupRef.current || !xScaleRef.current || !yScaleRef.current) return

    const width = visualizationRef.current?.clientWidth || 800
    const height = 500
    const margin = { top: 20, right: 20, bottom: 40, left: 40 }
    const n = 100 // Grid size
    const data = new Array(n * n)
    const plotWidth = width - margin.left - margin.right
    const plotHeight = height - margin.top - margin.bottom

    // Calculate function values
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const x = xScaleRef.current.invert((i * plotWidth) / (n - 1))
        const y = yScaleRef.current.invert((j * plotHeight) / (n - 1))
        data[j * n + i] = functions[currentFunction as keyof typeof functions](x, y)
      }
    }

    // Create contours with more thresholds for complex functions
    const thresholds = currentFunction === "rastrigin" ? 30 : 20
    const contours = d3.contours().size([n, n]).thresholds(thresholds)(data)

    // Color scale - use a different color scheme for Rastrigin
    const colorScale = d3
      .scaleSequential(currentFunction === "rastrigin" ? d3.interpolateInferno : d3.interpolateViridis)
      .domain(d3.extent(data) as [number, number])

    // Draw contours
    contourGroupRef.current
      .selectAll("path")
      .data(contours)
      .join("path")
      .attr("d", d3.geoPath(d3.geoIdentity().scale(plotWidth / n)))
      .attr("fill", (d) => colorScale(d.value))
      .attr("stroke", currentFunction === "rastrigin" ? "rgba(255,255,255,0.1)" : "none")
      .attr("stroke-width", 0.5)
  }

  // Reset paths
  const resetPaths = () => {
    if (!pathGroupRef.current) return

    pathGroupRef.current.selectAll("*").remove()
    pathsRef.current = {}
    currentPositionRef.current = null
    setAnimationProgress(0)
    setCurrentIteration(0)

    // Reset optimizer states
    Object.values(optimizersRef.current).forEach((opt) => {
      if (opt && typeof opt.reset === "function") {
        opt.reset()
      }
    })
  }

  // Update optimizers
  const updateOptimizers = () => {
    optimizersRef.current = {
      sgd: new SGD({ lr: learningRate }),
      momentum: new MomentumSGD({ lr: learningRate, momentum }),
      rmsprop: new RMSProp({ lr: learningRate }),
      adam: new Adam({ lr: learningRate }),
    }
  }

  // Start optimization
  const startOptimization = (x: number, y: number) => {
    if (!pathGroupRef.current || !xScaleRef.current || !yScaleRef.current) return

    currentPositionRef.current = [x, y]

    // Create paths for each active optimizer
    const activeOptimizerKeys = Object.entries(activeOptimizers)
      .filter(([_, active]) => active)
      .map(([key]) => key)

    activeOptimizerKeys.forEach((name) => {
      pathsRef.current[name] = {
        points: [[x, y]],
        path: pathGroupRef
          .current!.append("path")
          .attr("fill", "none")
          .attr("stroke", colors[name as keyof typeof colors])
          .attr("stroke-width", 2),
      }
    })

    // Add starting point
    pathGroupRef.current
      .append("circle")
      .attr("class", "position-point")
      .attr("cx", xScaleRef.current(x))
      .attr("cy", yScaleRef.current(y))
      .attr("r", 5)
      .attr("fill", "black")

    // Run optimization
    runFullOptimization()
  }

  // Run full optimization
  const runFullOptimization = () => {
    if (!pathsRef.current) return

    const minGradNorm = currentFunction === "rastrigin" ? 1e-4 : 1e-6
    const activeOptimizerKeys = Object.entries(activeOptimizers)
      .filter(([_, active]) => active)
      .map(([key]) => key)

    // Only proceed if we have active optimizers
    if (activeOptimizerKeys.length === 0) return

    for (let i = 0; i < maxIterations; i++) {
      let allConverged = true

      activeOptimizerKeys.forEach((name) => {
        if (!pathsRef.current || !pathsRef.current[name]) return

        const path = pathsRef.current[name]
        const lastPoint = path.points[path.points.length - 1]
        const [x, y] = lastPoint

        // Calculate gradient
        const grad = gradient(functions[currentFunction as keyof typeof functions], x, y)
        const gradNorm = Math.sqrt(grad[0] * grad[0] + grad[1] * grad[1])

        if (gradNorm > minGradNorm) {
          allConverged = false

          // Apply optimizer update
          const optimizer = optimizersRef.current[name as keyof typeof optimizersRef.current]
          if (!optimizer) return

          const update = optimizer.step(grad)
          let newX = x - update[0]
          let newY = y - update[1]

          // For Rastrigin, add a small amount of noise to help escape local minima
          if (currentFunction === "rastrigin" && Math.random() < 0.1 && i < maxIterations / 2) {
            newX += (Math.random() - 0.5) * 0.1
            newY += (Math.random() - 0.5) * 0.1
          }

          path.points.push([newX, newY])
        }
      })

      if (allConverged) break
    }

    // Update path visualization
    updatePaths()

    // Add endpoints
    activeOptimizerKeys.forEach((name) => {
      if (
        !pathGroupRef.current ||
        !xScaleRef.current ||
        !yScaleRef.current ||
        !pathsRef.current ||
        !pathsRef.current[name]
      )
        return

      const path = pathsRef.current[name]
      const [x, y] = path.points[path.points.length - 1]

      pathGroupRef.current
        .append("circle")
        .attr("class", "position-point")
        .attr("cx", xScaleRef.current(x))
        .attr("cy", yScaleRef.current(y))
        .attr("r", 4)
        .attr("fill", colors[name as keyof typeof colors])
    })
  }

  // Animate optimization process - simplified version
  const animateOptimization = () => {
    try {
      console.log("Starting animation...")

      // Make sure we have the required refs
      if (!pathGroupRef.current || !xScaleRef.current || !yScaleRef.current) {
        console.log("Missing required refs")
        setIsAnimating(false)
        return
      }

      // Use a local variable to track animation state
      const localIsAnimating = true

      // Update React state and ref
      setIsAnimating(true)
      isAnimatingRef.current = true

      // Reset state
      setAnimationProgress(0)
      setCurrentIteration(0)
      resetPaths()

      // Set default position if none exists
      if (!currentPositionRef.current) {
        const domain = functionDomains[currentFunction as keyof typeof functionDomains]
        // For Rastrigin, start closer to the global minimum
        const defaultX = currentFunction === "rastrigin" ? 0.1 : (domain.xDomain[0] + domain.xDomain[1]) / 2
        const defaultY = currentFunction === "rastrigin" ? 0.1 : (domain.yDomain[0] + domain.yDomain[1]) / 2
        currentPositionRef.current = [defaultX, defaultY]
        console.log("Using default position:", defaultX, defaultY)
      }

      // Safely get the current position
      const currentPosition = currentPositionRef.current
      if (!currentPosition) {
        console.log("No current position")
        setIsAnimating(false)
        isAnimatingRef.current = false
        return
      }

      const [x, y] = currentPosition
      console.log("Starting position:", x, y)

      // Get active optimizer keys
      const activeOptimizerKeys = Object.entries(activeOptimizers)
        .filter(([_, active]) => active)
        .map(([key]) => key)

      console.log("Active optimizers:", activeOptimizerKeys)

      // Only proceed if we have active optimizers
      if (!activeOptimizerKeys || activeOptimizerKeys.length === 0) {
        console.log("No active optimizers")
        setIsAnimating(false)
        isAnimatingRef.current = false
        return
      }

      // Initialize paths object
      pathsRef.current = {}

      // Create paths for each active optimizer
      for (const name of activeOptimizerKeys) {
        if (!pathGroupRef.current) continue

        pathsRef.current[name] = {
          points: [[x, y]],
          path: pathGroupRef.current
            .append("path")
            .attr("fill", "none")
            .attr("stroke", colors[name as keyof typeof colors])
            .attr("stroke-width", 2),
        }
      }

      // Add starting point
      pathGroupRef.current
        .append("circle")
        .attr("class", "position-point")
        .attr("cx", xScaleRef.current(x))
        .attr("cy", yScaleRef.current(y))
        .attr("r", 5)
        .attr("fill", "black")

      let iteration = 0
      const maxIter = maxIterations

      // Adjust minGradNorm based on the function
      const minGradNorm = currentFunction === "rastrigin" ? 1e-4 : 1e-6

      // Animation function
      const animate = () => {
        try {
          console.log("Animation step, isAnimating:", localIsAnimating, "iteration:", iteration, "max:", maxIter)

          // Check if we should stop animation
          if (!localIsAnimating || !isAnimatingRef.current) {
            console.log("Animation stopped because animation flag is false")
            finishAnimation()
            return
          }

          if (iteration >= maxIter) {
            console.log("Animation completed because max iterations reached")
            finishAnimation()
            return
          }

          // Update progress
          const progress = Math.min(100, Math.round((iteration / maxIter) * 100))
          setAnimationProgress(progress)
          setCurrentIteration(iteration)
          console.log("Animation progress:", progress, "%, iteration:", iteration)

          // Process one step for each optimizer
          let allConverged = true

          for (const name of activeOptimizerKeys) {
            if (!pathsRef.current || !pathsRef.current[name]) {
              console.log("Missing path for optimizer:", name)
              continue
            }

            const path = pathsRef.current[name]
            if (!path.points || path.points.length === 0) {
              console.log("No points for optimizer:", name)
              continue
            }

            const lastPoint = path.points[path.points.length - 1]
            const [x, y] = lastPoint

            // Calculate gradient
            const grad = gradient(functions[currentFunction as keyof typeof functions], x, y)
            const gradNorm = Math.sqrt(grad[0] * grad[0] + grad[1] * grad[1])
            console.log("Optimizer:", name, "position:", x, y, "gradient norm:", gradNorm)

            if (gradNorm > minGradNorm) {
              allConverged = false

              // Apply optimizer update
              const optimizer = optimizersRef.current[name as keyof typeof optimizersRef.current]
              if (!optimizer) {
                console.log("Missing optimizer instance for:", name)
                continue
              }

              const update = optimizer.step(grad)

              // For Rastrigin, add a small amount of noise to help escape local minima
              let newX = x - update[0]
              let newY = y - update[1]

              if (currentFunction === "rastrigin" && Math.random() < 0.1 && iteration < maxIter / 2) {
                // Add small random perturbation 10% of the time in the first half of iterations
                newX += (Math.random() - 0.5) * 0.1
                newY += (Math.random() - 0.5) * 0.1
                console.log("Added noise to", name, "new position:", newX, newY)
              }

              console.log("New position for", name, ":", newX, newY)
              path.points.push([newX, newY])
            }
          }

          // Update path visualization
          updatePaths()

          // Increment iteration counter
          iteration++

          // If all optimizers have converged, end animation
          if (allConverged) {
            console.log("All optimizers converged")
            finishAnimation()
          } else {
            // Continue animation
            console.log("Scheduling next animation step")
            animationIdRef.current = window.setTimeout(animate, animationSpeed)
          }
        } catch (error) {
          console.error("Error in animation step:", error)
          setIsAnimating(false)
          isAnimatingRef.current = false
        }
      }

      // Helper function to finish animation
      const finishAnimation = () => {
        console.log("Finishing animation")

        // Add endpoints
        if (pathGroupRef.current && xScaleRef.current && yScaleRef.current && pathsRef.current) {
          for (const name of activeOptimizerKeys) {
            if (!pathsRef.current[name]) continue

            const path = pathsRef.current[name]
            if (!path || !path.points || path.points.length === 0) continue

            const [x, y] = path.points[path.points.length - 1]

            pathGroupRef.current
              .append("circle")
              .attr("class", "position-point")
              .attr("cx", xScaleRef.current(x))
              .attr("cy", yScaleRef.current(y))
              .attr("r", 4)
              .attr("fill", colors[name as keyof typeof colors])
          }
        }

        // Reset state
        setIsAnimating(false)
        isAnimatingRef.current = false
        setAnimationProgress(100)
      }

      // Start animation
      console.log("Starting animation loop")
      animate()
    } catch (error) {
      console.error("Error starting animation:", error)
      setIsAnimating(false)
      isAnimatingRef.current = false
    }
  }

  // Stop animation
  const stopAnimation = () => {
    console.log("Stopping animation")
    if (animationIdRef.current) {
      clearTimeout(animationIdRef.current)
      animationIdRef.current = null
    }

    setIsAnimating(false)
    isAnimatingRef.current = false
  }

  // Update paths
  const updatePaths = () => {
    if (!xScaleRef.current || !yScaleRef.current || !pathsRef.current) return

    const line = d3
      .line<[number, number]>()
      .x((d) => xScaleRef.current!(d[0]))
      .y((d) => yScaleRef.current!(d[1]))
      .curve(d3.curveBasis)

    Object.keys(pathsRef.current).forEach((name) => {
      if (!pathsRef.current || !pathsRef.current[name] || !pathsRef.current[name].path) return

      const path = pathsRef.current[name]
      path.path.attr("d", line(path.points))
    })
  }

  // Handle optimizer toggle
  const handleOptimizerToggle = (name: string, checked: boolean) => {
    setActiveOptimizers((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const applyOptimizerSelection = () => {
    if (isAnimating) return

    // Reset paths first
    resetPaths()

    // Use default position if no current position exists
    const domain = functionDomains[currentFunction as keyof typeof functionDomains]
    const x = currentPositionRef.current ? currentPositionRef.current[0] : (domain.xDomain[0] + domain.xDomain[1]) / 2
    const y = currentPositionRef.current ? currentPositionRef.current[1] : (domain.yDomain[0] + domain.yDomain[1]) / 2

    // Start optimization with safe coordinates
    startOptimization(x, y)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">优化算法可视化</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          探索不同优化算法在2D非凸函数上的表现。点击函数图像上的任意位置开始优化过程，观察不同算法如何寻找最小值。
        </p>
      </header>

      <div className="flex justify-center mb-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <label htmlFor="function-select" className="text-sm font-medium">
              选择函数:
            </label>
            <Select value={currentFunction} onValueChange={(value) => setCurrentFunction(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择函数" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">主函数 (二次函数+高斯)</SelectItem>
                <SelectItem value="rastrigin">Rastrigin 函数</SelectItem>
                <SelectItem value="rosenbrock">Rosenbrock 函数</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-6">
            {currentFunction === "main" && (
              <div>
                <h3 className="text-xl font-semibold mb-2">主函数</h3>
                <p className="mb-2">该函数由二次"碗"和两个高斯函数组成，创建了两个局部最小值：</p>
                <p className="text-center my-4 text-lg">
                  f(x, y) = x² + y² - a·e^(-(x-1)²+y²)/c) - b·e^(-(x+1)²+y²)/d)
                </p>
                <p>其中参数 a 和 b 控制高斯函数的深度，c 和 d 控制高斯函数的宽度。</p>
              </div>
            )}
            {currentFunction === "rastrigin" && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Rastrigin 函数</h3>
                <p className="mb-2">Rastrigin 函数是一个经典的优化测试函数，具有多个局部最小值：</p>
                <p className="text-center my-4 text-lg">f(x, y) = 20 + x² - 10·cos(2πx) + y² - 10·cos(2πy)</p>
                <p>它由一个二次碗和正弦波组成，创建了大量的局部最小值，全局最小值位于 (0,0)。</p>
              </div>
            )}
            {currentFunction === "rosenbrock" && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Rosenbrock 函数</h3>
                <p className="mb-2">Rosenbrock 函数（香蕉函数）是另一个经典的优化测试函数：</p>
                <p className="text-center my-4 text-lg">f(x, y) = (1-x)² + 100(y-x²)²</p>
                <p>它的全局最小值位于弯曲的山谷内，算法通常很容易找到山谷，但很难找到山谷内的最小值。</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="lg:col-span-2">
          <div ref={visualizationRef} className="w-full h-[500px] border border-gray-200 rounded-lg bg-white"></div>

          {/* Animation Progress Bar */}
          {isAnimating && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  优化进度: 迭代 {currentIteration}/{maxIterations}
                </span>
                <span className="text-sm font-medium">{animationProgress}%</span>
              </div>
              <Progress value={animationProgress} className="h-2" />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">优化算法</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sgd-toggle"
                    checked={activeOptimizers.sgd}
                    onCheckedChange={(checked) => handleOptimizerToggle("sgd", checked as boolean)}
                  />
                  <label htmlFor="sgd-toggle" className="text-sm font-medium" style={{ color: colors.sgd }}>
                    SGD
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="momentum-toggle"
                    checked={activeOptimizers.momentum}
                    onCheckedChange={(checked) => handleOptimizerToggle("momentum", checked as boolean)}
                  />
                  <label htmlFor="momentum-toggle" className="text-sm font-medium" style={{ color: colors.momentum }}>
                    动量SGD
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rmsprop-toggle"
                    checked={activeOptimizers.rmsprop}
                    onCheckedChange={(checked) => handleOptimizerToggle("rmsprop", checked as boolean)}
                  />
                  <label htmlFor="rmsprop-toggle" className="text-sm font-medium" style={{ color: colors.rmsprop }}>
                    RMSProp
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adam-toggle"
                    checked={activeOptimizers.adam}
                    onCheckedChange={(checked) => handleOptimizerToggle("adam", checked as boolean)}
                  />
                  <label htmlFor="adam-toggle" className="text-sm font-medium" style={{ color: colors.adam }}>
                    Adam
                  </label>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={applyOptimizerSelection} disabled={isAnimating} size="sm" className="w-full">
                  应用选择
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">参数设置</h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="learning-rate" className="text-sm font-medium">
                      学习率:
                    </label>
                    <span className="text-sm">{learningRate.toFixed(3)}</span>
                  </div>
                  <Slider
                    id="learning-rate"
                    min={0.001}
                    max={0.1}
                    step={0.001}
                    value={[learningRate]}
                    onValueChange={(value) => setLearningRate(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="momentum" className="text-sm font-medium">
                      动量值:
                    </label>
                    <span className="text-sm">{momentum.toFixed(2)}</span>
                  </div>
                  <Slider
                    id="momentum"
                    min={0}
                    max={0.99}
                    step={0.01}
                    value={[momentum]}
                    onValueChange={(value) => setMomentum(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="iterations" className="text-sm font-medium">
                      最大迭代次数:
                    </label>
                    <span className="text-sm">{maxIterations}</span>
                  </div>
                  <Slider
                    id="iterations"
                    min={10}
                    max={500}
                    step={10}
                    value={[maxIterations]}
                    onValueChange={(value) => setMaxIterations(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="animation-speed" className="text-sm font-medium">
                      动画速度:
                    </label>
                    <span className="text-sm">
                      {animationSpeed === 100 ? "慢" : animationSpeed === 50 ? "中" : "快"}
                    </span>
                  </div>
                  <Slider
                    id="animation-speed"
                    min={10}
                    max={100}
                    step={10}
                    value={[animationSpeed]}
                    onValueChange={(value) => setAnimationSpeed(value[0])}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={resetPaths}>
              重置
            </Button>
            <Button onClick={animateOptimization} disabled={isAnimating}>
              动画展示
            </Button>
            <Button variant="destructive" onClick={stopAnimation} disabled={!isAnimating}>
              停止
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">观察与分析</h2>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-3">不同优化算法的比较</h3>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>
                <strong>SGD</strong>: 学习过程缓慢，容易陷入局部最小值
              </li>
              <li>
                <strong>动量SGD</strong>: 加速收敛，但可能会在最小值附近震荡
              </li>
              <li>
                <strong>RMSProp</strong>: 自适应学习率，对不同特征维度有不同的学习率
              </li>
              <li>
                <strong>Adam</strong>: 结合了动量和自适应学习率，通常表现最稳定
              </li>
            </ul>
            <p>点击函数图像开始优化，观察不同算法的行为差异。</p>
          </CardContent>
        </Card>
      </div>

      <footer className="text-center mt-16 text-gray-500 text-sm">
        <p>优化算法可视化 | 基于Next.js和D3.js实现</p>
      </footer>
    </div>
  )
}
