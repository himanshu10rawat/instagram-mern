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
