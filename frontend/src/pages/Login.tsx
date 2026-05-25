import React, { useEffect } from 'react';
import { useAuth } from '../services/auth';
import './Login.css';

function Login() {
  const { getLoginUrl } = useAuth();

  useEffect(() => {
    // Check if we're returning from OAuth callback
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      // Redirect to callback handler
      window.location.href = `/auth/callback?code=${code}`;
    }
  }, []);

  const handleLogin = () => {
    const loginUrl = getLoginUrl();
    if (loginUrl) {
      window.location.href = loginUrl;
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏁 Forza Racing League</h1>
          <p>Login to manage races and players</p>
        </div>

        <div className="login-content">
          <p>Sign in with your Authentik account to access the league management system.</p>

          <button onClick={handleLogin} className="login-button">
            🔐 Login with Authentik
          </button>

          <p className="login-info">
            You need to be logged in to:
            <ul>
              <li>Record race results</li>
              <li>Manage players</li>
              <li>Update league standings</li>
            </ul>
          </p>
        </div>

        <div className="login-footer">
          <p>Your login credentials are securely handled by Authentik</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
