import express, { Application, Request, Response, NextFunction } from 'express';
import * as path from 'path';
import * as fs from 'fs';
const dotenv = require('dotenv');

dotenv.config();

const app: Application = express();

app.use(express.json());

// Middleware for CORS
app.use((req: Request, res: Response, next: NextFunction): void => {
  const allowedOrigin = process.env.FRONT_END_URL || 'http://localhost:5173'; // Use the environment variable for front-end URL, with a fallback

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin); // Set dynamic allowed origin from environment variable
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '1800');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, PATCH, OPTIONS');

  // Handle OPTIONS request separately (preflight check)
  if (req.method === 'OPTIONS') {
    res.sendStatus(204); // No content for preflight
    return;
  }

  next(); // Proceed with other middleware or route handlers
});

// Function to dynamically load routes
const loadRoutes = (app: Application) => {
  const routesPath = path.join(__dirname, 'src/routes');

  fs.readdirSync(routesPath).forEach((file) => {
    if (file.endsWith('.routes.ts')) {
      const route = require(path.join(routesPath, file));

      if (route.default) {
        app.use('/api', route.default); // Use route with '/api' prefix
        console.log(`Route loaded: ${file}`);
      } else {
        console.error(`Error: '${file}' does not export a valid router`);
      }
    }
  });
};

// Load routes dynamically
loadRoutes(app);

// Handle 404 Not Found
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send('Not Found');
});

export default app;
