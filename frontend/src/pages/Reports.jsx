import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getDams, getReadings } from '../api/api';

const alertColors = {
  RED: 'bg-red-100 text-red-700 border-red-300',
  ORANGE: 'bg-orange-100 text-orange-700 border-orange-300',
  YELLOW: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  GREEN: 'bg-green-100 text-green-700 border-green-300',
};

export default function Reports() {
  const [dams, setDams] = useState([]);
  const [selectedDam, setSelectedDam] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [readings, setReadings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDams().then(res => setDams(res.data));
  }, []);

  const handleSearch = async () => {
    if (!selectedDam) return;
    setLoading(true);
    try {
      const res = await getReadings(selectedDam);
      let data = res.data;
      if (fromDate) data = data.filter(r => r.date >= fromDate);
      if (toDate) data = data.filter(r => r.date <= toDate);
      setReadings(res.data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['Date', 'Time', 'Water Level (ft)', '% Filled', 'Inflow (MCM)', 'Outflow (MCM)', 'Net Flow (MCM)', 'Rainfall (mm)', 'Trend', 'Alert', 'Remarks'];
    const rows = filtered.map(r => [
      r.date, r.reading_time || '',
      r.water_level,
      r.percent_filled ? r.percent_filled.toFixed(1) : '',
      r.inflow, r.outflow, r.net_flow,
      r.rainfall, r.trend, r.alert_level, r.remarks || ''
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const damName = dams.find(d => d.id == selectedDam)?.name || 'report';
    a.download = `${damName}_readings.csv`;
    a.click();
  };

  const exportJSON = () => {
    if (filtered.length === 0) return;
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const damName = dams.find(d => d.id == selectedDam)?.name || 'report';
    a.download = `${damName}_readings.json`;
    a.click();
  };

  // Summary stats
  const summary = filtered.length > 0 ? {
    avgWaterLevel: (filtered.reduce((a, r) => a + r.water_level, 0) / filtered.length).toFixed(2),
    avgRainfall: (filtered.reduce((a, r) => a + r.rainfall, 0) / filtered.length).toFixed(2),
    maxWaterLevel: Math.max(...filtered.map(r => r.water_level)),
    minWaterLevel: Math.min(...filtered.map(r => r.water_level)),
    totalInflow: filtered.reduce((a, r) => a + r.inflow, 0).toFixed(2),
    totalOutflow: filtered.reduce((a, r) => a + r.outflow, 0).toFixed(2),
    redDays: filtered.filter(r => r.alert_level === 'RED').length,
    orangeDays: filtered.filter(r => r.alert_level === 'ORANGE').length,
  } : null;

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
        <p className="text-gray-500 text-sm mt-1">Generate and export dam reports</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Select Dam</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={selectedDam}
              onChange={e => setSelectedDam(e.target.value)}
            >
              <option value="">-- Select Dam --</option>
              {dams.map(dam => (
                <option key={dam.id} value={dam.id}>{dam.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">From Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2 text-sm"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">To Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2 text-sm"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
          </div>
          <div>
            <button
              onClick={handleSearch}
              disabled={!selectedDam}
              className="w-full bg-blue-800 text-white py-2 rounded text-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-gray-500 text-xs">Avg Water Level</p>
            <p className="text-2xl font-bold text-blue-800 mt-1">{summary.avgWaterLevel}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-gray-500 text-xs">Total Inflow (MCM)</p>
            <p className="text-2xl font-bold text-blue-800 mt-1">{summary.totalInflow}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-gray-500 text-xs">Total Outflow (MCM)</p>
            <p className="text-2xl font-bold text-blue-800 mt-1">{summary.totalOutflow}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 shadow-sm border border-red-200">
            <p className="text-red-600 text-xs">Red Alert Days</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{summary.redDays}</p>
          </div>
        </div>
      )}

      {/* Export Buttons */}
      {filtered.length > 0 && (
        <div className="flex gap-3 mb-4">
          <button
            onClick={exportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition"
          >
            Export CSV
          </button>
          <button
            onClick={exportJSON}
            className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition"
          >
            Export JSON
          </button>
          <span className="text-gray-500 text-sm self-center">
            {filtered.length} records found
          </span>
        </div>
      )}

      {/* Readings Table */}
      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading...</div>
      ) : filtered.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600">Date</th>
                <th className="text-left px-4 py-3 text-gray-600">Time</th>
                <th className="text-left px-4 py-3 text-gray-600">Water Level(ft)</th>
                <th className="text-left px-4 py-3 text-gray-600">% Filled(%)</th>
                <th className="text-left px-4 py-3 text-gray-600">Inflow(MCM)</th>
                <th className="text-left px-4 py-3 text-gray-600">Outflow(MCM)</th>
                <th className="text-left px-4 py-3 text-gray-600">Net Flow(MCM)</th>
                <th className="text-left px-4 py-3 text-gray-600">Rainfall(mm)</th>
                <th className="text-left px-4 py-3 text-gray-600">Alert</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{r.date}</td>
                  <td className="px-4 py-3 text-gray-700">{r.reading_time || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{r.water_level}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {r.percent_filled ? `${r.percent_filled.toFixed(1)}%` : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.inflow}</td>
                  <td className="px-4 py-3 text-gray-700">{r.outflow}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {r.net_flow > 0 ? `+${r.net_flow}` : r.net_flow}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.rainfall}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs border ${alertColors[r.alert_level] || 'bg-gray-100 text-gray-600'}`}>
                      {r.alert_level || '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selectedDam && !loading ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-400 border">
          No readings found for the selected filters
        </div>
      ) : null}
    </Layout>
  );
}