import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getDams, getLatestReading } from '../api/api';
import { Link } from 'react-router-dom';

const alertColors = {
  RED: 'bg-red-100 text-red-700 border-red-300',
  ORANGE: 'bg-orange-100 text-orange-700 border-orange-300',
  YELLOW: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  GREEN: 'bg-green-100 text-green-700 border-green-300',
};

export default function Dashboard() {
  const [dams, setDams] = useState([]);
  const [latestReadings, setLatestReadings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDams()
      .then(async (res) => {
        const damsData = res.data;
        setDams(damsData);

        // Fetch latest reading for each dam
        const readings = {};
        await Promise.all(
          damsData.map(async (dam) => {
            try {
              const r = await getLatestReading(dam.id);
              readings[dam.id] = r.data;
            } catch {
              readings[dam.id] = null;
            }
          })
        );
        setLatestReadings(readings);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const alertCounts = {
    RED: Object.values(latestReadings).filter(r => r?.alert_level === 'RED').length,
    ORANGE: Object.values(latestReadings).filter(r => r?.alert_level === 'ORANGE').length,
    YELLOW: Object.values(latestReadings).filter(r => r?.alert_level === 'YELLOW').length,
    GREEN: Object.values(latestReadings).filter(r => r?.alert_level === 'GREEN').length,
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Overview of all dams</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-gray-500 text-sm">Total Dams</p>
          <p className="text-3xl font-bold text-blue-800 mt-1">{dams.length}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 shadow-sm border border-red-200">
          <p className="text-red-600 text-sm">Red Alert</p>
          <p className="text-3xl font-bold text-red-700 mt-1">{alertCounts.RED}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 shadow-sm border border-orange-200">
          <p className="text-orange-600 text-sm">Orange Alert</p>
          <p className="text-3xl font-bold text-orange-700 mt-1">{alertCounts.ORANGE}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200">
          <p className="text-green-600 text-sm">Green Alert</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{alertCounts.GREEN}</p>
        </div>
      </div>

      {/* Dam List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-700">All Dams</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600">Dam Name</th>
                <th className="text-left px-4 py-3 text-gray-600">Location</th>
                <th className="text-left px-4 py-3 text-gray-600">FRL(ft)</th>
                <th className="text-left px-4 py-3 text-gray-600">MDDL(ft)</th>
                <th className="text-left px-4 py-3 text-gray-600">Water Level(ft)</th>
                <th className="text-left px-4 py-3 text-gray-600">% Filled(%)</th>
                <th className="text-left px-4 py-3 text-gray-600">Last Reading(ft)</th>
                <th className="text-left px-4 py-3 text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {dams.map(dam => {
                const latest = latestReadings[dam.id];
                return (
                  <tr key={dam.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-blue-800">
                      <Link to={`/readings/${dam.id}`} className="hover:underline">
                        {dam.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{dam.location}</td>
                    <td className="px-4 py-3 text-gray-600">{dam.frl}</td>
                    <td className="px-4 py-3 text-gray-600">{dam.mddl}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {latest ? latest.water_level : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {latest ? `${latest.percent_filled?.toFixed(1)}%` : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {latest ? latest.date : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs border 
                        ${latest ? alertColors[latest.alert_level] : 'bg-gray-100 text-gray-600'}`}>
                        {latest ? latest.alert_level : 'No reading'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}