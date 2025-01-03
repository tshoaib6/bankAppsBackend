import express, { Application, Request, Response, NextFunction } from 'express';
import * as path from 'path';
import * as fs from 'fs';
const dotenv = require('dotenv');

dotenv.config();

const app: Application = express();

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '1800');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, PATCH, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204); 
    return;
  }

  next(); 
});

const loadRoutes = (app: Application) => {
  const routesPath = path.join(__dirname, 'src/routes');
  
  fs.readdirSync(routesPath).forEach((file) => {
    if (file.endsWith('.routes.ts')) {
      const route = require(path.join(routesPath, file));
      
      if (route.default) {
        app.use('/api', route.default); 
        console.log(`Route loaded: ${file}`);
      } else {
        console.error(`Error: '${file}' does not export a valid router`);
      }
    }
  });
};

loadRoutes(app);


app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send('Not Found');
});

export default app;
