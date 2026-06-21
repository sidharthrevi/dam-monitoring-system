import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getReadings, createReading, updateReading, deleteReading, getDam } from '../api/api';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  date: new Date().toISOString().split('T')[0],
  reading_time: new Date().toTimeString().split(' ')[0],
  water_level: '', inflow: '', outflow: '',
  rainfall: '', storage_volume: '', remarks: ''
};

const alertColors = {
  RED: 'bg-red-100 text-red-700 border-red-300',
  ORANGE: 'bg-orange-100 text-orange-700 border-orange-300',
  YELLOW: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  GREEN: 'bg-green-100 text-green-700 border-green-300',
};

export default function Readings() {
  const { damId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dam, setDam] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const fetchData = () => {
    Promise.all([getDam(damId), getReadings(damId)])
      .then(([damRes, readingsRes]) => {
        setDam(damRes.data);
        setReadings(readingsRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [damId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Form data being sent:', form);
      if (editId) {
        await updateReading(editId, form);
      } else {
        const outflow = parseFloat(form.water_level) > parseFloat(dam?.sluice_level)
  ? form.outflow
  : 0;
await createReading({ ...form, outflow, dam_id: damId });
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleEdit = (reading) => {
    setForm({
      date: reading.date,
      reading_time: reading.reading_time,
      water_level: reading.water_level,
      inflow: reading.inflow,
      outflow: reading.outflow,
      rainfall: reading.rainfall,
      storage_volume: reading.storage_volume || '',
      remarks: reading.remarks || ''
    });
    setEditId(reading.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reading?')) return;
    try {
      await deleteReading(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate('/dams')}
            className="text-blue-600 text-sm hover:underline mb-1 block"
          >
            ← Back to Dams
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {dam?.name || 'Loading...'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            FRL: {dam?.frl} ft | MDDL: {dam?.mddl} ft | Sluice Level: {dam?.sluice_level} ft
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'operator') && (
  <button
    onClick={() => { 
      setShowForm(true); 
      setEditId(null); 
      setForm({
        ...emptyForm,
        date: new Date().toISOString().split('T')[0],
        reading_time: new Date().toTimeString().split(' ')[0]
      }); 
    }}
    className="bg-blue-800 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition"
  >
    + Add Reading
  </button>
)}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editId ? 'Edit Reading' : 'Add New Reading'}
            </h3>
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
  <label className="text-sm text-gray-600">Date</label>
  <input
    type="date"
    className="w-full border rounded px-3 py-2 text-sm mt-1"
    value={form.date}
    onChange={e => setForm({ ...form, date: e.target.value })}
    required
  />
</div>
<div>
  <label className="text-sm text-gray-600">Time</label>
  <input
    type="time"
    className="w-full border rounded px-3 py-2 text-sm mt-1"
    value={form.reading_time}
    onChange={e => setForm({ ...form, reading_time: e.target.value })}
    required
  />
</div>
                <div>
                  <label className="text-sm text-gray-600">Water Level (ft)</label>
                  <input
  type="number" step="0.01" min="0"
  className={`w-full border rounded px-3 py-2 text-sm mt-1 ${
    form.water_level && parseFloat(form.water_level) > parseFloat(dam?.frl)
      ? 'border-red-400 bg-red-50'
      : 'border-gray-300'
  }`}
  value={form.water_level}
  onChange={e => setForm({ ...form, water_level: e.target.value })}
  required
/>
{form.water_level && parseFloat(form.water_level) > parseFloat(dam?.frl) ? (
  <p className="text-xs text-red-600 mt-1">
    ⚠️ Water level exceeds FRL ({dam?.frl} ft) — cannot save
  </p>
) : form.water_level ? (
  <p className="text-xs text-green-600 mt-1">
    ✅ Valid — max {dam?.frl} ft (FRL)
  </p>
) : (
  <p className="text-xs text-gray-400 mt-1">
    Max: {dam?.frl} ft (FRL)
  </p>
)}
                </div>
                <div>
                  <label className="text-sm text-gray-600">Inflow (MCM)</label>
                  <input
                    type="number" step="0.01" min="0"
                    className="w-full border rounded px-3 py-2 text-sm mt-1"
                    value={form.inflow}
                    onChange={e => setForm({ ...form, inflow: e.target.value })}
                    required
                  />
                </div>
                <div>
  <label className="text-sm text-gray-600">Outflow (MCM)</label>
  {parseFloat(form.water_level) > parseFloat(dam?.sluice_level) ? (
    <input
      type="number" step="0.01"
      className="w-full border rounded px-3 py-2 text-sm mt-1"
      value={form.outflow}
      onChange={e => setForm({ ...form, outflow: e.target.value })}
      placeholder="Enter actual outflow"
      required
    />
  ) : (
    <input
      type="number"
      className="w-full border rounded px-3 py-2 text-sm mt-1 bg-gray-100 text-gray-400 cursor-not-allowed"
      value={0}
      disabled
    />
  )}
  <p className="text-xs mt-1">
    {parseFloat(form.water_level) > parseFloat(dam?.sluice_level) ? (
      <span className="text-orange-600">
        ⚠️ Water above sluice level ({dam?.sluice_level}) — enter actual outflow
      </span>
    ) : (
      <span className="text-green-600">
        ✅ Water below sluice level ({dam?.sluice_level}) — outflow is 0
      </span>
    )}
  </p>
</div>
                <div>
                  <label className="text-sm text-gray-600">Rainfall (mm)</label>
                  <input
                    type="number" step="0.01" min="0"
                    className="w-full border rounded px-3 py-2 text-sm mt-1"
                    value={form.rainfall}
                    onChange={e => setForm({ ...form, rainfall: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Storage Volume (MCM) <span className="text-gray-400">optional</span></label>
                  <input
                    type="number" step="0.01" min="0"
                    className="w-full border rounded px-3 py-2 text-sm mt-1"
                    value={form.storage_volume}
                    onChange={e => setForm({ ...form, storage_volume: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-600">Remarks <span className="text-gray-400">optional</span></label>
                  <textarea
                    className="w-full border rounded px-3 py-2 text-sm mt-1"
                    rows={2}
                    value={form.remarks}
                    onChange={e => setForm({ ...form, remarks: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-800 text-white py-2 rounded text-sm hover:bg-blue-700 transition"
                >
                  {editId ? 'Update Reading' : 'Save Reading'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(''); }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded text-sm hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Readings Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-700">
            Readings ({readings.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : readings.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No readings yet. Add the first reading!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                    <th className="text-left px-4 py-3 text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 text-gray-600">Time</th>
                    <th className="text-left px-4 py-3 text-gray-600">Water Level (ft)</th>
                    <th className="text-left px-4 py-3 text-gray-600">% Filled (%)</th>
                    <th className="text-left px-4 py-3 text-gray-600">Inflow (MCM)</th>
                    <th className="text-left px-4 py-3 text-gray-600">Outflow (MCM)</th>
                    <th className="text-left px-4 py-3 text-gray-600">Net Flow (MCM)</th>
                    <th className="text-left px-4 py-3 text-gray-600">Rainfall (mm)</th>
                    <th className="text-left px-4 py-3 text-gray-600">Trend (ft)</th>
                    <th className="text-left px-4 py-3 text-gray-600">Alert</th>
                      {user?.role === 'admin' && (
                    <th className="text-left px-4 py-3 text-gray-600">Actions</th>
                      )}
                </tr>
              </thead>
              <tbody>
                {readings.map(r => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{r.date}</td>
                    <td className="px-4 py-3 text-gray-700">{r.reading_time || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{r.water_level}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {r.percent_filled ? r.percent_filled.toFixed(1) : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.inflow}</td>
                    <td className="px-4 py-3 text-gray-700">{r.outflow}</td>
                    <td className="px-4 py-3 text-gray-700">
                       {r.net_flow > 0 ? `+${r.net_flow}` : r.net_flow}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.rainfall}</td>
                    <td className="px-4 py-3 text-gray-700">
                       {r.trend > 0 ? `+${r.trend}` : r.trend}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs border ${alertColors[r.alert_level] || 'bg-gray-100 text-gray-600'}`}>
                        {r.alert_level || '-'}
                      </span>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleEdit(r)}
                          className="text-blue-600 hover:underline mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}