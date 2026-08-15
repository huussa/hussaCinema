const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
).replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || `Request failed (${response.status})`,
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  getMovies: () => request("/movies"),
  getMovie: (id) => request(`/movies/${id}`),

  getShowtimes: (date) =>
    request(`/showtimes?date=${encodeURIComponent(date)}`),
  getMovieShowtimes: (movieId, date) =>
    request(`/movies/${movieId}/showtimes?date=${encodeURIComponent(date)}`),

  getScreens: () => request("/screens"),
  getScreenSeats: (screenId) => request(`/screens/${screenId}/seats`),

  getShowtimeSeats: (showtimeId) => request(`/showtimes/${showtimeId}/seats`),

  register: (body) =>
    request("/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body) =>
    request("/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  requestLoginCode: (email) =>
    request("/login/code", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  loginWithCode: (body) =>
    request("/login/code/verify", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  logout: () => request("/logout", { method: "POST" }),
  me: () => request("/me"),

  createReservation: (showtimeId, seatIds) =>
    request(`/reservations/${showtimeId}`, {
      method: "POST",
      body: JSON.stringify({ seatIds }),
    }),
  getMyReservations: () => request("/reservations/me"),
  cancelReservation: (reservationId) =>
    request(`/reservations/${reservationId}`, { method: "DELETE" }),

  createMovie: (body) =>
    request("/movies", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateMovie: (id, body) =>
    request(`/movies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteMovie: (id) => request(`/movies/${id}`, { method: "DELETE" }),

  createShowtime: (movieId, body) =>
    request(`/movies/${movieId}/showtimes`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateShowtime: (id, body) =>
    request(`/showtimes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteShowtime: (id) => request(`/showtimes/${id}`, { method: "DELETE" }),
};

export { API_URL };
