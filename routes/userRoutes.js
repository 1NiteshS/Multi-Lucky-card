import express from "express";
import {authUser, authDistrictAdmin } from "../middleware/auth.js";
import {
    create,
    login,
    logout,
    getUserGameTotalInfo,
    getUserProfile,
    getTicketByID,
} from "../controllers/userController.js";
import { 
    getTotalWinnings, 
    getTotalWinningsOne, 
    getTotalWinningsThree, 
    getTotalWinningsTwo, 
    getUserResultsForUser,
    getUserResultsForAdminOne,
    getUserResultsForAdminThree,
    getUserResultsForAdminTwo
} from "../controllers/cardController.js";

const router = express.Router();

router.post("/create", authDistrictAdmin, create);
router.post("/login", login);
router.post("/logout", authUser, logout);

router.get("/game-total-info/:userId", getUserGameTotalInfo);

router.get("/profile/:userId",authUser, getUserProfile);

router.get("/total-winnings/:userId", authUser, getTotalWinnings);
router.get("/total-winnings-one/:userId", authUser, getTotalWinningsOne);
router.get("/total-winnings-two/:userId", authUser, getTotalWinningsTwo);
router.get("/total-winnings-three/:userId", authUser, getTotalWinningsThree);

router.get("/admin-game-results/:userId", authUser, getUserResultsForUser);
router.get("/admin-game-results-one/:userId", authUser, getUserResultsForAdminOne);
router.get("/admin-game-results-two/:userId", authUser, getUserResultsForAdminTwo);
router.get("/admin-game-results-three/:userId", authUser, getUserResultsForAdminThree);

router.post('/get-ticket', getTicketByID);

export default router;