// Update the Rastrigin function to match the standard formula
export const functions = {
  // Main function: quadratic function + two Gaussian functions
  main: (x: number, y: number, params = {}) => {
    const a = 1.5
    const b = 1.0
    const c = 0.2
    const d = 0.2

    return (
      x * x + y * y - a * Math.exp(-((x - 1) * (x - 1) + y * y) / c) - b * Math.exp(-((x + 1) * (x + 1) + y * y) / d)
    )
  },

  // Rastrigin function - standard formula
  rastrigin: (x: number, y: number) => {
    const A = 10
    return 2 * A + (x * x - A * Math.cos(2 * Math.PI * x)) + (y * y - A * Math.cos(2 * Math.PI * y))
  },

  // Rosenbrock function
  rosenbrock: (x: number, y: number) => {
    const a = 1,
      b = 100
    return Math.pow(a - x, 2) + b * Math.pow(y - x * x, 2)
  },
}

// 计算梯度
export function gradient(func: Function, x: number, y: number, params = {}, h = 1e-4) {
  const fx1 = func(x + h, y, params)
  const fx2 = func(x - h, y, params)
  const fy1 = func(x, y + h, params)
  const fy2 = func(x, y - h, params)

  const dx = (fx1 - fx2) / (2 * h)
  const dy = (fy1 - fy2) / (2 * h)

  return [dx, dy]
}

// 函数域范围配置
export const functionDomains: Record<string, { xDomain: [number, number]; yDomain: [number, number] }> = {
  main: {
    xDomain: [-2, 2],
    yDomain: [-2, 2],
  },
  rastrigin: {
    xDomain: [-5, 5],
    yDomain: [-5, 5],
  },
  rosenbrock: {
    xDomain: [-2, 2],
    yDomain: [-1, 3],
  },
}
