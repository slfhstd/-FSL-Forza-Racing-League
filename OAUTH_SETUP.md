# OAuth2/OIDC Setup Guide for Forza Racing League

This guide explains how to configure OAuth2/OIDC authentication with Authentik to enable login functionality.

## Overview

The Forza Racing League app uses OAuth2 with OpenID Connect (OIDC) to authenticate users via Authentik. Only authenticated users can record races or manage players. Leaderboards remain public.

## Prerequisites

- An Authentik server running and accessible
- Administrator access to Authentik to create an OAuth2 application
- The Forza Racing League app deployed or running locally

## Authentik Configuration

### Step 1: Create OAuth2 Application in Authentik

1. Log in to your Authentik admin panel
2. Navigate to **Applications > Applications**
3. Click **Create** button
4. Choose **OAuth2/OpenID Provider**
5. Fill in the form:

**Basic Settings:**
- **Name**: Forza Racing League
- **Slug**: forza-racing-league

**Authentication Flow:**
- Select a flow (or create custom OIDC authorization flow)
- Recommended: Use default Authorization code grant flow

**Provider Details:**
- **Client Type**: Public
- **Client ID**: Will be auto-generated (save this)
- **Client Secret**: Will be auto-generated (save this)
- **Redirect URIs**: `http://localhost:3001/auth/callback` (or your production URL)

**Scopes:**
- Add scopes: `openid`, `profile`, `email`

**Token Settings:**
- **Access Token Expiration**: 7 days (or your preference)
- **Refresh Token Expiration**: 30 days (or your preference)

### Step 2: Note Configuration Values

After creating the application, collect:
1. **Issuer URL**: Your Authentik server URL + `/application/o/` 
   - Example: `https://auth.example.com/application/o/`
2. **Client ID**: From the application details
3. **Client Secret**: From the application details
4. **Authorization Endpoint**: Usually `{ISSUER_URL}authorize/`
5. **Token Endpoint**: Usually `{ISSUER_URL}token/`
6. **UserInfo Endpoint**: Usually `{ISSUER_URL}userinfo/`

## Application Configuration

### Backend (.env)

Add OAuth environment variables to `backend/.env`:

```env
# ... existing variables ...

# OAuth2/OIDC Configuration
OAUTH_ISSUER_URL=https://auth.example.com/application/o/
OAUTH_CLIENT_ID=your-client-id-from-authentik
OAUTH_CLIENT_SECRET=your-client-secret-from-authentik
OAUTH_REDIRECT_URI=http://localhost:3001/auth/callback

# JWT Configuration
JWT_SECRET=your-secure-random-secret-key
```

**Important**: 
- `OAUTH_REDIRECT_URI` must match the redirect URI configured in Authentik
- `JWT_SECRET` should be a long random string (for production use: generate with `openssl rand -base64 32`)

### Frontend (.env)

Add OAuth environment variables to `frontend/.env`:

```env
# Vite Variables
VITE_API_URL=http://localhost:5000/api
VITE_OAUTH_ISSUER_URL=https://auth.example.com/application/o/
VITE_OAUTH_CLIENT_ID=your-client-id-from-authentik
VITE_OAUTH_REDIRECT_URI=http://localhost:3001/auth/callback
```

## Docker Compose Configuration

Update `docker-compose.yml` to include OAuth environment variables:

```yaml
services:
  backend:
    environment:
      - OAUTH_ISSUER_URL=https://auth.example.com/application/o/
      - OAUTH_CLIENT_ID=your-client-id
      - OAUTH_CLIENT_SECRET=your-client-secret
      - OAUTH_REDIRECT_URI=http://localhost:3001/auth/callback
      - JWT_SECRET=your-jwt-secret
  
  frontend:
    environment:
      - VITE_OAUTH_ISSUER_URL=https://auth.example.com/application/o/
      - VITE_OAUTH_CLIENT_ID=your-client-id
      - VITE_OAUTH_REDIRECT_URI=http://localhost:3001/auth/callback
```

## Local Development Testing

### Setup

1. Update `backend/.env` with Authentik credentials
2. Update `frontend/.env` with Authentik credentials
3. Make sure Authentik is accessible from your machine

### Running Locally

```bash
# Backend
cd backend
npm install
npm run build
npm start

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

### Testing OAuth Flow

1. Open browser to `http://localhost:3001`
2. You should see the login page
3. Click "Login with Authentik"
4. You'll be redirected to Authentik to authorize the app
5. After authorization, you'll be redirected back to the app
6. You should see the racing league dashboard with your name displayed

## Docker Deployment

### Build and Run

```bash
docker-compose up --build
```

Ensure all OAuth environment variables are properly set in:
- `docker-compose.yml`
- `.env` files (if using docker compose env_file)

Access the app at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Troubleshooting

### "No authorization code received"
- Check that redirect URI in frontend matches Authentik configuration
- Check browser console for errors
- Verify OAuth client ID is correct

### "Invalid client or authentication failed"
- Verify `OAUTH_CLIENT_SECRET` is correct
- Check that client is configured as "Public" client in Authentik
- Verify OAUTH_CLIENT_ID matches Authentik configuration

### "Token verification failed"
- Check that `JWT_SECRET` is set and consistent
- Verify token expiration settings in Authentik
- Check backend logs for detailed error

### "UserInfo endpoint failed"
- Verify OAUTH_ISSUER_URL is correct and accessible
- Ensure scopes include `openid`, `profile`, `email`
- Check Authentik logs for authentication issues

## API Endpoints

### Public Endpoints (No Authentication Required)
- `GET /api/league/leaderboard` - Current month leaderboard
- `GET /api/league/all-time` - All-time statistics
- `GET /api/league/player/:id` - Individual player stats

### Protected Endpoints (Authentication Required)
- `POST /api/races` - Record a new race
- `GET /api/races` - Get recent races
- `DELETE /api/races/:id` - Delete a race
- `GET /api/players` - List players
- `POST /api/players` - Create a player
- `DELETE /api/players/:id` - Deactivate a player

### Authentication Endpoints
- `POST /api/auth/callback` - OAuth callback handler
- `GET /api/auth/me` - Get current authenticated user
- `POST /api/auth/verify` - Verify token validity
- `POST /api/auth/logout` - Logout (frontend-side token removal)

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS for production deployments
2. **JWT Secret**: Use a strong, randomly generated JWT secret
3. **Client Secret**: Keep OAUTH_CLIENT_SECRET secure in environment variables
4. **Token Storage**: Tokens are stored in browser localStorage (suitable for single-page apps)
5. **CORS**: Only allow requests from your application domain

## Additional Resources

- [Authentik Documentation](https://docs.goauthentik.io/)
- [OAuth 2.0 Authorization Code Flow](https://datatracker.ietf.org/doc/html/rfc6749#section-1.3.1)
- [OpenID Connect Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html)
