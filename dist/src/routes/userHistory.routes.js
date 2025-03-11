"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userHistory_1 = require("../controllers/userHistory"); // Import the controller
const router = (0, express_1.Router)();
// Route to get the user history
router.get('/Userhistory', userHistory_1.getUserHistory);
exports.default = router;
