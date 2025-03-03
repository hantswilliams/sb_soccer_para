import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Path, Line, Circle, Rect } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1E40AF',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  subHeader: {
    fontSize: 18,
    marginBottom: 10,
    color: '#1E40AF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '40%',
    fontSize: 12,
    color: '#4B5563',
  },
  value: {
    width: '60%',
    fontSize: 12,
    color: '#111827',
  },
  statBox: {
    backgroundColor: '#F3F4F6',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  comparisonTable: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    padding: 5,
    marginBottom: 5,
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chartContainer: {
    marginTop: 10,
    height: 300,  // Increased height
    padding: 20,
  },
  chartInnerContainer: {
    marginTop: 40,  // Added space for legend at top
  },
  chartTitle: {
    fontSize: 14,
    marginBottom: 10,
    color: '#1E40AF',
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  legendColor: {
    width: 12,
    height: 12,
    marginRight: 5,
  },
  legendText: {
    fontSize: 10,
    color: '#4B5563',
  },
  xAxisLabel: {
    fontSize: 8,
    textAnchor: 'middle',
    marginTop: 25,  // Increased spacing from axis
  },
  dataLabel: {
    fontSize: 8,
    textAnchor: 'middle',
    fill: '#4B5563',
  },
  barChartContainer: {
    marginTop: 20,
    padding: 10,
  },
  barLabel: {
    fontSize: 8,
    fill: '#4B5563',
  }
});

const PerformanceTrendChart = ({ data, width, height }) => {
  if (!data || data.length === 0) return null;

  const padding = { top: 50, right: 40, bottom: 60, left: 50 };  // Increased padding
  const chartWidth = width - (padding.left + padding.right);
  const chartHeight = height - (padding.top + padding.bottom);

  // Calculate scales
  const maxDistance = Math.max(...data.map(d => d.distance));
  const maxSpeed = Math.max(...data.map(d => d.speed));

  // Create points for the lines
  const distancePoints = data.map((d, i) => ({
    x: (i * chartWidth) / (data.length - 1) + padding.left,
    y: chartHeight - ((d.distance / maxDistance) * chartHeight) + padding.top,
    value: d.distance,
    date: d.date
  }));

  const speedPoints = data.map((d, i) => ({
    x: (i * chartWidth) / (data.length - 1) + padding.left,
    y: chartHeight - ((d.speed / maxSpeed) * chartHeight) + padding.top,
    value: d.speed,
    date: d.date
  }));

  return (
    <Svg width={width} height={height}>
      {/* Y-axis labels */}
      <Text x={padding.left - 30} y={padding.top} style={styles.dataLabel}>
        {maxDistance.toFixed(1)} km
      </Text>
      <Text x={padding.left - 30} y={height - padding.bottom} style={styles.dataLabel}>
        0 km
      </Text>

      {/* Grid lines */}
      <Line 
        x1={padding.left} 
        y1={padding.top} 
        x2={padding.left} 
        y2={height - padding.bottom} 
        stroke="#E5E7EB" 
        strokeWidth={1} 
      />
      <Line 
        x1={padding.left} 
        y1={height - padding.bottom} 
        x2={width - padding.right} 
        y2={height - padding.bottom} 
        stroke="#E5E7EB" 
        strokeWidth={1} 
      />

      {/* Horizontal grid lines */}
      {[0.25, 0.5, 0.75].map((ratio, i) => (
        <React.Fragment key={`grid-${i}`}>
          <Line
            x1={padding.left}
            y1={padding.top + chartHeight * ratio}
            x2={width - padding.right}
            y2={padding.top + chartHeight * ratio}
            stroke="#E5E7EB"
            strokeWidth={0.5}
            strokeDasharray="5,5"
          />
        </React.Fragment>
      ))}

      {/* X-axis labels (Match numbers and dates) */}
      {data.map((d, i) => (
        <React.Fragment key={`x${i}`}>
          <Text
            x={distancePoints[i].x}
            y={height - padding.bottom + 20}
            style={styles.xAxisLabel}
          >
            {`Match ${i + 1}`}
          </Text>
          <Text
            x={distancePoints[i].x}
            y={height - padding.bottom + 35}
            style={styles.xAxisLabel}
          >
            {d.date}
          </Text>
        </React.Fragment>
      ))}

      {/* Distance line */}
      <Path
        d={`M ${distancePoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
        stroke="#3B82F6"
        strokeWidth={2}
        fill="none"
      />

      {/* Speed line */}
      <Path
        d={`M ${speedPoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
        stroke="#10B981"
        strokeWidth={2}
        fill="none"
      />

      {/* Data points and labels */}
      {distancePoints.map((p, i) => (
        <React.Fragment key={`d${i}`}>
          <Circle cx={p.x} cy={p.y} r={3} fill="#3B82F6" />
          <Text
            x={p.x}
            y={p.y - 10}
            style={styles.dataLabel}
          >
            {p.value.toFixed(1)}
          </Text>
        </React.Fragment>
      ))}
      {speedPoints.map((p, i) => (
        <React.Fragment key={`s${i}`}>
          <Circle cx={p.x} cy={p.y} r={3} fill="#10B981" />
          <Text
            x={p.x}
            y={p.y + 15}
            style={styles.dataLabel}
          >
            {p.value.toFixed(1)}
          </Text>
        </React.Fragment>
      ))}
    </Svg>
  );
};

const ComparisonBarChart = ({ data, width, height }) => {
  if (!data || data.length === 0) return null;

  const padding = { top: 20, right: 30, bottom: 40, left: 60 };
  const chartWidth = width - (padding.left + padding.right);
  const chartHeight = height - (padding.top + padding.bottom);
  
  const barWidth = 30;
  const groupSpacing = chartWidth / data.length;
  
  return (
    <Svg width={width} height={height}>
      {/* Vertical axis line */}
      <Line 
        x1={padding.left} 
        y1={padding.top} 
        x2={padding.left} 
        y2={height - padding.bottom} 
        stroke="#E5E7EB" 
        strokeWidth={1} 
      />
      
      {/* Horizontal axis line */}
      <Line 
        x1={padding.left} 
        y1={height - padding.bottom} 
        x2={width - padding.right} 
        y2={height - padding.bottom} 
        stroke="#E5E7EB" 
        strokeWidth={1} 
      />

      {/* Render bars and labels for each metric */}
      {data.map((metric, i) => {
        const x = padding.left + (i * groupSpacing);
        const maxValue = Math.max(metric.playerValue, metric.avgValue);
        const playerHeight = (metric.playerValue / maxValue) * chartHeight;
        const avgHeight = (metric.avgValue / maxValue) * chartHeight;

        return (
          <React.Fragment key={i}>
            {/* Metric name */}
            <Text
              x={x + groupSpacing/2}
              y={height - padding.bottom + 20}
              style={styles.barLabel}
            >
              {metric.metric.split(' ')[0]}
            </Text>

            {/* Player value bar */}
            <Rect
              x={x + (groupSpacing/2) - barWidth}
              y={height - padding.bottom - playerHeight}
              width={barWidth}
              height={playerHeight}
              fill="#3B82F6"
              opacity={0.8}
            />
            <Text
              x={x + (groupSpacing/2) - barWidth/2}
              y={height - padding.bottom - playerHeight - 10}
              style={styles.barLabel}
            >
              {metric.playerValue.toFixed(1)}
            </Text>

            {/* Position average bar */}
            <Rect
              x={x + (groupSpacing/2)}
              y={height - padding.bottom - avgHeight}
              width={barWidth}
              height={avgHeight}
              fill="#10B981"
              opacity={0.8}
            />
            <Text
              x={x + (groupSpacing/2) + barWidth/2}
              y={height - padding.bottom - avgHeight - 10}
              style={styles.barLabel}
            >
              {metric.avgValue.toFixed(1)}
            </Text>
          </React.Fragment>
        );
      })}
    </Svg>
  );
};

const PlayerReport = ({ playerStats, comparisonData }) => {
  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value || 'N/A';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.header}>{playerStats.playerId} - Performance Report</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Player Information</Text>
          <View style={styles.statBox}>
            <View style={styles.row}>
              <Text style={styles.label}>Position:</Text>
              <Text style={styles.value}>{playerStats.position}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Team:</Text>
              <Text style={styles.value}>{playerStats.team}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Matches Played:</Text>
              <Text style={styles.value}>{playerStats.matches}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Performance Over Time</Text>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Distance and Speed Trends by Match</Text>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.legendText}>Distance (km)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>Speed (km/h)</Text>
              </View>
            </View>
            <View style={styles.chartInnerContainer}>
              <PerformanceTrendChart
                data={playerStats.chartData}
                width={500}
                height={500}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Performance Metrics</Text>
          <View style={styles.statBox}>
            <View style={styles.row}>
              <Text style={styles.label}>Total Distance:</Text>
              <Text style={styles.value}>{playerStats.totalDistance} km</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Average Distance/Match:</Text>
              <Text style={styles.value}>{playerStats.avgDistance} km</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Max Speed:</Text>
              <Text style={styles.value}>{playerStats.maxSpeed} km/h</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Average Heart Rate:</Text>
              <Text style={styles.value}>{playerStats.avgHeartRate} bpm</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Total Minutes:</Text>
              <Text style={styles.value}>{playerStats.totalMinutes} mins</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Performance Comparison</Text>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Player vs. Position Average</Text>
            <ComparisonBarChart
              data={comparisonData}
              width={500}
              height={300}
            />
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.legendText}>Player</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>Position Average</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Detailed Comparison</Text>
          <View style={styles.comparisonTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>Metric</Text>
              <Text style={styles.tableCell}>Player</Text>
              <Text style={styles.tableCell}>Position Avg</Text>
              <Text style={styles.tableCell}>Difference</Text>
            </View>
            {comparisonData.map((stat, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.tableCell}>{stat.metric}</Text>
                <Text style={styles.tableCell}>{formatValue(stat.playerValue)}</Text>
                <Text style={styles.tableCell}>{formatValue(stat.avgValue)}</Text>
                <Text style={styles.tableCell}>
                  {formatValue(stat.difference)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PlayerReport;