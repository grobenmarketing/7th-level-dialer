import { useState } from 'react';
import { useOkCodes } from '../hooks/useOkCodes';

function OkCodesAdmin({ onBack }) {
  const { okCodes, addOkCode, updateOkCode, deleteOkCode, reorderOkCodes, resetToDefaults } = useOkCodes();
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    color: '#808080',
    countsAsPickup: true,
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.label.trim()) return;

    await addOkCode(formData);
    setFormData({ label: '', color: '#808080', countsAsPickup: true });
    setShowAddForm(false);
  };

  const handleEdit = async (id) => {
    const code = okCodes.find((c) => c.id === id);
    if (code) {
      setEditingId(id);
      setFormData({
        label: code.label,
        color: code.color,
        countsAsPickup: code.countsAsPickup,
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.label.trim()) return;

    await updateOkCode(editingId, formData);
    setEditingId(null);
    setFormData({ label: '', color: '#808080', countsAsPickup: true });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this OK code?')) {
      await deleteOkCode(id);
    }
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;
    const newOrder = [...okCodes];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    await reorderOkCodes(newOrder);
  };

  const handleMoveDown = async (index) => {
    if (index === okCodes.length - 1) return;
    const newOrder = [...okCodes];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    await reorderOkCodes(newOrder);
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset to default OK codes? This will delete all custom codes.')) {
      await resetToDefaults();
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-r7-blue dark:text-r7-neon">Manage OK Codes</h1>
            <p className="text-muted">Customize your call outcome options</p>
          </div>
          <button onClick={onBack} className="btn-secondary">
            ← Back to Settings
          </button>
        </div>

        {/* Add New Code Button */}
        {!showAddForm && !editingId && (
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all"
            >
              + Add New OK Code
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {(showAddForm || editingId) && (
          <div className="glass-card mb-6">
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              {editingId ? 'Edit OK Code' : 'Add New OK Code'}
            </h2>
            <form onSubmit={editingId ? handleUpdate : handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Label
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Not Interested"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-20 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="#808080"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.countsAsPickup}
                    onChange={(e) => setFormData({ ...formData, countsAsPickup: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Counts as Pickup (for KPI tracking)
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    setFormData({ label: '', color: '#808080', countsAsPickup: true });
                  }}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
                >
                  {editingId ? 'Update' : 'Add'} OK Code
                </button>
              </div>
            </form>
          </div>
        )}

        {/* OK Codes List */}
        <div className="glass-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-700">Current OK Codes</h2>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-all text-sm"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="space-y-2">
            {okCodes.map((code, index) => (
              <div
                key={code.id}
                className="flex items-center justify-between p-4 border-2 border-glass rounded-lg hover:border-r7-blue/30 dark:hover:border-r7-neon/30 transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className="w-12 h-12 rounded-lg"
                    style={{ backgroundColor: code.color }}
                  ></div>
                  <div>
                    <div className="font-bold text-gray-800">{code.label}</div>
                    <div className="text-sm text-gray-600">
                      {code.countsAsPickup ? '✓ Counts as Pickup' : '✗ Does not count as Pickup'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Move Up/Down Buttons */}
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === okCodes.length - 1}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ↓
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleEdit(code.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                  >
                    Edit
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(code.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {okCodes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No OK codes defined. Add one to get started!
            </div>
          )}
        </div>

        {/* Info */}
        <div className="glass-card border-2 border-glass bg-r7-blue/10 dark:bg-r7-neon/10 mt-6">
          <h3 className="font-bold text-blue-900 mb-2">About OK Codes</h3>
          <p className="text-sm text-blue-800">
            OK codes represent the outcomes of your calls. They help track your
            calling effectiveness and guide follow-up actions. Codes marked as
            "Counts as Pickup" are included in your pickup rate KPI calculations.
          </p>
        </div>
      </div>
    </div>
  );
}

export default OkCodesAdmin;
