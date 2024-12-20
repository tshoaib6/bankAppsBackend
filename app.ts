import express, { Application, Request, Response, NextFunction } from 'express';
import * as path from 'path';
import * as fs from 'fs';
const dotenv = require('dotenv');

dotenv.config();

const app: Application = express();

// Middleware
app.use(express.json());

// Custom CORS middleware
app.use((req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); // Replace with your frontend URL
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '1800');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, PATCH, OPTIONS');

  // If the request method is OPTIONS, end the request here.
  if (req.method === 'OPTIONS') {
    res.sendStatus(204); // No need to return the Response object explicitly
    return;
  }

  next(); // Call next middleware in the chain
});

// Function to dynamically load routes with error handling
const loadRoutes = (app: Application) => {
  const routesPath = path.join(__dirname, 'src/routes');
  
  fs.readdirSync(routesPath).forEach((file) => {
    if (file.endsWith('.routes.ts')) {
      const route = require(path.join(routesPath, file));
      
      if (route.default) {
        app.use('/api', route.default); // Set prefix for routes
        console.log(`Route loaded: ${file}`);
      } else {
        console.error(`Error: '${file}' does not export a valid router`);
      }
    }
  });
};

// Load routes dynamically
loadRoutes(app);


// Catch-all for handling 404 errors
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send('Not Found');
});

export default app;
