import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Enable CORS
app.use(cors());

// Set security HTTP headers
app.use(helmet());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // Limit request body size

// Basic Error Handling Middleware
interface HttpError extends Error {
  status?: number;
}

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';
  res.status(status).send({
    status,
    message,
  });
});

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Backend server is running!');
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;