"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = __importDefault(require("http"));
const port = process.env.PORT || 3000;
const dbUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/test';
const server = http_1.default.createServer(app_1.default);
mongoose_1.default.connect(dbUrl)
    .then(() => {
    console.log('Connected to MongoDB');
    server.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
})
    .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});
