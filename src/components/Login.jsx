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
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'var(--bg-void)'}}>
      <div className="glass-card p-12 max-w-md w-full">
        <div className="text-center mb-10">
          <div className="text-6xl mb-6">🐺</div>
          <h1 className="text-4xl font-bold mb-3 text-neon">
            WOLFPACK DIALER
          </h1>
          <p className="text-muted text-lg">
            Enter password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-3 uppercase tracking-wide text-neon">
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
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid var(--neon-red)',
              color: 'var(--neon-red)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full text-lg py-4"
          >
            🔓 Access Dialer
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-muted">
          <p>R7 Creative • Wolfpack Edition</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
