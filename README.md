# Soccer Statistics Analyzer

A React-based web application for analyzing soccer player performance data. This application allows users to upload standardized CSV files containing player statistics, visualize the data through interactive charts, and generate detailed PDF reports for individual player analysis.

## Features

- **CSV Data Upload**: Upload and parse standardized soccer statistics CSV files
- **Interactive Visualizations**:
  - Player performance trends over time
  - Team-based analysis and comparisons
  - Position-based performance metrics
  - Comparative analysis between players
- **Comprehensive Analytics**:
  - Distance covered
  - Average and peak speeds
  - Heart rate monitoring
  - Minutes played
  - Position-specific comparisons
- **PDF Report Generation**:
  - Detailed player performance reports
  - Visual performance charts
  - Comparative statistics
  - Match-by-match analysis

## CSV File Format

The application expects CSV files with the following columns:
- PID (Player ID)
- Team Name
- Position
- Match Date
- Distance Covered (km)
- Average Speed (km/h)
- Peak Speed (km/h)
- Average Heart Rate (bpm)
- Peak Heart Rate (bpm)
- Minutes Played

## Getting Started

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd sb_soccer_para
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Building for Production

To create a production build:
```bash
npm run build
```

### Docker Deployment

The application can also be run using Docker:

1. Build the Docker image:
```bash
docker build -t soccer-stats-app .
```

2. Run the container:
```bash
docker run -d -p 3017:3017 --name soccer-stats soccer-stats-app
```

The application will be available at `http://localhost:3017`

For more detailed Docker instructions, see [instructions.md](instructions.md).

## Technologies Used

- React.js
- Chart.js - For data visualization
- Recharts - For interactive charts
- @react-pdf/renderer - For PDF report generation
- Papa Parse - For CSV parsing
- Tailwind CSS - For styling
- Docker - For containerization

## Application Structure

- `/src`
  - `SoccerStatsApp.js` - Main application component
  - `PlayerReport.js` - PDF report generation component
  - `index.js` - Application entry point
  - `index.css` - Global styles
- `/public`
  - Contains static assets and favicon
- `Dockerfile` - Docker configuration
- `instructions.md` - Detailed Docker deployment instructions

## Key Features Breakdown

### Data Analysis
- Individual player performance tracking
- Team-based statistics
- Position-based comparisons
- Match-by-match analysis

### Visualization
- Performance trend charts
- Comparative bar charts
- Interactive data exploration
- Position-based performance distribution

### Reporting
- Downloadable PDF reports
- Comprehensive player statistics
- Visual performance indicators
- Comparative analysis with position averages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
