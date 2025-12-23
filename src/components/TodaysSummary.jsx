import { getTodaysTaskSummary, getOverdueCount, formatDate, getToday } from '../lib/taskScheduler';
import { useKPI } from '../hooks/useKPI';

function TodaysSummary({ tasks, contacts }) {
  const today = getToday();
  const todayFormatted = formatDate(today);
  const { dailyDialGoal } = useKPI();

  const summary = getTodaysTaskSummary(tasks);
  const overdueCount = getOverdueCount(tasks);

  // Use daily dial goal from useKPI hook (synced with calling interface)
  const coldCallGoal = dailyDialGoal;

  // Count cold calls completed today (contacts that started their sequence today)
  const coldCallsCompletedToday = contacts.filter(
    c => c.sequence_start_date === today
  ).length;

  // Debug logging
  console.log('📊 Today\'s Workload Debug:', {
    today,
    totalContacts: contacts.length,
    coldCallsCompletedToday,
    contactsWithSequenceStartDate: contacts.filter(c => c.sequence_start_date).length,
    sampleDates: contacts.slice(0, 3).map(c => ({ id: c.id, sequence_start_date: c.sequence_start_date }))
  });

  // Get all tasks that were due today (both pending and completed)
  const tasksDueToday = tasks.filter(t => t.task_due_date === today);
  const totalTasksToday = tasksDueToday.length;
  const completedToday = tasksDueToday.filter(t => t.status === 'completed').length;

  // Progress calculation including cold calls (cap at 100%)
  const totalWork = totalTasksToday + coldCallGoal;
  const totalCompleted = completedToday + coldCallsCompletedToday;
  const rawProgress = totalWork > 0 ? Math.round((totalCompleted / totalWork) * 100) : 0;
  const progress = Math.min(rawProgress, 100); // Cap at 100%

  return (
    <div className="card bg-white mb-6 border-2 border-r7-navy">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-r7-blue">📋 Today's Workload</h2>
        <p className="text-gray-600 mt-1">{todayFormatted}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{summary.calls}</div>
          <div className="text-xs text-gray-600">Sequence Calls</div>
        </div>

        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{summary.emails}</div>
          <div className="text-xs text-gray-600">Emails to Send</div>
        </div>

        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {summary.linkedinDMs + summary.linkedinComments}
          </div>
          <div className="text-xs text-gray-600">LinkedIn Tasks</div>
        </div>

        <div className="text-center p-3 bg-teal-50 rounded-lg">
          <div className="text-2xl font-bold text-teal-600">{coldCallGoal}</div>
          <div className="text-xs text-gray-600">Cold Calls To Do</div>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueCount > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-bold text-red-800">
                {overdueCount} Overdue Task{overdueCount !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-red-700 mt-1">
                Complete overdue tasks before contacts can advance to the next day
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      {totalWork > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Today's Progress
            </span>
            <span className="text-sm text-gray-600">
              {totalCompleted} of {totalWork} complete ({progress}%)
            </span>
          </div>
          <div className="text-xs text-gray-500 text-right mb-2">
            {completedToday}/{totalTasksToday} sequence tasks • {coldCallsCompletedToday}/{coldCallGoal} cold calls
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-r7-red h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Summary Message */}
      <div className="mt-4 text-center">
        {totalTasksToday === 0 && coldCallGoal > 0 && coldCallsCompletedToday === 0 && overdueCount === 0 && (
          <p className="text-gray-500 text-sm">
            ✅ No sequence tasks due today. Focus on cold calls!
          </p>
        )}
        {totalCompleted === totalWork && totalWork > 0 && (
          <p className="text-green-600 font-bold text-sm">
            🎉 All tasks for today complete! Great work!
          </p>
        )}
      </div>
    </div>
  );
}

export default TodaysSummary;
