import { useState, useEffect } from 'react';
import { useQuestions } from '../hooks/useQuestions';
import { useAvatars } from '../hooks/useAvatars';
import { NEPQ_PHASES } from '../lib/constants';

function QuestionSuggester({ contact, currentPhase, onQuestionUsed }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const { getContextualQuestions, markQuestionUsed } = useQuestions();
  const { getAvatarById } = useAvatars();

  const avatar = contact?.avatarId ? getAvatarById(contact.avatarId) : null;
  const isFirstCall = !contact?.callHistory || contact.callHistory.length === 0;

  // Get contextual questions based on current phase, avatar, and problem level
  const contextualQuestions = getContextualQuestions(
    currentPhase || contact?.nepqPhase || 'connection',
    contact?.avatarId,
    contact?.problemLevel
  );

  // Get cold call hooks from avatar for first-time calls
  const coldCallHooks = isFirstCall && avatar?.coldCallHooks ? avatar.coldCallHooks : [];

  const handleCopyQuestion = async (questionId, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(questionId);
      markQuestionUsed(questionId);

      if (onQuestionUsed) {
        onQuestionUsed(questionId);
      }

      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const getPhaseName = (phaseId) => {
    const phase = NEPQ_PHASES.find(p => p.id === phaseId);
    return phase ? `${phase.icon} ${phase.name}` : phaseId;
  };

  if (!currentPhase && !contact?.nepqPhase) {
    return null;
  }

  return (
    <div className="card bg-white">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-xl font-bold text-gray-700 flex items-center">
          <span className="mr-2">💡</span>
          Question Suggester
        </h3>
        <button
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Current Context */}
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold text-gray-600">Context:</span>
            <span className="px-3 py-1 bg-r7-blue text-white rounded-full font-medium">
              {getPhaseName(currentPhase || contact?.nepqPhase)}
            </span>
            {contact?.problemLevel && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                L{contact.problemLevel}
              </span>
            )}
            {avatar && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                {avatar.position || avatar.name}
              </span>
            )}
          </div>

          {/* Cold Call Hooks (First Call Only) */}
          {isFirstCall && coldCallHooks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <span className="mr-2">🎣</span>
                Cold Call Hooks
              </h4>
              <div className="space-y-2">
                {coldCallHooks.map((hook, index) => (
                  <div
                    key={`hook-${index}`}
                    className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-gray-800 flex-1">{hook}</p>
                      <button
                        onClick={() => handleCopyQuestion(`hook-${index}`, hook)}
                        className="flex-shrink-0 p-2 hover:bg-white rounded transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedId === `hook-${index}` ? (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contextual Questions */}
          {contextualQuestions.length > 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <span className="mr-2">❓</span>
                Suggested Questions ({contextualQuestions.length})
              </h4>
              <div className="space-y-2">
                {contextualQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{question.text}</p>
                        {question.tags && question.tags.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {question.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 bg-white text-gray-600 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {question.usageCount > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Used {question.usageCount} {question.usageCount === 1 ? 'time' : 'times'}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopyQuestion(question.id, question.text)}
                        className="flex-shrink-0 p-2 hover:bg-white rounded transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedId === question.id ? (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No questions available for this context</p>
              <p className="text-sm text-gray-400">
                Add questions to your library to see suggestions here
              </p>
            </div>
          )}

          {/* Quick Tip */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              <span className="font-semibold">💡 Tip:</span> Click the copy icon to quickly grab a question.
              Questions are tailored to the current NEPQ phase{avatar ? ', avatar' : ''}{contact?.problemLevel ? ', and problem level' : ''}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionSuggester;
