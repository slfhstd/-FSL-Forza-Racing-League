import React, { useEffect, useState } from 'react';
import { useAuth } from '../services/auth';
import './AuthCallback.css';

function AuthCallback() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (!code) {
          throw new Error('No authorization code received');
        }

        await login(code);
        // Redirect to app on success
        window.location.href = '/';
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        setLoading(false);
      }
    };

    handleCallback();
  }, [login]);

  return (
    <div className="callback-container">
      <div className="callback-card">
        {loading ? (
          <>
            <div className="spinner"></div>
            <h2>Authenticating...</h2>
            <p>Redirecting you to the racing league...</p>
          </>
        ) : (
          <>
            <h2>Authentication Failed</h2>
            <p className="error">{error}</p>
            <a href="/login" className="retry-button">
              Return to Login
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthCallback;
