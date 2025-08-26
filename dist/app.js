"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const dotenv = require("dotenv");
dotenv.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url} → body:`, req.body);
    next();
});
// Middleware for CORS
app.use((req, res, next) => {
    // const allowedOrigin = process.env.FRONT_END_URL || 'http://localhost:5173'; // Use the environment variable for front-end URL, with a fallback
    const allowedOrigin = "*"; // Use the environment variable for front-end URL, with a fallback
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin); // Set dynamic allowed origin from environment variable
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "1800");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS");
    // Handle OPTIONS request separately (preflight check)
    if (req.method === "OPTIONS") {
        res.sendStatus(204); // No content for preflight
        return;
    }
    next(); // Proceed with other middleware or route handlers
});
// Function to dynamically load routes
const loadRoutes = (app) => {
    const routesPath = path.join(__dirname, "src/routes");
    fs.readdirSync(routesPath).forEach((file) => {
        if (file.endsWith(".routes.ts")) {
            const route = require(path.join(routesPath, file));
            if (route.default) {
                app.use("/api", route.default); // Use route with '/api' prefix
                console.log(`Route loaded: ${file}`);
            }
            else {
                console.error(`Error: '${file}' does not export a valid router`);
            }
        }
    });
};
// Load routes dynamically
loadRoutes(app);
// Handle 404 Not Found
app.use((req, res, next) => {
    res.status(404).send("Not Found");
});
exports.default = app;
