"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bankPremiumController_1 = require("../controllers/bankPremiumController");
const multer_1 = require("../middlewares/multer");
const router = express_1.default.Router();
router.post('/bankPremiums', multer_1.upload.single('image'), bankPremiumController_1.createBankPremium);
router.put('/updateBankPremiums/:bankPremiumId', multer_1.upload.single('image'), bankPremiumController_1.updateBankPremium);
router.delete('/deleteBankPremiums/:bankPremiumId', bankPremiumController_1.deleteBankPremium);
router.get('/getBankPremiums', bankPremiumController_1.getAllBankPremiums);
router.get('/getBankPremiumById/:bankPremiumId', bankPremiumController_1.getBankPremiumById);
exports.default = router;
