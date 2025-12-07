import { NEPQ_PHASES, PROBLEM_LEVELS } from '../lib/constants';
import { nepqHelpers } from '../lib/nepq';

function NEPQTracker({ contact, compact = false }) {
  if (!contact) return null;

  const currentPhaseIndex = nepqHelpers.getPhaseIndex(contact.nepqPhase || 'connection');
  const progressPercentage = nepqHelpers.getProgressPercentage(contact);
  const problemLevel = contact.problemLevel || 0;

  // Get problem level details
  const currentProblemLevel = PROBLEM_LEVELS.find(pl => pl.level === problemLevel);
  const problemLevelColor = nepqHelpers.getProblemLevelColor(problemLevel);

  // Compact version for cards
  if (compact) {
    return (
      <div className="space-y-2">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-gray-600">
              NEPQ Progress
            </span>
            <span className="text-xs text-gray-500">
              {contact.nepqPhase ? NEPQ_PHASES.find(p => p.id === contact.nepqPhase)?.name : 'Not Started'}
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-r7-blue to-blue-600 rounded-full h-2 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Problem Level Badge */}
        {problemLevel > 0 && (
          <div className="flex items-center">
            <span className="text-xs font-semibold text-gray-600 mr-2">
              Problem Level:
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
              problemLevelColor === 'blue' ? 'bg-blue-100 text-blue-800' :
              problemLevelColor === 'green' ? 'bg-green-100 text-green-800' :
              problemLevelColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              problemLevelColor === 'red' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              L{problemLevel} - {currentProblemLevel?.name}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Full version for calling interface
  return (
    <div className="card bg-white">
      <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
        <span className="mr-2">📊</span>
        NEPQ Journey Progress
      </h3>

      {/* Phase Progress Timeline */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-600">
            Current Phase
          </span>
          <span className="text-sm font-bold text-r7-blue">
            {NEPQ_PHASES[currentPhaseIndex]?.icon} {NEPQ_PHASES[currentPhaseIndex]?.name}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 rounded-full h-3 mb-3">
          <div
            className="bg-gradient-to-r from-r7-blue to-blue-600 rounded-full h-3 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Phase Pills */}
        <div className="grid grid-cols-7 gap-1">
          {NEPQ_PHASES.map((phase, index) => (
            <div
              key={phase.id}
              className={`text-center p-1 rounded text-xs transition-all ${
                index <= currentPhaseIndex
                  ? 'bg-r7-blue text-white font-semibold'
                  : 'bg-gray-100 text-gray-400'
              }`}
              title={phase.name}
            >
              <div className="text-sm">{phase.icon}</div>
              <div className="hidden sm:block truncate">{phase.name.split(' ')[0]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Problem Level Indicator */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-600 mb-3">
          Problem Discovery Level
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {PROBLEM_LEVELS.map((level) => (
            <div
              key={level.level}
              className={`p-3 rounded-lg border-2 transition-all ${
                problemLevel >= level.level
                  ? `border-${level.color}-500 bg-${level.color}-50`
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className={`text-lg font-bold mb-1 ${
                problemLevel >= level.level
                  ? level.color === 'blue' ? 'text-blue-700' :
                    level.color === 'green' ? 'text-green-700' :
                    level.color === 'yellow' ? 'text-yellow-700' :
                    level.color === 'red' ? 'text-red-700' :
                    'text-gray-700'
                  : 'text-gray-400'
              }`}>
                L{level.level}
              </div>
              <div className={`text-xs font-semibold ${
                problemLevel >= level.level ? 'text-gray-700' : 'text-gray-400'
              }`}>
                {level.name}
              </div>
              <div className={`text-xs ${
                problemLevel >= level.level ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {level.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Problems Identified */}
      {contact.problemsIdentified && contact.problemsIdentified.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2">
            Problems Discovered
          </h4>
          <div className="space-y-2">
            {contact.problemsIdentified.map((problem, index) => (
              <div
                key={index}
                className={`p-2 rounded border-l-4 ${
                  problem.level === 1 ? 'border-blue-500 bg-blue-50' :
                  problem.level === 2 ? 'border-green-500 bg-green-50' :
                  problem.level === 3 ? 'border-yellow-500 bg-yellow-50' :
                  problem.level === 4 ? 'border-red-500 bg-red-50' :
                  'border-gray-500 bg-gray-50'
                }`}
              >
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white text-xs font-bold mr-2">
                    L{problem.level}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{problem.statement}</p>
                    {problem.date && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(problem.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NEPQTracker;
