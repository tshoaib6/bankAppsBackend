    import express from "express";
import {
  createAdditionalItemController,
  getAdditionalItemByIdController,
  updateAdditionalItemController,
  deleteAdditionalItemController,
  getAllAdditionalItemsController,
  redeemAdditionalItem,
} from "../controllers/additionalItem.controller";
import { upload } from "../middlewares/multer";

const router = express.Router();

router.post("/additionalItems", upload.single("image"), createAdditionalItemController);
router.put("/updateAdditionalItems/:itemId", upload.single("image"), updateAdditionalItemController);
router.delete("/deleteAdditionalItems/:itemId", deleteAdditionalItemController);
router.get("/getAdditionalItemById/:itemId", getAdditionalItemByIdController);
router.get("/getAllAdditionalItems", getAllAdditionalItemsController);
router.post("/redeemAdditionalItem:itemId/redeem", redeemAdditionalItem);


export default router;
