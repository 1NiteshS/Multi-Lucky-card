import express from "express";
import { authAdmin, authSubAdmin } from "../middleware/auth.js";
import {
  create,
  getDistrictAdminByAdmin,
  getSubAdminGameTotalInfo,
  getTransactionHistory,
  login,
  logout,
  setCommission,
  transferMoney,
} from "../controllers/subAdminController.js";

const router = express.Router();

router.post("/create", authAdmin, create);
router.post("/login", login);
router.post("/logout", authSubAdmin, logout);

router.get("/game-total-info/:subAdminId", getSubAdminGameTotalInfo);

router.post('/transfer-money', transferMoney);

router.get('/transactions', authSubAdmin, getTransactionHistory);

router.post("/set-commission", setCommission);

router.get("/districtadmins/:adminId", getDistrictAdminByAdmin);


export default router;
