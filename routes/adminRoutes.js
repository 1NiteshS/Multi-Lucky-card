// routes/adminRoutes.js
import express from "express";
import {
  create,
  login,
  verifyOTP,
  forgotPassword,
  resetPassword,
  getAllAdmins,
  getAdminProfile,
  getCurrentGame,
  updatePassword,
  postAllAdminWinnings,
  getAdminWinnings,
  getAdminGameTotalInfo,
  logout,
  // transferMoney,
  setCommission,
  getSubAdminByAdmin,
  dashLogin,
  resetSubAdminLogin,
  transferMoney,
  getTransactionHistory,
  getAdminWinningAmount,
  getTicketByID,
} from "../controllers/adminController.js";
import { authAdmin, authSuperAdmin } from "../middleware/auth.js";
import {
  getAdminGameResultsForAdmin,
  getTotalWinnings,
} from "../controllers/cardController.js";
import { searchAll } from "../controllers/searchController.js";
import { resetSubPassword, } from "../controllers/subAdminController.js"

const router = express.Router();

router.post("/create", authSuperAdmin, create);
// New
router.post("/login", login);
// New
router.post("/logout",authAdmin, logout);
router.post("/verify-otp", verifyOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/all-admins", getAllAdmins);
router.get("/profile/:userId/:type",authAdmin, getAdminProfile);
router.get("/current-game", getCurrentGame);
router.post("/update-password", updatePassword);
router.post("/postAllAdminWinnings/:adminId", postAllAdminWinnings);
router.get("/winnings/:adminId", authAdmin, getAdminWinnings);

// New
router.get("/admin-game-results/:userId/:type", authAdmin,getAdminGameResultsForAdmin);

router.get("/search-result", searchAll);

// Get total winnings for an admin
router.get("/total-winnings/:adminId", authAdmin, getTotalWinnings);

router.get("/game-total-info/:adminId", getAdminGameTotalInfo);

// New
router.post('/transfer-money', transferMoney);
// New
router.get('/transactions', authAdmin, getTransactionHistory);
// New
router.post("/set-commission", setCommission);
// New
router.get("/subadmins/:adminId", getSubAdminByAdmin);
// New
router.post('/dashLogin', dashLogin)
// New
router.post('/subadmin/reset-login/:subAdminId', resetSubAdminLogin);
// New
router.post('/subadmin/reset-password/:subAdminId', resetSubPassword);
// New
router.get('/admin-winnings', authAdmin, getAdminWinningAmount);
//New
router.post('/get-ticket', getTicketByID);

export default router;