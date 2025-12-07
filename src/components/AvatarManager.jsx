import { useState } from 'react';
import { useAvatars } from '../hooks/useAvatars';

function AvatarManager({ onBack }) {
  const { avatars, addAvatar, updateAvatar, deleteAvatar } = useAvatars();
  const [showForm, setShowForm] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    isDecisionMaker: true,
    personality: 'analytical',
    sophistication: 'medium',
    momentsInTime: '',
    coldCallHooks: '',
    level1Problems: '',
    level2Problems: '',
    level3Problems: '',
    level4Problems: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      isDecisionMaker: true,
      personality: 'analytical',
      sophistication: 'medium',
      momentsInTime: '',
      coldCallHooks: '',
      level1Problems: '',
      level2Problems: '',
      level3Problems: '',
      level4Problems: ''
    });
    setEditingAvatar(null);
    setShowForm(false);
  };

  const handleEdit = (avatar) => {
    setEditingAvatar(avatar);
    setFormData({
      name: avatar.name,
      position: avatar.position,
      isDecisionMaker: avatar.isDecisionMaker,
      personality: avatar.personality || 'analytical',
      sophistication: avatar.sophistication || 'medium',
      momentsInTime: avatar.momentsInTime?.join('\n') || '',
      coldCallHooks: avatar.coldCallHooks?.join('\n') || '',
      level1Problems: avatar.problems?.level1?.join('\n') || '',
      level2Problems: avatar.problems?.level2?.join('\n') || '',
      level3Problems: avatar.problems?.level3?.join('\n') || '',
      level4Problems: avatar.problems?.level4?.join('\n') || ''
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const avatarData = {
      name: formData.name,
      position: formData.position,
      isDecisionMaker: formData.isDecisionMaker,
      personality: formData.personality,
      sophistication: formData.sophistication,
      momentsInTime: formData.momentsInTime.split('\n').filter(m => m.trim()),
      coldCallHooks: formData.coldCallHooks.split('\n').filter(h => h.trim()),
      problems: {
        level1: formData.level1Problems.split('\n').filter(p => p.trim()),
        level2: formData.level2Problems.split('\n').filter(p => p.trim()),
        level3: formData.level3Problems.split('\n').filter(p => p.trim()),
        level4: formData.level4Problems.split('\n').filter(p => p.trim())
      }
    };

    if (editingAvatar) {
      updateAvatar(editingAvatar.id, avatarData);
    } else {
      addAvatar(avatarData);
    }

    resetForm();
  };

  const handleDelete = (avatarId) => {
    if (window.confirm('Are you sure you want to delete this avatar?')) {
      deleteAvatar(avatarId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-r7-light to-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-r7-blue">Avatar / ICP Manager</h1>
            <p className="text-gray-600">
              Create and manage buyer personas for targeted prospecting
            </p>
          </div>
          <button onClick={onBack} className="btn-secondary">
            ← Back to Dashboard
          </button>
        </div>

        {/* Action Buttons */}
        {!showForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              + Create New Avatar
            </button>
          </div>
        )}

        {/* Avatar Form */}
        {showForm && (
          <div className="card bg-white mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingAvatar ? 'Edit Avatar' : 'Create New Avatar'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Avatar Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Operations Director - Manufacturing"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Position / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g., Director of Operations"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Personality Type
                  </label>
                  <select
                    value={formData.personality}
                    onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                    className="select-field"
                  >
                    <option value="analytical">Analytical</option>
                    <option value="driver">Driver</option>
                    <option value="expressive">Expressive</option>
                    <option value="amiable">Amiable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sophistication Level
                  </label>
                  <select
                    value={formData.sophistication}
                    onChange={(e) => setFormData({ ...formData, sophistication: e.target.value })}
                    className="select-field"
                  >
                    <option value="low">Low (Needs Education)</option>
                    <option value="medium">Medium (Aware of Problem)</option>
                    <option value="high">High (Evaluating Solutions)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDecisionMaker"
                  checked={formData.isDecisionMaker}
                  onChange={(e) => setFormData({ ...formData, isDecisionMaker: e.target.checked })}
                  className="w-4 h-4 text-r7-blue border-gray-300 rounded focus:ring-r7-blue"
                />
                <label htmlFor="isDecisionMaker" className="ml-2 text-sm font-semibold text-gray-700">
                  This is a decision maker
                </label>
              </div>

              {/* Moments in Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Moments in Time (one per line)
                </label>
                <textarea
                  value={formData.momentsInTime}
                  onChange={(e) => setFormData({ ...formData, momentsInTime: e.target.value })}
                  placeholder="New equipment purchase&#10;Quality control issues&#10;Scaling production"
                  rows="3"
                  className="input-field resize-none"
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  Key trigger events or situations when they might need your solution
                </p>
              </div>

              {/* Cold Call Hooks */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cold Call Hooks (one per line)
                </label>
                <textarea
                  value={formData.coldCallHooks}
                  onChange={(e) => setFormData({ ...formData, coldCallHooks: e.target.value })}
                  placeholder="We work with directors frustrated with unexpected downtime...&#10;I noticed your company recently expanded - have capacity issues come up?"
                  rows="3"
                  className="input-field resize-none"
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  Opening statements that create curiosity and engagement
                </p>
              </div>

              {/* Problems by Level */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Common Problems by Level
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">
                      L1: Obvious Problems (Wants/Not Wants)
                    </label>
                    <textarea
                      value={formData.level1Problems}
                      onChange={(e) => setFormData({ ...formData, level1Problems: e.target.value })}
                      placeholder="Want to reduce downtime&#10;Don't want quality issues"
                      rows="3"
                      className="input-field resize-none border-blue-300"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-green-700 mb-2">
                      L2: Common Problems (Lack of...)
                    </label>
                    <textarea
                      value={formData.level2Problems}
                      onChange={(e) => setFormData({ ...formData, level2Problems: e.target.value })}
                      placeholder="Lack of real-time data&#10;No preventive maintenance process"
                      rows="3"
                      className="input-field resize-none border-green-300"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-yellow-700 mb-2">
                      L3: Specific Problems (Quantified Impact)
                    </label>
                    <textarea
                      value={formData.level3Problems}
                      onChange={(e) => setFormData({ ...formData, level3Problems: e.target.value })}
                      placeholder="Downtime costs $50K/day&#10;Quality issues up 15% YoY"
                      rows="3"
                      className="input-field resize-none border-yellow-300"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-red-700 mb-2">
                      L4: Mission Critical (Cost of Inaction)
                    </label>
                    <textarea
                      value={formData.level4Problems}
                      onChange={(e) => setFormData({ ...formData, level4Problems: e.target.value })}
                      placeholder="Competitors gaining market share&#10;Risk losing major clients"
                      rows="3"
                      className="input-field resize-none border-red-300"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t">
                <button type="submit" className="btn-primary">
                  {editingAvatar ? 'Update Avatar' : 'Create Avatar'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Avatar List */}
        {!showForm && (
          <div className="space-y-4">
            {avatars.length === 0 ? (
              <div className="card bg-white text-center py-12">
                <div className="text-6xl mb-4">👤</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  No Avatars Yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first buyer persona to get started
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary"
                >
                  Create Your First Avatar
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800">
                  Your Avatars ({avatars.length})
                </h2>
                {avatars.map((avatar) => (
                  <div key={avatar.id} className="card bg-white">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {avatar.name}
                        </h3>
                        <p className="text-gray-600">{avatar.position}</p>
                        {avatar.isDecisionMaker && (
                          <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                            Decision Maker
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(avatar)}
                          className="btn-secondary text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(avatar.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Characteristics
                        </h4>
                        <p className="text-sm text-gray-600">
                          <strong>Personality:</strong> {avatar.personality || 'Not set'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Sophistication:</strong> {avatar.sophistication || 'Not set'}
                        </p>
                      </div>

                      {avatar.momentsInTime && avatar.momentsInTime.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Moments in Time
                          </h4>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {avatar.momentsInTime.slice(0, 3).map((moment, idx) => (
                              <li key={idx}>{moment}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {avatar.coldCallHooks && avatar.coldCallHooks.length > 0 && (
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Cold Call Hooks
                          </h4>
                          <div className="space-y-1">
                            {avatar.coldCallHooks.slice(0, 2).map((hook, idx) => (
                              <p key={idx} className="text-sm text-gray-600 italic">
                                "{hook}"
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Problem Levels
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs font-semibold text-blue-800">L1 Problems</p>
                            <p className="text-lg font-bold text-blue-900">
                              {avatar.problems?.level1?.length || 0}
                            </p>
                          </div>
                          <div className="p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-xs font-semibold text-green-800">L2 Problems</p>
                            <p className="text-lg font-bold text-green-900">
                              {avatar.problems?.level2?.length || 0}
                            </p>
                          </div>
                          <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                            <p className="text-xs font-semibold text-yellow-800">L3 Problems</p>
                            <p className="text-lg font-bold text-yellow-900">
                              {avatar.problems?.level3?.length || 0}
                            </p>
                          </div>
                          <div className="p-2 bg-red-50 rounded border border-red-200">
                            <p className="text-xs font-semibold text-red-800">L4 Problems</p>
                            <p className="text-lg font-bold text-red-900">
                              {avatar.problems?.level4?.length || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AvatarManager;
