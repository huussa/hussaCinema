import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import moviesRoutes from './routes/moviesRoutes.js';
import screensRoutes from './routes/screensRoutes.js';
import showTimesRoutes from './routes/showTimesRoutes.js';
// import reservationsRoutes from './routes/reservationsRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use("/api", authRoutes);
app.use("/api", moviesRoutes);
app.use("/api", screensRoutes);
app.use("/api", showTimesRoutes);
// app.use("/api", reservationsRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
