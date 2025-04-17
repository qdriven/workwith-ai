### Key Points
- It seems likely that reproducing the paper requires setting up EnergyPlus and Python with specific libraries for co-simulation and reinforcement learning.
- Research suggests using AWS or similar cloud platforms for remote setup, given the paper's high hardware needs.
- The evidence leans toward downloading the building model and weather data from the DOE website for accuracy.

---

### Setting Up the Environment
To reproduce the paper, you'll need to create an environment where EnergyPlus simulates the building, and Python handles the DQN agent. Start by installing EnergyPlus (version 9.0 or later) from [EnergyPlus](https://energyplus.net/downloads). Then, set up Python (preferably using Anaconda) and install key libraries: PyFMI (`pip install pyfmi`), PyTorch (`pip install torch`), and EnergyPlusToFMU (`pip install energyplus-fmu`). Ensure FMILibrary is installed for PyFMI, which may require system-level dependencies on Linux.

For remote setup, consider using AWS EC2 with a GPU instance (e.g., p3.2xlarge) to meet the paper's hardware requirements (Intel Xeon, 128 GB RAM, GeForce RTX 3090). Alternatively, use Docker for reproducibility, creating an image with all dependencies.

### Obtaining and Preparing Data
Download the large office building model (ASHRAE901_OfficeLarge_STD2019.idf) and Tampa weather file (USA_FL_Tampa.Intl.AP.722110_TMY3.epw) from the [DOE Building Energy Codes Program](https://energycodes.gov/prototype-building-models). Use EnergyPlusToFMU to export the model as an FMU for co-simulation.

### Implementing the Code
Write Python code to load the FMU using PyFMI, define the DQN agent with states (e.g., occupancy, temperatures) and 49 discrete actions (temperature setpoints), and run simulations for training (July) and testing (August) with 10-minute updates. The code should include a reward function balancing energy and comfort, as described in the paper.

An unexpected detail is that resetting the simulation for multiple training episodes may require running EnergyPlus from scratch each time, which could be computationally intensive.

---

---

### Survey Note: Reproducing the Paper in Python and Setting Up the Environment

This note provides a comprehensive guide to reproducing the research from the paper "Deep reinforcement learning optimal control strategy for temperature setpoint real-time reset in multi-zone building HVAC system" (DOI: 10.1016/j.applthermaleng.2022.119503), focusing on implementing the methodology in Python and setting up the necessary environment, including remote options. The paper, published in *Applied Thermal Engineering* in 2022, explores using Deep Q-learning (DQN) to optimize HVAC control in a multi-zone building, balancing energy consumption and thermal comfort through co-simulation with EnergyPlus.

#### Background and Methodology
The paper's methodology involves formulating the HVAC control problem as a Markov Decision Process (MDP) within a DQN framework. The objective is to dynamically reset supply air temperature and chilled supply water temperature setpoints in real-time. Key components include:
- **State Space**: Includes indoor environment factors (occupancy, indoor air temperature), outdoor factors (outdoor air temperature, direct solar radiation), and HVAC operating states (current setpoints). These are detailed in Table 2 of the paper, though exact variables need to be inferred for implementation.
- **Action Space**: Discrete actions with 49 combinations, derived from supply air temperature (12°C to 18°C in 1°C steps, 7 options) and chilled water temperature (6°C to 9°C in 0.5°C steps, 7 options, e.g., 6, 6.5, 7, 7.5, 8, 8.5, 9°C).
- **Reward Function**: A multi-objective function combining energy consumption (chiller, fan, pump) and temperature violations, scaled using max-min normalization (Equation 5 in the paper). The reward is zero during unoccupied periods and a penalty during occupied periods (Monday to Saturday, 8:00 a.m. to 8:00 p.m.).
- **Simulation Setup**: Uses a large office building model (ASHRAE901_OfficeLarge_STD2019_Tampa.idf) with weather data from Tampa, Florida (USA_FL_Tampa.Intl.AP.722110_TMY3.epw). Training spans July 1st to July 31st (4464 steps at 10-minute intervals), and testing from August 1st to August 31st, stabilizing after approximately 10 training episodes.

The DQN algorithm, implemented in Python using PyTorch (version 1.7 or later), includes exploration (ε-greedy with decay) and learning loops, with hyperparameters like learning rate (0.001), discount factor (0.99), and batch size (512) tuned for performance.

#### Tools and Software
The paper relies on several tools for implementation:
- **EnergyPlus**: An open-source building and HVAC simulation software from the U.S. Department of Energy (DOE) and Lawrence Berkeley National Laboratory (LBNL). Download from [EnergyPlus](https://energyplus.net/downloads), ensuring version 9.0 or later.
- **EnergyPlusToFMU**: A Python package for exporting EnergyPlus models as FMUs, installed via `pip install energyplus-fmu`. Details at [EnergyPlusToFMU GitHub](https://github.com/lbl-srg/EnergyPlusToFMU).
- **PyFMI**: A Python package for loading and interacting with FMUs, supporting co-simulation. Install via `pip install pyfmi`. Documentation at [PyFMI GitHub](https://github.com/modelon-community/PyFMI).
- **PyTorch**: Used for DQN implementation, installed via `pip install torch`. The paper specifies PyTorch 1.7, but later versions are compatible.
- **Co-simulation Testbed**: A custom EnergyPlus-Python co-simulation platform, not relying on BCVTB or OpenAI Gym, offering scalability and debugging capabilities.

#### Setting Up the Environment
Given the paper's hardware requirements (Intel Xeon(R) Gold 6226R processor, 128 GB RAM, GeForce RTX 3090 GPU), setting up locally may require significant resources. For accessibility and scalability, a remote setup on cloud platforms is recommended.

##### Local Setup
- **Hardware**: Ensure a machine with at least Intel Xeon or equivalent, 128 GB RAM, and a GPU like GeForce RTX 3090 for efficient DQN training.
- **Software Installation**:
  - Install EnergyPlus by downloading the appropriate version from [EnergyPlus](https://energyplus.net/downloads) and following installation instructions.
  - Install Python, preferably using Anaconda for package management. Create a conda environment:
    ```bash
    conda create -n dqn_hvac python=3.8
    conda activate dqn_hvac
    ```
  - Install required libraries:
    ```bash
    pip install pyfmi torch numpy
    pip install energyplus-fmu
    ```
  - For PyFMI, ensure FMILibrary is installed. On Linux, this may require:
    - System dependencies: `sudo apt-get install build-essential libxml2-dev libzip-dev libglpk-dev`
    - Build FMILibrary from source:
      ```bash
      git clone https://github.com/modelon/fmi-library.git
      cd fmi-library
      mkdir build
      cd build
      cmake ..
      make
      sudo make install
      ```
    - Set `LD_LIBRARY_PATH`: `export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH`

##### Remote Setup on Cloud
- **Platform Choice**: Use AWS, Google Cloud, or Azure. For example, AWS EC2 offers GPU instances like p3.2xlarge (V100 GPU), though the paper's RTX 3090 is more powerful, affecting training speed.
- **Steps on AWS**:
  - Create an account at [AWS](https://aws.amazon.com/).
  - Launch an EC2 instance with GPU (e.g., p3.2xlarge), using Amazon Linux 2 AMI.
  - Install EnergyPlus: Download and extract the Linux version, set PATH.
  - Install Miniconda:
    ```bash
    wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
    bash Miniconda3-latest-Linux-x86_64.sh
    ```
  - Follow the same conda environment and library installation as above, including FMILibrary.
- **Alternative: Docker**: For reproducibility, use Docker on the remote server. Build a custom image with EnergyPlus, Python, PyFMI, and PyTorch. Example Dockerfile:
  ```dockerfile
  FROM ubuntu:20.04
  RUN apt-get update && apt-get install -y build-essential libxml2-dev libzip-dev libglpk-dev wget
  RUN wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh && bash Miniconda3-latest-Linux-x86_64.sh -b
  RUN source /root/miniconda3/bin/activate && conda create -n dqn_hvac python=3.8 -y && conda activate dqn_hvac
  RUN pip install pyfmi torch numpy energyplus-fmu
  RUN git clone https://github.com/modelon/fmi-library.git && cd fmi-library && mkdir build && cd build && cmake .. && make && make install
  ENV LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
  ```
  Build with `docker build -t dqn_hvac .` and run on the server.

#### Obtaining and Preparing Data
- **Building Model**: The paper uses the ASHRAE 90.1-2019 large office model. Download from [DOE Building Energy Codes Program](https://energycodes.gov/prototype-building-models), specifically [ASHRAE901_OfficeLarge_STD2019.zip](https://energycodes.gov/sites/default/files/2023-10/ASHRAE901_OfficeLarge_STD2019.zip). Extract the IDF file.
- **Weather Data**: Download [ASHRAE901_epw.zip](https://energycodes.gov/sites/default/files/2023-10/ASHRAE901_epw.zip) and extract `USA_FL_Tampa.Intl.AP.722110_TMY3.epw` for Tampa, Florida, as used in the paper.
- **Export FMU**: Use EnergyPlusToFMU to convert the IDF to FMU:
  ```bash
  energyplus_fmu -w path/to/USA_FL_Tampa.Intl.AP.722110_TMY3.epw -i path/to/ASHRAE901_OfficeLarge_STD2019.idf -o path/to/output.fmu
  ```
  This creates an FMU file for co-simulation.

#### Implementing the Code in Python
The implementation involves loading the FMU, defining the DQN agent, and running simulations for training and testing. Below is a detailed code skeleton:

```python
import pyfmi
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

# Load FMU
fmu_path = 'path/to/output.fmu'
model = pyfmi.load_fmu(fmu_path)
model.initialize()

# DQN Agent Class
class DQNAgent:
    def __init__(self, state_size, action_size):
        self.state_size = state_size
        self.action_size = action_size
        self.model = nn.Sequential(
            nn.Linear(state_size, 24),
            nn.ReLU(),
            nn.Linear(24, 24),
            nn.ReLU(),
            nn.Linear(24, action_size)
        )
        self.optimizer = optim.Adam(self.model.parameters(), lr=0.001)

    def choose_action(self, state, epsilon):
        if np.random.rand() < epsilon:
            return np.random.randint(self.action_size)
        else:
            with torch.no_grad():
                return torch.argmax(self.model(torch.tensor(state, dtype=torch.float32))).item()

    def train(self, state, action, reward, next_state, done):
        # Implement DQN training logic (e.g., experience replay)
        pass

# Initialize Agent
state_size = 10  # Example: occupancy, indoor temp, outdoor temp, etc.
action_size = 49  # 7 supply air temps * 7 chilled water temps
agent = DQNAgent(state_size, action_size)

# Simulation Loop
current_time = 0
total_simulation_time = 86400 * 31  # 31 days in seconds
step_size = 600  # 10 minutes
epsilon = 1.0
epsilon_min = 0.01
epsilon_decay = 0.995

while current_time < total_simulation_time:
    state = model.get(['occupancy', 'indoor_temp', 'outdoor_temp', 'solar_radiation', 'current_setpoints'])
    action = agent.choose_action(state, epsilon)
    # Map action to setpoints (example)
    supply_air_temp = 12 + (action // 7)
    chilled_water_temp = 6 + (action % 7) * 0.5
    model.set('supply_air_setpoint', supply_air_temp)
    model.set('chilled_water_setpoint', chilled_water_temp)
    model.do_step(current_time, step_size)
    new_state = model.get(['occupancy', 'indoor_temp', 'outdoor_temp', 'solar_radiation', 'current_setpoints'])
    reward = calculate_reward()  # Implement as per paper
    agent.train(state, action, reward, new_state, False)
    state = new_state
    current_time += step_size
    if epsilon > epsilon_min:
        epsilon *= epsilon_decay

model.terminate()
```

- **Training and Testing**: Run multiple episodes for July (e.g., 10 runs) to train the agent, then simulate August for testing. Each episode involves resetting the simulation, which may require reinitializing the FMU, potentially running EnergyPlus from scratch each time, which is computationally intensive.

#### Challenges and Considerations
- **Computational Intensity**: Simulating 31 days with 10-minute steps (4464 steps) per episode, and running multiple episodes, requires significant resources. The paper's use of a GeForce RTX 3090 GPU highlights this need, and cloud setups may use less powerful GPUs (e.g., V100), potentially slowing training.
- **Simulation Reset**: Resetting for multiple episodes may involve reinitializing the FMU, which could be inefficient. The paper likely ran independent simulations for each episode, given the stabilization after 10 episodes.
- **Reward Function Implementation**: The exact reward function (Equation 5) needs careful implementation, balancing energy and comfort, and may require tuning based on paper results.
- **Hardware Match**: While exact hardware replication (RTX 3090) is ideal, cloud instances with V100 GPUs are viable alternatives, though training times may differ.

#### Evaluation and Reproduction
- Evaluate performance using metrics like average energy consumption and temperature violations, comparing against fixed setpoint strategies as in the paper (Figures 13-22, Table 4). Ensure the simulation parameters (occupied periods, time steps) match the paper's setup.

This comprehensive approach should enable reproduction of the paper's results, leveraging both local and remote setups for flexibility and scalability.

#### Table: Summary of Tools and Resources

| **Tool/Resource**          | **Description**                                                                 | **Installation/Access**                                      |
|----------------------------|-------------------------------------------------------------------------------|-------------------------------------------------------------|
| EnergyPlus                 | Building and HVAC simulation software                                         | Download from [EnergyPlus](https://energyplus.net/downloads) |
| EnergyPlusToFMU            | Exports EnergyPlus models as FMUs for co-simulation                           | `pip install energyplus-fmu`, details at [EnergyPlusToFMU GitHub](https://github.com/lbl-srg/EnergyPlusToFMU) |
| PyFMI                      | Loads and interacts with FMUs in Python                                       | `pip install pyfmi`, documentation at [PyFMI GitHub](https://github.com/modelon-community/PyFMI) |
| PyTorch                    | Implements DQN agent for reinforcement learning                               | `pip install torch`                                         |
| DOE Prototype Models       | Provides building models (e.g., ASHRAE901_OfficeLarge_STD2019)               | Download from [DOE Building Energy Codes Program](https://energycodes.gov/prototype-building-models) |
| Weather Files              | TMY3 weather data for Tampa, Florida                                          | Included in [ASHRAE901_epw.zip](https://energycodes.gov/sites/default/files/2023-10/ASHRAE901_epw.zip) |

---

### Key Citations
- [DOE Prototype Building Models](https://energycodes.gov/prototype-building-models)
- [EnergyPlus Official Website](https://energyplus.net/downloads)
- [EnergyPlusToFMU GitHub](https://github.com/lbl-srg/EnergyPlusToFMU)
- [PyFMI GitHub](https://github.com/modelon-community/PyFMI)


