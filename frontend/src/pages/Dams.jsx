import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getDams, createDam, updateDam, deleteDam } from '../api/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  name: '', location: '', frl: '', mddl: '',
  sluice_level: '', latitude: '', longitude: ''
};

export default function Dams() {
  const { user } = useAuth();
  const [dams, setDams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const fetchDams = () => {
    getDams()
      .then(res => setDams(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDams(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await updateDam(editId, form);
      } else {
        await createDam(form);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      fetchDams();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleEdit = (dam) => {
    setForm({
      name: dam.name, location: dam.location,
      frl: dam.frl, mddl: dam.mddl,
      sluice_level: dam.sluice_level,
      latitude: dam.latitude, longitude: dam.longitude
    });
    setEditId(dam.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dam?')) return;
    try {
      await deleteDam(id);
      fetchDams();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dams</h2>
          <p className="text-gray-500 text-sm mt-1">Manage all dams</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            className="bg-blue-800 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition"
          >
            + Add Dam
          </button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editId ? 'Edit Dam' : 'Add New Dam'}
            </h3>
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm text-gray-600">Dam Name</label>
                  <input
                    className="w-full border rounded px-3 py-2 text-sm mt-1"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-600">Location</label>
                  <input
                    className="w-full border rounded px-3 py-2 text-sm mt-1"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">FRL (ft)</label>
                  <input
                    type="number" step="0.01" min="0.01"
                    className="w-full border rounded px-3 py-2 text-sm mt-1"
                    value={form.frl}
                    onChange={e => setForm({ ...form, frl: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">MDDL (ft)</label>
                  <input
                    type="number" step="0.01" min="0.01"
                    className="w-full border rounded px-3 py-2 text-sm mt-1"
                    value={form.mddl}
                    onChange={e => setForm({ ...form, mddl: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Sluice Level (ft)</label>
                  <input
                    type="number" step="0.01" min="0.01"
                    className="w-full border rounded px-3 py-2 text-sm mt-1"
                    value={form.sluice_level}
                    onChange={e => setForm({ ...form, sluice_level: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Latitude</label>
                  <input
                    type="number" step="0.0001"
                    className="w-full border rounded px-3 py-2 text-sm mt-1"
                    value={form.latitude}
                    onChange={e => setForm({ ...form, latitude: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Longitude</label>
                  <input
                    type="number" step="0.0001"
                    className="w-full border rounded px-3 py-2 text-sm mt-1"
                    value={form.longitude}
                    onChange={e => setForm({ ...form, longitude: e.target.value })}
                    required
                  />
                </div>
              </div>
                {form.mddl && form.frl && parseFloat(form.mddl) >= parseFloat(form.frl) && (
                  <p className="text-red-600 text-xs mb-2">⚠️ MDDL must be less than FRL</p>
                )}
                {form.sluice_level && form.frl && parseFloat(form.sluice_level) >= parseFloat(form.frl) && (
                  <p className="text-red-600 text-xs mb-2">⚠️ Sluice level must be less than FRL</p>
                )}
                {form.sluice_level && form.mddl && parseFloat(form.sluice_level) < parseFloat(form.mddl) && (
                  <p className="text-red-600 text-xs mb-2">⚠️ Sluice level must be greater than or equal to MDDL</p>
                )}
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-800 text-white py-2 rounded text-sm hover:bg-blue-700 transition"
                >
                  {editId ? 'Update Dam' : 'Add Dam'}
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

      {/* Dams Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-700">All Dams ({dams.length})</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600">Name</th>
                <th className="text-left px-4 py-3 text-gray-600">Location</th>
                <th className="text-left px-4 py-3 text-gray-600">FRL(ft)</th>
                <th className="text-left px-4 py-3 text-gray-600">MDDL(ft)</th>
                <th className="text-left px-4 py-3 text-gray-600">Sluice Level(ft)</th>
                <th className="text-left px-4 py-3 text-gray-600">Coordinates</th>
                {user?.role === 'admin' && (
                  <th className="text-left px-4 py-3 text-gray-600">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {dams.map(dam => (
                <tr key={dam.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-blue-800">
                    <Link to={`/readings/${dam.id}`} className="hover:underline">{dam.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{dam.location}</td>
                  <td className="px-4 py-3 text-gray-600">{dam.frl}</td>
                  <td className="px-4 py-3 text-gray-600">{dam.mddl}</td>
                  <td className="px-4 py-3 text-gray-600">{dam.sluice_level}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {dam.latitude}, {dam.longitude}
                  </td>
                  {user?.role === 'admin' && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEdit(dam)}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(dam.id)}
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
        )}
      </div>
    </Layout>
  );
}