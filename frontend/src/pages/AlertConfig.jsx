import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getDams, getAlert, updateAlert } from '../api/api';

export default function AlertConfig() {
  const [dams, setDams] = useState([]);
  const [selectedDam, setSelectedDam] = useState(null);
  const [form, setForm] = useState({
    green_max_percent: '',
    yellow_max_percent: '',
    orange_max_percent: '',
    red_min_percent: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getDams()
      .then(res => {
        setDams(res.data);
        if (res.data.length > 0) handleSelectDam(res.data[0]);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectDam = (dam) => {
    setSelectedDam(dam);
    setSuccess('');
    setError('');
    getAlert(dam.id)
      .then(res => {
        setForm({
          green_max_percent: res.data.green_max_percent,
          yellow_max_percent: res.data.yellow_max_percent,
          orange_max_percent: res.data.orange_max_percent,
          red_min_percent: res.data.red_min_percent
        });
      })
      .catch(err => console.error(err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateAlert(selectedDam.id, form);
      setSuccess('Alert config updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Alert Configuration</h2>
        <p className="text-gray-500 text-sm mt-1">
          Set alert thresholds for each dam
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">

          {/* Dam List */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Select Dam</h3>
            {dams.map(dam => (
              <button
                key={dam.id}
                onClick={() => handleSelectDam(dam)}
                className={`w-full text-left px-3 py-2 rounded text-sm mb-1 transition
                  ${selectedDam?.id === dam.id
                    ? 'bg-blue-800 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                  }`}
              >
                {dam.name}
              </button>
            ))}
          </div>

          {/* Alert Form */}
          <div className="col-span-2 bg-white rounded-lg shadow-sm border p-6">
            {selectedDam ? (
              <>
                <h3 className="font-semibold text-gray-800 mb-1">
                  {selectedDam.name}
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  {selectedDam.location}
                </p>

                {success && (
                  <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded mb-4">
                    {success}
                  </div>
                )}
                {error && (
                  <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-6">

                    {/* Green */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <label className="font-medium text-green-800">
                          Green Alert
                        </label>
                      </div>
                      <p className="text-green-700 text-xs mb-2">
                        Normal — below this % is GREEN
                      </p>
                      <input
                        type="number" step="0.1" min="0" max="100"
                        className="w-full border border-green-300 rounded px-3 py-2 text-sm"
                        value={form.green_max_percent}
                        onChange={e => setForm({ ...form, green_max_percent: e.target.value })}
                        required
                      />
                      <p className="text-green-600 text-xs mt-1">Max % for Green</p>
                    </div>

                    {/* Yellow */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <label className="font-medium text-yellow-800">
                          Yellow Alert
                        </label>
                      </div>
                      <p className="text-yellow-700 text-xs mb-2">
                        Caution — below this % is YELLOW
                      </p>
                      <input
                        type="number" step="0.1" min="0" max="100"
                        className="w-full border border-yellow-300 rounded px-3 py-2 text-sm"
                        value={form.yellow_max_percent}
                        onChange={e => setForm({ ...form, yellow_max_percent: e.target.value })}
                        required
                      />
                      <p className="text-yellow-600 text-xs mt-1">Max % for Yellow</p>
                    </div>

                    {/* Orange */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <label className="font-medium text-orange-800">
                          Orange Alert
                        </label>
                      </div>
                      <p className="text-orange-700 text-xs mb-2">
                        Warning — below this % is ORANGE
                      </p>
                      <input
                        type="number" step="0.1" min="0" max="100"
                        className="w-full border border-orange-300 rounded px-3 py-2 text-sm"
                        value={form.orange_max_percent}
                        onChange={e => setForm({ ...form, orange_max_percent: e.target.value })}
                        required
                      />
                      <p className="text-orange-600 text-xs mt-1">Max % for Orange</p>
                    </div>

                    {/* Red */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <label className="font-medium text-red-800">
                          Red Alert
                        </label>
                      </div>
                      <p className="text-red-700 text-xs mb-2">
                        Danger — above this % is RED
                      </p>
                      <input
                        type="number" step="0.1" min="0" max="100"
                        className="w-full border border-red-300 rounded px-3 py-2 text-sm"
                        value={form.red_min_percent}
                        onChange={e => setForm({ ...form, red_min_percent: e.target.value })}
                        required
                      />
                      <p className="text-red-600 text-xs mt-1">Min % for Red</p>
                    </div>

                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="mt-6 bg-blue-800 text-white px-6 py-2 rounded text-sm hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Alert Config'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center text-gray-400 py-8">
                Select a dam to configure alerts
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}