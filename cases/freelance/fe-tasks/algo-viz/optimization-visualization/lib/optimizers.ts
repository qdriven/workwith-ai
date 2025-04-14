// 优化器基类
export class Optimizer {
  lr: number

  constructor(params: { lr?: number } = {}) {
    this.lr = params.lr || 0.01
  }

  step(gradient: number[]): number[] {
    throw new Error("Not implemented")
  }

  reset(): void {
    // 重置优化器状态
  }
}

// SGD优化器
export class SGD extends Optimizer {
  constructor(params: { lr?: number } = {}) {
    super(params)
  }

  step(gradient: number[]): number[] {
    return gradient.map((g) => g * this.lr)
  }

  reset(): void {
    // SGD没有状态需要重置
  }
}

// 带动量的SGD优化器
export class MomentumSGD extends Optimizer {
  momentum: number
  velocity: number[]

  constructor(params: { lr?: number; momentum?: number } = {}) {
    super(params)
    this.momentum = params.momentum || 0.9
    this.velocity = [0, 0]
  }

  step(gradient: number[]): number[] {
    this.velocity = this.velocity.map((v, i) => this.momentum * v - this.lr * gradient[i])
    return [...this.velocity]
  }

  reset(): void {
    this.velocity = [0, 0]
  }
}

// RMSProp优化器
export class RMSProp extends Optimizer {
  decay: number
  epsilon: number
  cache: number[]

  constructor(params: { lr?: number; decay?: number; epsilon?: number } = {}) {
    super(params)
    this.decay = params.decay || 0.99
    this.epsilon = params.epsilon || 1e-8
    this.cache = [0, 0]
  }

  step(gradient: number[]): number[] {
    this.cache = this.cache.map((c, i) => this.decay * c + (1 - this.decay) * gradient[i] * gradient[i])

    return gradient.map((g, i) => (this.lr * g) / (Math.sqrt(this.cache[i]) + this.epsilon))
  }

  reset(): void {
    this.cache = [0, 0]
  }
}

// Adam优化器
export class Adam extends Optimizer {
  beta1: number
  beta2: number
  epsilon: number
  m: number[]
  v: number[]
  t: number

  constructor(params: { lr?: number; beta1?: number; beta2?: number; epsilon?: number } = {}) {
    super(params)
    this.beta1 = params.beta1 || 0.9
    this.beta2 = params.beta2 || 0.999
    this.epsilon = params.epsilon || 1e-8
    this.m = [0, 0]
    this.v = [0, 0]
    this.t = 0
  }

  step(gradient: number[]): number[] {
    this.t += 1

    // Update biased first moment estimate
    this.m = this.m.map((m, i) => this.beta1 * m + (1 - this.beta1) * gradient[i])

    // Update biased second raw moment estimate
    this.v = this.v.map((v, i) => this.beta2 * v + (1 - this.beta2) * gradient[i] * gradient[i])

    // Compute bias-corrected first moment estimate
    const mCorrected = this.m.map((m) => m / (1 - Math.pow(this.beta1, this.t)))

    // Compute bias-corrected second raw moment estimate
    const vCorrected = this.v.map((v) => v / (1 - Math.pow(this.beta2, this.t)))

    // Update parameters
    return mCorrected.map((m, i) => (this.lr * m) / (Math.sqrt(vCorrected[i]) + this.epsilon))
  }

  reset(): void {
    this.m = [0, 0]
    this.v = [0, 0]
    this.t = 0
  }
}
