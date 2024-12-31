import express from "express";
import {authUser, authDistrictAdmin } from "../middleware/auth.js";
import {
    create,
    login,
    logout,
    getUserGameTotalInfo,
} from "../controllers/userController.js";
import { 
    getAdminGameResultsForAdmin,
    getTotalWinnings, 
    getTotalWinningsOne, 
    getTotalWinningsThree, 
    getTotalWinningsTwo, 
    getUserResultsForAdmin,
    getUserResultsForAdminOne,
    getUserResultsForAdminThree,
    getUserResultsForAdminTwo
} from "../controllers/cardController.js";

const router = express.Router();

router.post("/create", authDistrictAdmin, create);
router.post("/login", login);
router.post("/logout", authUser, logout);

router.get("/game-total-info/:subAdminId", getUserGameTotalInfo);

router.get("/total-winnings/:adminId", authUser, getTotalWinnings);
router.get("/total-winnings-one/:adminId", authUser, getTotalWinningsOne);
router.get("/total-winnings-two/:adminId", authUser, getTotalWinningsTwo);
router.get("/total-winnings-three/:adminId", authUser, getTotalWinningsThree);

router.get("/admin-game-results/:userId", authUser,getUserResultsForAdmin);
router.get("/admin-game-results-one/:userId", authUser,getUserResultsForAdminOne);
router.get("/admin-game-results-two/:userId", authUser,getUserResultsForAdminTwo);
router.get("/admin-game-results-three/:userId", authUser,getUserResultsForAdminThree);

export default router;