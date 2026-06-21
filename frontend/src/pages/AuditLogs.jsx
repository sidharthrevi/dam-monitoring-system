import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getDams } from '../api/api';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});


export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [dams, setDams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDam, setFilterDam] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    Promise.all([
      API.get('/audit-logs', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      getDams()
    ])
      .then(([logsRes, damsRes]) => {
        setLogs(logsRes.data);
        setFiltered(logsRes.data);
        setDams(damsRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    let data = logs;
    if (filterDam) data = data.filter(l => l.dam_id == filterDam);
    if (filterAction) data = data.filter(l => l.action.includes(filterAction.toUpperCase()));
    if (filterDate) data = data.filter(l => l.created_at?.startsWith(filterDate));
    setFiltered(data);
  }, [filterDam, filterAction, filterDate, logs]);

  const actionColors = {
    CREATE: 'bg-green-100 text-green-700',
    UPDATE: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-700',
    LOGIN: 'bg-purple-100 text-purple-700',
  };

  const getActionColor = (action) => {
    if (action.includes('CREATE')) return actionColors.CREATE;
    if (action.includes('UPDATE')) return actionColors.UPDATE;
    if (action.includes('DELETE')) return actionColors.DELETE;
    if (action.includes('LOGIN')) return actionColors.LOGIN;
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Audit Logs</h2>
        <p className="text-gray-500 text-sm mt-1">
          Track all user actions in the system
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Filter by Dam</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={filterDam}
              onChange={e => setFilterDam(e.target.value)}
            >
              <option value="">All Dams</option>
              {dams.map(dam => (
                <option key={dam.id} value={dam.id}>{dam.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Filter by Action</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Filter by Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2 text-sm"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-gray-500 text-xs">Total Logs</p>
          <p className="text-2xl font-bold text-blue-800 mt-1">{filtered.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200">
          <p className="text-green-600 text-xs">Create Actions</p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            {filtered.filter(l => l.action.includes('CREATE')).length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200">
          <p className="text-blue-600 text-xs">Update Actions</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {filtered.filter(l => l.action.includes('UPDATE')).length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 shadow-sm border border-red-200">
          <p className="text-red-600 text-xs">Delete Actions</p>
          <p className="text-2xl font-bold text-red-700 mt-1">
            {filtered.filter(l => l.action.includes('DELETE')).length}
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-700">
            Activity Log ({filtered.length})
          </h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No logs found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600">Time</th>
                <th className="text-left px-4 py-3 text-gray-600">User</th>
                <th className="text-left px-4 py-3 text-gray-600">Action</th>
                <th className="text-left px-4 py-3 text-gray-600">Dam</th>
                <th className="text-left px-4 py-3 text-gray-600">Description</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {log.User?.full_name || log.user_id}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {log.Dam?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}