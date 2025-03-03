import React, { useState } from 'react';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PlayerReport from './PlayerReport';

const SoccerStatsApp = () => {
  const [parsedData, setParsedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('Distance Covered');
  const [view, setView] = useState('overview'); // overview, player, team

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Process the parsed data to handle any missing values or data transformations
        const processedData = results.data.map(row => {
          // Convert NaN string values to actual NaN
          Object.keys(row).forEach(key => {
            if (row[key] === "nan") {
              row[key] = NaN;
            }
          });
          return row;
        });
        
        setParsedData(processedData);
        setIsLoading(false);
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
        setIsLoading(false);
      }
    });
  };

  // Calculate statistics and extract unique values
  const calculateStats = () => {
    if (!parsedData.length) return {};
    
    const players = [...new Set(parsedData.map(row => row.PID))];
    const teams = [...new Set(parsedData.map(row => row["Team Name"]))];
    const matchDates = [...new Set(parsedData.map(row => row["Match Date"]))];
    const positions = [...new Set(parsedData.map(row => row.Position))];
    
    // Calculate overall stats
    let totalDistance = 0;
    let totalMinutes = 0;
    let maxSpeed = 0;
    let maxHeartRate = 0;
    let validHeartRateReadings = 0;
    let totalHeartRate = 0;
    
    parsedData.forEach(row => {
      if (!isNaN(row["Distance Covered"])) totalDistance += row["Distance Covered"];
      if (!isNaN(row["Minutes Played"])) totalMinutes += row["Minutes Played"];
      if (!isNaN(row["Peak Speed"]) && row["Peak Speed"] > maxSpeed) maxSpeed = row["Peak Speed"];
      if (!isNaN(row["Peak Heart Rate"]) && row["Peak Heart Rate"] > maxHeartRate) maxHeartRate = row["Peak Heart Rate"];
      if (!isNaN(row["Average Heart Rate"])) {
        totalHeartRate += row["Average Heart Rate"];
        validHeartRateReadings++;
      }
    });
    
    return {
      players,
      teams,
      matchDates,
      positions,
      totalMatches: matchDates.length,
      totalDistance: totalDistance.toFixed(2),
      totalMinutes: totalMinutes.toFixed(2),
      maxSpeed: maxSpeed.toFixed(2),
      maxHeartRate: Math.round(maxHeartRate),
      avgHeartRate: validHeartRateReadings > 0 ? Math.round(totalHeartRate / validHeartRateReadings) : 'N/A'
    };
  };

  // Get player specific stats
  const getPlayerStats = (playerId) => {
    if (!playerId || !parsedData.length) return null;
    
    const playerData = parsedData.filter(row => row.PID === playerId);
    if (!playerData.length) return null;
    
    const position = playerData[0].Position;
    const team = playerData[0]["Team Name"];
    
    let totalDistance = 0;
    let totalMinutes = 0;
    let maxSpeed = 0;
    let validHeartRateReadings = 0;
    let totalHeartRate = 0;
    
    playerData.forEach(match => {
      if (!isNaN(match["Distance Covered"])) totalDistance += match["Distance Covered"];
      if (!isNaN(match["Minutes Played"])) totalMinutes += match["Minutes Played"];
      if (!isNaN(match["Peak Speed"]) && match["Peak Speed"] > maxSpeed) maxSpeed = match["Peak Speed"];
      if (!isNaN(match["Average Heart Rate"])) {
        totalHeartRate += match["Average Heart Rate"];
        validHeartRateReadings++;
      }
    });

    // Create chart data for player's performance over matches
    const chartData = playerData.map(match => ({
      date: match["Match Date"],
      distance: !isNaN(match["Distance Covered"]) ? parseFloat(match["Distance Covered"].toFixed(2)) : 0,
      speed: !isNaN(match["Average Speed"]) ? parseFloat(match["Average Speed"].toFixed(2)) : 0,
      heartRate: !isNaN(match["Average Heart Rate"]) ? Math.round(match["Average Heart Rate"]) : 0
    }));
    
    return {
      playerId,
      position,
      team,
      matches: playerData.length,
      totalDistance: totalDistance.toFixed(2),
      avgDistance: (totalDistance / playerData.length).toFixed(2),
      totalMinutes: totalMinutes.toFixed(2),
      avgMinutes: (totalMinutes / playerData.length).toFixed(2),
      maxSpeed: maxSpeed.toFixed(2),
      avgHeartRate: validHeartRateReadings > 0 ? Math.round(totalHeartRate / validHeartRateReadings) : 'N/A',
      chartData
    };
  };

  // Get team specific stats
  const getTeamStats = (teamName) => {
    if (!teamName || !parsedData.length) return null;
    
    const teamData = parsedData.filter(row => row["Team Name"] === teamName);
    if (!teamData.length) return null;
    
    const teamPlayers = [...new Set(teamData.map(row => row.PID))];
    
    // Calculate average stats by position
    const positionStats = {};
    ["Forward", "Midfielder", "Defender"].forEach(position => {
      const posData = teamData.filter(row => row.Position === position);
      if (!posData.length) {
        positionStats[position] = null;
        return;
      }
      
      let totalDistance = 0;
      let totalSpeed = 0;
      let validSpeedReadings = 0;
      let totalMinutes = 0;
      
      posData.forEach(match => {
        if (!isNaN(match["Distance Covered"])) totalDistance += match["Distance Covered"];
        if (!isNaN(match["Average Speed"])) {
          totalSpeed += match["Average Speed"];
          validSpeedReadings++;
        }
        if (!isNaN(match["Minutes Played"])) totalMinutes += match["Minutes Played"];
      });
      
      positionStats[position] = {
        count: posData.length,
        avgDistance: posData.length > 0 ? (totalDistance / posData.length).toFixed(2) : 0,
        avgSpeed: validSpeedReadings > 0 ? (totalSpeed / validSpeedReadings).toFixed(2) : 0,
        avgMinutes: posData.length > 0 ? (totalMinutes / posData.length).toFixed(2) : 0
      };
    });
    
    // Create chart data for position comparison
    const positionChartData = Object.keys(positionStats)
      .filter(pos => positionStats[pos] !== null)
      .map(position => ({
        position,
        distance: parseFloat(positionStats[position].avgDistance),
        speed: parseFloat(positionStats[position].avgSpeed),
        minutes: parseFloat(positionStats[position].avgMinutes)
      }));
    
    return {
      teamName,
      playerCount: teamPlayers.length,
      matchCount: [...new Set(teamData.map(row => row["Match Date"]))].length,
      positionStats,
      positionChartData
    };
  };

  // Get metric data for all players
  const getMetricComparison = (metric) => {
    if (!metric || !parsedData.length) return [];
    
    const players = [...new Set(parsedData.map(row => row.PID))];
    const playerMetrics = players.map(playerId => {
      const playerData = parsedData.filter(row => row.PID === playerId);
      let totalValue = 0;
      let validReadings = 0;
      
      playerData.forEach(match => {
        if (!isNaN(match[metric])) {
          totalValue += match[metric];
          validReadings++;
        }
      });
      
      const avgValue = validReadings > 0 ? totalValue / validReadings : 0;
      return {
        player: playerId,
        team: playerData[0]["Team Name"],
        position: playerData[0].Position,
        value: parseFloat(avgValue.toFixed(2))
      };
    });
    
    // Sort by value in descending order
    return playerMetrics.sort((a, b) => b.value - a.value);
  };

  const getPlayerComparison = (playerId) => {
    if (!playerId || !parsedData.length) return [];
    
    const playerData = parsedData.filter(row => row.PID === playerId);
    if (!playerData.length) return [];
    
    const position = playerData[0].Position;
    const positionData = parsedData.filter(row => row.Position === position && row.PID !== playerId);
    
    const metrics = [
      { name: 'Distance Covered', key: 'Distance Covered', unit: 'km' },
      { name: 'Average Speed', key: 'Average Speed', unit: 'km/h' },
      { name: 'Peak Speed', key: 'Peak Speed', unit: 'km/h' },
      { name: 'Average Heart Rate', key: 'Average Heart Rate', unit: 'bpm' },
      { name: 'Minutes Played', key: 'Minutes Played', unit: 'mins' }
    ];
    
    return metrics.map(metric => {
      const playerValues = playerData.map(match => match[metric.key]).filter(val => !isNaN(val));
      const positionValues = positionData.map(match => match[metric.key]).filter(val => !isNaN(val));
      
      const playerAvg = playerValues.reduce((a, b) => a + b, 0) / playerValues.length;
      const positionAvg = positionValues.reduce((a, b) => a + b, 0) / positionValues.length;
      
      return {
        metric: metric.name,
        playerValue: playerAvg,
        avgValue: positionAvg,
        difference: playerAvg - positionAvg,
        unit: metric.unit
      };
    });
  };
  
  const stats = calculateStats();
  const playerStats = selectedPlayer ? getPlayerStats(selectedPlayer) : null;
  const teamStats = selectedTeam ? getTeamStats(selectedTeam) : null;
  const metricData = getMetricComparison(selectedMetric);
  
  // Format match date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const [day, month, year] = dateString.split('.');
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-800 text-white shadow-lg">
        <div className="container mx-auto py-4 px-4">
          <h1 className="text-3xl font-bold">Soccer Statistics Analyzer</h1>
          <p className="opacity-80">Upload and analyze player and team performance data</p>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        {/* File Upload Section */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Match Data</h2>
          <div className="flex items-center">
            <label className="flex flex-col items-center px-4 py-6 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 border-2 border-dashed border-blue-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Upload CSV File</span>
              <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
            </label>
            <div className="ml-4">
              {isLoading && <p className="text-blue-600">Processing file...</p>}
              {error && <p className="text-red-600">{error}</p>}
              {parsedData.length > 0 && (
                <p className="text-green-600">
                  Successfully loaded data for {stats.players.length} players across {stats.totalMatches} matches
                </p>
              )}
            </div>
          </div>
        </div>
        
        {parsedData.length > 0 && (
          <>
            {/* Navigation Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex space-x-8">
                <button 
                  onClick={() => setView('overview')}
                  className={`py-4 px-1 font-medium text-sm border-b-2 ${view === 'overview' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setView('player')}
                  className={`py-4 px-1 font-medium text-sm border-b-2 ${view === 'player' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Player Analysis
                </button>
                <button 
                  onClick={() => setView('team')}
                  className={`py-4 px-1 font-medium text-sm border-b-2 ${view === 'team' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Team Analysis
                </button>
                <button 
                  onClick={() => setView('comparison')}
                  className={`py-4 px-1 font-medium text-sm border-b-2 ${view === 'comparison' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Comparison
                </button>
              </nav>
            </div>
            
            {/* Overview Section */}
            {view === 'overview' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">Dataset Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800">Players</h3>
                    <p className="text-2xl font-bold">{stats.players.length}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800">Teams</h3>
                    <p className="text-2xl font-bold">{stats.teams.length}</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-yellow-800">Matches</h3>
                    <p className="text-2xl font-bold">{stats.totalMatches}</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-800">Total Distance</h3>
                    <p className="text-2xl font-bold">{stats.totalDistance} km</p>
                  </div>
                </div>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Performance Highlights</h3>
                    <ul className="space-y-2">
                      <li>Max Speed: {stats.maxSpeed} km/h</li>
                      <li>Max Heart Rate: {stats.maxHeartRate} bpm</li>
                      <li>Avg Heart Rate: {stats.avgHeartRate} bpm</li>
                      <li>Total Minutes: {stats.totalMinutes} mins</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Position Distribution</h3>
                    <ul className="space-y-2">
                      {stats.positions.map(position => (
                        <li key={position}>{position}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Player Analysis Section */}
            {view === 'player' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Player Analysis</h2>
                  <div className="flex items-center space-x-4">
                    <select
                      className="w-full max-w-xs p-2 border rounded"
                      value={selectedPlayer || ''}
                      onChange={(e) => setSelectedPlayer(e.target.value)}
                    >
                      <option value="">Select a player...</option>
                      {stats.players.map(player => (
                        <option key={player} value={player}>{player}</option>
                      ))}
                    </select>
                    
                    {selectedPlayer && playerStats && (
                      <PDFDownloadLink
                        document={
                          <PlayerReport 
                            playerStats={playerStats}
                            comparisonData={getPlayerComparison(selectedPlayer)}
                          />
                        }
                        fileName={`${selectedPlayer}-performance-report.pdf`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {({ blob, url, loading, error }) =>
                          loading ? 'Generating PDF...' : 'Download PDF'
                        }
                      </PDFDownloadLink>
                    )}
                  </div>
                  
                  {playerStats && (
                    <div className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-blue-800">Position</h3>
                          <p className="text-2xl font-bold">{playerStats.position}</p>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-green-800">Team</h3>
                          <p className="text-2xl font-bold">{playerStats.team}</p>
                        </div>
                        
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-yellow-800">Matches Played</h3>
                          <p className="text-2xl font-bold">{playerStats.matches}</p>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-4">Performance Over Time</h3>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={playerStats.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickFormatter={formatDate} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="distance" fill="#3B82F6" name="Distance (km)" />
                            <Bar dataKey="speed" fill="#10B981" name="Speed (km/h)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Team Analysis Section */}
            {view === 'team' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Team Analysis</h2>
                  <select
                    className="w-full max-w-xs p-2 border rounded"
                    value={selectedTeam || ''}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                  >
                    <option value="">Select a team...</option>
                    {stats.teams.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                  
                  {teamStats && (
                    <div className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-blue-800">Players</h3>
                          <p className="text-2xl font-bold">{teamStats.playerCount}</p>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-green-800">Matches</h3>
                          <p className="text-2xl font-bold">{teamStats.matchCount}</p>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-4">Position Performance Comparison</h3>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={teamStats.positionChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="position" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="distance" fill="#3B82F6" name="Avg Distance (km)" />
                            <Bar dataKey="speed" fill="#10B981" name="Avg Speed (km/h)" />
                            <Bar dataKey="minutes" fill="#F59E0B" name="Avg Minutes" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Comparison Section */}
            {view === 'comparison' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Player Comparison</h2>
                  <select
                    className="w-full max-w-xs p-2 border rounded"
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                  >
                    <option value="Distance Covered">Distance Covered</option>
                    <option value="Average Speed">Average Speed</option>
                    <option value="Peak Speed">Peak Speed</option>
                    <option value="Average Heart Rate">Average Heart Rate</option>
                    <option value="Minutes Played">Minutes Played</option>
                  </select>
                  
                  <div className="mt-6">
                    <ResponsiveContainer width="100%" height={600}>
                      <BarChart data={metricData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="player" type="category" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#3B82F6" name={selectedMetric} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SoccerStatsApp;