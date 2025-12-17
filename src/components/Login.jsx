import { useState } from 'react';

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = onLogin(password);

    if (!isValid) {
      setError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-12 max-w-md w-full">
        <div className="text-center mb-10">
          <div className="text-6xl mb-6">🔐</div>
          <h1 className="text-4xl font-bold text-r7-blue dark:text-r7-neon mb-3">
            R7 Dialer
          </h1>
          <p className="text-muted text-lg">
            Enter password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-r7-blue dark:text-r7-neon mb-3 uppercase tracking-wide">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="input-field text-lg py-4"
              placeholder="Enter password"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-500/10 dark:bg-red-500/20 border-2 border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full text-lg py-4"
          >
            Login
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-muted">
          <p>R7 Creative Dialer v1.0</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
