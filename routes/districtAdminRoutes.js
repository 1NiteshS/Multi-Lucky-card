import express from "express";
import { authDistrictAdmin, authSubAdmin } from "../middleware/auth.js";
import {
  create,
  getDistrictAdminGameTotalInfo,
  getTransactionHistory,
  getUserByDistrictAdmin,
  login,
  logout,
  setCommission,
  transferMoney,
} from "../controllers/districtAdminController.js";

const router = express.Router();

router.post("/create", authSubAdmin, create);
router.post("/login", login);
router.post("/logout", authDistrictAdmin, logout);

router.get("/game-total-info/:districtAdminId", getDistrictAdminGameTotalInfo);

router.post('/transfer-money', transferMoney);

router.get('/transactions', authDistrictAdmin, getTransactionHistory);

router.post("/set-commission", setCommission);

router.get("/get-User/:districtAdminId", getUserByDistrictAdmin);


export default router;
