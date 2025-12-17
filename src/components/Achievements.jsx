import { useAchievements } from '../hooks/useAchievements';

function Achievements({ compact = false }) {
  const { getAllAchievements, getTotalPoints, getUnlockedCount, getTotalCount } = useAchievements();
  const achievements = getAllAchievements();

  if (compact) {
    // Compact version for dashboard
    return (
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-neon">🏆 Trophy Room</h3>
          <div className="text-sm text-muted">
            {getUnlockedCount()} / {getTotalCount()} unlocked
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {achievements.slice(0, 8).map((achievement) => (
            <div
              key={achievement.id}
              className={`
                p-3 rounded-lg text-center transition-all cursor-pointer
                ${achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border-2 border-yellow-500'
                  : 'bg-gray-100 dark:bg-white/5 border border-dashed opacity-40 grayscale'
                }
              `}
              title={achievement.description}
            >
              <div className="text-3xl mb-1">{achievement.icon}</div>
              <div className="text-xs font-semibold truncate">
                {achievement.title}
              </div>
              {achievement.unlocked && (
                <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 font-bold">
                  +{achievement.points} XP
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-glass text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {getTotalPoints()} XP
          </div>
          <div className="text-xs text-muted">Total Points Earned</div>
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-neon">🏆 Trophy Room</h2>
          <div className="glass-card px-6 py-3">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {getTotalPoints()} XP
            </div>
            <div className="text-xs text-muted">Total Points</div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted">Progress</span>
                <span className="font-bold">
                  {getUnlockedCount()} / {getTotalCount()}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${(getUnlockedCount() / getTotalCount()) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`
              p-6 rounded-lg text-center transition-all cursor-pointer
              ${achievement.unlocked
                ? 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border-2 border-yellow-500 transform hover:-translate-y-1'
                : 'glass-card opacity-40 grayscale border-dashed'
              }
            `}
          >
            <div className="text-5xl mb-3">{achievement.icon}</div>
            <div className="text-lg font-bold mb-1 text-neon">
              {achievement.title}
            </div>
            <div className="text-sm text-muted mb-3">
              {achievement.description}
            </div>
            {achievement.unlocked ? (
              <div className="inline-block bg-yellow-500/20 border border-yellow-500 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded text-xs font-bold">
                UNLOCKED • {achievement.points} XP
              </div>
            ) : (
              <div className="inline-block bg-gray-200 dark:bg-white/10 border border-dashed text-muted px-3 py-1 rounded text-xs font-bold">
                LOCKED
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Achievements;
