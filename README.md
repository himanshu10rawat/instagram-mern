# Instagram MERN

Full-stack Instagram-style MERN application with authentication, posts, stories, reels, messaging, notifications, live features, analytics, admin tools, Redis-backed realtime presence/cache, and background workers.

## Project Structure

- `backend`: Express, MongoDB, Socket.IO, BullMQ, Redis, Cloudinary, SMTP, Agora.
- `frontend`: React, Vite, Redux Toolkit, Tailwind CSS.

## Local Setup

1. Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

2. Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Fill the copied `.env` files with real credentials.

### Email With Brevo

The backend can send Brevo transactional email through the HTTPS API or SMTP. The HTTPS API is recommended for production hosts that block outbound SMTP ports.

Recommended production setup:

```bash
EMAIL_PROVIDER=brevo
BREVO_API_KEY=your-brevo-api-key
EMAIL_FROM="Instagram MERN <no-reply@your-verified-domain.com>"
```

SMTP fallback:

```bash
EMAIL_PROVIDER=brevo
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-smtp-login
SMTP_PASS=your-brevo-smtp-key
EMAIL_FROM="Instagram MERN <no-reply@your-verified-domain.com>"
```

You can get the API key or SMTP login/key from Brevo's SMTP/API settings. The sender email or domain must be verified in Brevo.

### Production Frontend Env

For Vercel or any static frontend host, set these build-time environment variables:

```bash
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
VITE_SOCKET_URL=https://your-api-domain.com
```

Never deploy the frontend with `localhost` API URLs; that makes production browsers call the visitor's own machine instead of your deployed backend.

4. Start the backend:

```bash
cd backend
npm run dev
```

5. Start the frontend:

```bash
cd frontend
npm run dev
```

## Production

Build the frontend:

```bash
cd frontend
npm run build
```

Run the API:

```bash
cd backend
npm start
```

For separate queue workers, set `WORKERS_ENABLED=false` on the API process and run:

```bash
cd backend
npm run worker
```

## Verification

```bash
cd backend
npm run lint

cd ../frontend
npm run lint
npm run build
```
