// Calculate percentage filled
const calcPercentFilled = (waterLevel, frl) => {
  return (waterLevel / frl) * 100;
};

// Calculate net flow
const calcNetFlow = (inflow, outflow) => {
  return inflow - outflow;
};

// Calculate trend
const calcTrend = (todayLevel, previousLevel) => {
  return todayLevel - previousLevel;
};

// Calculate alert level
const calcAlertLevel = (percentFilled, alertConfig, rainfall, inflow) => {
  const pct = parseFloat(percentFilled);
  const green  = parseFloat(alertConfig.green_max_percent);
  const yellow = parseFloat(alertConfig.yellow_max_percent);
  const red    = parseFloat(alertConfig.red_min_percent);

  // Primary logic
  // below green_max            → GREEN
  // green_max to yellow_max    → YELLOW
  // yellow_max to red_min      → ORANGE
  // red_min and above          → RED
  let alert;
  if (pct >= red) {
    alert = 'RED';
  } else if (pct >= yellow) {
    alert = 'ORANGE';
  } else if (pct >= green) {
    alert = 'YELLOW';
  } else {
    alert = 'GREEN';
  }

  // Advanced logic
  const highRainfall    = parseFloat(rainfall) > 50;
  const highInflow      = parseFloat(inflow) > 100;
  const extremeRainfall = parseFloat(rainfall) > 100;

  if (highRainfall && highInflow) {
    if (alert === 'GREEN' || alert === 'YELLOW') alert = 'ORANGE';
  }
  if (extremeRainfall && pct >= yellow) {
    alert = 'RED';
  }

  return alert;
};

module.exports = { calcPercentFilled, calcNetFlow, calcTrend, calcAlertLevel };