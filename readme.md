# Beyond The Line of Sight - Occlusion-Aware Perception for Human-Following Robots

## Overview

This codebase is the implementation component of a research thesis focused on **robot navigation and human tracking in Non-Line-of-Sight (NLOS) environments**. The project presents an intelligent simulation system that addresses the challenge of maintaining accurate positioning and navigation when obstacles obstruct direct line-of-sight between tracking devices and targets.

The simulator demonstrates how autonomous robots can navigate complex environments and track human movement using **Ultra-Wideband (UWB) positioning technology** combined with **map-building algorithms** and **intelligent path planning**. This research is particularly relevant for applications in search and rescue operations, indoor navigation, warehouse automation, and assisted living environments where obstacles frequently block direct visibility.

## Demo

<img width="1571" height="740" alt="simualtor_interface" src="https://github.com/user-attachments/assets/144f5bbb-8ab1-49ff-9668-188e26090ab4" />
*Main simulator interface showing robot, human, obstacles, and UWB positioning*

## Research Problem

Traditional positioning systems rely on line-of-sight communication between positioning anchors and tags. In real-world scenarios with walls, furniture, and other obstacles, these systems face significant accuracy degradation. This project tackles:

- **Occlusion Resolution**: Handling situations where UWB signals are blocked by obstacles
- **Dynamic Map Building**: Creating and updating environmental maps in real-time using LIDAR-like obstacle detection
- **Intelligent Path Planning**: Using A* algorithm for optimal robot navigation around obstacles
- **Sensor Fusion**: Combining UWB positioning data with environmental awareness for robust localization

## Technology Stack

### Core Technologies

#### TypeScript
**Why**: Provides type safety and prevents runtime errors in complex simulation logic involving robots, UWB positioning, and spatial algorithms.

#### Konva.js (Canvas Graphics Library)
**Why**: High-performance 2D canvas rendering for real-time visualization of moving entities, UWB circles, and dynamic map updates.

#### RxJS (Reactive Extensions)
**Why**: Manages asynchronous data streams from UWB sensors, robot movements, and WebSocket communications efficiently.

#### Webpack + Webpack Dev Server
**Why**: Bundles TypeScript modules and enables hot-reload for rapid development iteration.

### Development Tools

- **TypeScript Compiler**: Transpiles TypeScript to JavaScript with strict type checking
- **Concurrently**: Runs TypeScript compiler in watch mode alongside the webpack dev server
- **HTML Webpack Plugin**: Automatically injects bundled scripts into the HTML template

### Key Architectural Components

1. **UWB Positioning System** ([uwb/](uwb/))
   - Simulates Ultra-Wideband anchors and tags with configurable error percentages
   - Implements trilateration for position estimation
   - Models signal degradation in NLOS conditions

2. **Robot Controller** ([robot/robot_controller.ts](robot/robot_controller.ts))
   - Manages robot movement and decision-making
   - Handles occlusion resolution in both known and unknown environments
   - Implements frontier-based exploration for unmapped areas

3. **A* Path Planning** ([robot/astar.ts](robot/astar.ts))
   - Optimal pathfinding algorithm with obstacle avoidance
   - Dynamic replanning when new obstacles are discovered
   - Considers inflated obstacles for safe robot navigation

4. **Map Builder** ([map_builder/](map_builder/))
   - Creates occupancy grid maps from obstacle detection
   - Updates maps dynamically as the robot explores
   - Maintains separate maps for human travel and robot exploration

5. **Environment Simulation** ([environment/](environment/))
   - Manages static obstacles and dynamic entities (human, robot)
   - Provides matrix representation of the environment for algorithms
   - Handles collision detection and spatial queries

6. **Graphics Layer** ([graphics/](graphics/))
   - Abstracts canvas rendering operations
   - Supports visualization toggles (debug labels, UWB circles, A* paths)
   - Renders multiple synchronized map views at different scales

## Features

- ✅ Real-time visualization of robot and human movement
- ✅ UWB positioning simulation with configurable error modeling
- ✅ Obstacle detection and avoidance
- ✅ Dynamic map building and exploration
- ✅ A* pathfinding with obstacle inflation
- ✅ NLOS occlusion resolution strategies
- ✅ Interactive controls for manual movement and automated behaviors
- ✅ WebSocket support for external integrations
- ✅ Configurable simulation parameters (speeds, scales, error rates)
- ✅ Multiple visualization modes (debug overlays, distance circles, path visualization)

## Installation & Setup

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

### Installation Steps

1. **Clone or navigate to the project directory**:
   ```bash
   cd Beyond-The-Line-Of-Sight
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the Simulation

### Development Mode (Recommended)

Run the simulator with hot-reload enabled:

```bash
npm run dev
```

This command:
- Starts the TypeScript compiler in watch mode
- Launches webpack dev server on `http://localhost:8080`
- Automatically reloads the browser when code changes are saved

### Accessing the Simulator

1. Open your browser and navigate to: `http://localhost:8080`
2. The simulator interface will load with the environment, robot, and human visible
3. Use the controls to interact with the simulation

## Controls

### Manual Movement
- **Arrow Keys**: Move the human (up, down, left, right)
- **W/A/S/D**: Move the robot (up, left, down, right)

### Occlusion Resolution
- **Resolve Occlusion (Known Environment)**: Uses existing map knowledge to navigate around obstacles
- **Resolve Occlusion (Unknown Environment)**: Employs frontier-based exploration to discover the path

### Configuration
The simulation properties panel allows real-time adjustment of:
- Debug visualization toggles
- UWB error percentages
- Robot movement speed
- Map scales
- Obstacle inflation factors
- And more...

## Research Context

This simulation serves as a proof-of-concept for the research thesis, demonstrating:
- The feasibility of UWB-based tracking in NLOS conditions
- Effectiveness of combining positioning data with autonomous exploration
- Performance of A* pathfinding with dynamic obstacle maps
- Practical strategies for occlusion resolution in indoor environments

The modular architecture allows for easy extension with additional algorithms, sensors, or navigation strategies.

## Future Extensions

Potential areas for enhancement:
- Integration with real UWB hardware
- Multi-robot coordination scenarios
- 3D environment simulation

## License

This project is part of academic research. Please contact the author for usage permissions.

## Author

Shakthi Sachintha

---

*For detailed theoretical background and experimental results, please refer to the accompanying thesis document.*
