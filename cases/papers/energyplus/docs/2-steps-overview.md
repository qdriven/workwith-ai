以下是对论文中实现的主要图表的详细说明，包括每个图表的含义、所需输入数据以及实现方法。

## 1. 图表概述

### 图表 1：平均能耗与温度偏差折线图
- **含义**：展示 DQN 控制策略在不同训练周期下的平均能耗和温度偏差变化，反映控制策略的有效性。
- **输入数据**：
  - **训练周期**：从 1 到 30 的整数，表示训练的轮次。
  - **平均能耗**：每个训练周期的能耗数据（单位：kWh）。
  - **温度偏差**：每个训练周期的温度偏差数据（单位：°C）。
  
- **实现方法**：
  ```python
  import matplotlib.pyplot as plt
  import numpy as np

  # 示例数据
  episodes = np.arange(1, 31)  # 训练周期
  energy_consumption = np.random.rand(30) * 100  # 模拟能耗数据
  temperature_violations = np.random.rand(30) * 10  # 模拟温度偏差数据

  plt.figure(figsize=(10, 6))
  plt.plot(episodes, energy_consumption, label='平均能耗 (kWh)', color='blue', marker='o')
  plt.plot(episodes, temperature_violations, label='温度偏差 (°C)', color='red', marker='x')
  plt.title('DQN 控制策略的能耗与温度偏差')
  plt.xlabel('训练周期')
  plt.ylabel('值')
  plt.legend()
  plt.grid()
  plt.show()
  ```

### 图表 2：不同设定点的能耗比较柱状图
- **含义**：比较不同温度设定点下的能耗，展示 DQN 控制策略与固定设定点策略的能耗差异。
- **输入数据**：
  - **设定点标签**：如“设定点 A”、“设定点 B”、“设定点 C”。
  - **能耗值**：对应每个设定点的能耗（单位：kWh）。

- **实现方法**：
  ```python
  labels = ['设定点 A', '设定点 B', '设定点 C']
  values = [65, 80, 55]  # 示例能耗数据

  plt.bar(labels, values, color=['blue', 'orange', 'green'])
  plt.title('不同设定点的能耗比较')
  plt.xlabel('设定点')
  plt.ylabel('能耗 (kWh)')
  plt.show()
  ```

### 图表 3：训练过程中的温度设定点变化
- **含义**：展示 DQN 控制策略在训练过程中的供气温度和冷却水温度设定点的变化情况，反映控制策略的适应性。
- **输入数据**：
  - **训练周期**：从 1 到 30 的整数。
  - **供气温度设定点**：每个训练周期的供气温度设定点（单位：°C）。
  - **冷却水温度设定点**：每个训练周期的冷却水温度设定点（单位：°C）。

- **实现方法**：
  ```python
  supply_air_temps = [12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18]  # 示例数据
  chilled_water_temps = [6, 6.5, 7, 7.5, 8, 8.5, 9]  # 示例数据

  plt.figure(figsize=(10, 6))
  plt.plot(episodes, supply_air_temps, label='供气温度设定点 (°C)', color='blue', marker='o')
  plt.plot(episodes, chilled_water_temps, label='冷却水温度设定点 (°C)', color='green', marker='x')
  plt.title('训练过程中的温度设定点变化')
  plt.xlabel('训练周期')
  plt.ylabel('温度 (°C)')
  plt.legend()
  plt.grid()
  plt.show()
  ```

### 图表 4：控制性能比较图
- **含义**：比较 DQN 控制策略和固定设定点策略在能耗和温度偏差上的表现，展示 DQN 策略的优势。
- **输入数据**：
  - **能耗数据**：DQN 策略与固定设定点策略的能耗（单位：kWh）。
  - **温度偏差数据**：DQN 策略与固定设定点策略的温度偏差（单位：°C）。

- **实现方法**：
  ```python
  dqn_energy = [57, 58, 59]  # DQN 策略能耗示例
  fixed_energy = [60, 61, 62]  # 固定设定点策略能耗示例
  dqn_temp_violation = [5, 4, 3]  # DQN 策略温度偏差示例
  fixed_temp_violation = [7, 6, 5]  # 固定设定点策略温度偏差示例

  bar_width = 0.35
  x = np.arange(len(dqn_energy))

  plt.bar(x - bar_width/2, dqn_energy, width=bar_width, label='DQN 策略能耗')
  plt.bar(x + bar_width/2, fixed_energy, width=bar_width, label='固定设定点策略能耗')
  plt.title('DQN 控制策略与固定设定点策略能耗比较')
  plt.xlabel('设定点类型')
  plt.ylabel('能耗 (kWh)')
  plt.xticks(x, ['设定点 A', '设定点 B', '设定点 C'])
  plt.legend()
  plt.show()
  ```

## 2. 总结
以上是论文中实现的主要图表，包括它们的含义、所需输入数据和实现方法。这些图表帮助读者理解 DQN 控制策略在 HVAC 系统中的应用效果，展示了能耗与温度偏差的变化趋势，并比较了不同控制策略的性能。通过使用 Matplotlib 等绘图库，您可以轻松生成这些图表以支持您的研究或展示。