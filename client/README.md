# client — onCinema Frontend

Next.js + JavaScript + Tailwind CSS frontend for the supplied onCinema backend.

## Run

1. Copy `.env.local.example` to `.env.local`
2. Make sure the backend is running on `http://localhost:3001`
3. Run:

```bash
npm install
npm run dev
```

Frontend: http://localhost:3000

## API

The frontend uses:

`NEXT_PUBLIC_API_URL=http://localhost:3001/api`

The backend supplied by the project enables CORS for `http://localhost:3000` with credentials, so the JWT is handled by the backend's httpOnly cookie.

## Important API limitations

- There is no `/genres` endpoint, so admin movie forms accept comma-separated existing genre IDs.
- There is no admin-wide users endpoint.
- There is no admin-wide reservations endpoint; `/reservations/me` only returns the logged-in user's reservations.
- There is no payment endpoint in the supplied API, so booking currently confirms the reservation directly.
- Movie creation requires at least one showtime in the same request.
- Showtime listing requires a `date=YYYY-MM-DD` query.

## Security note

Do not copy backend secrets into this frontend. The frontend only needs the public API URL. Never put JWT secrets, database URLs, or payment secret keys in `NEXT_PUBLIC_*` variables.
