import express from "express";
import {
  calculateAmounts,
  claimWinnings,
  getAdminGameResult,
  // getAdminGameResults,
  getAdminResults,
  getAllCards,
  // getAllRecentWinningCards,
  getAllSelectedCards,
  getCurrentGame,
  getLatestSelectedCards,
  placeBet,
  postCardNumber,
  processAllSelectedCards,
  placeAutomatedBet,
  getAdminLatestBets,
  deleteBetByTicketId,
  calculateAmountsOne,
  calculateAmountsTwo,
  calculateAmountsThree,
  placeBetOne,
  placeBetTwo,
  placeBetThree,
  getAllCardsOne,
  getAllCardsTwo,
  getAllCardsThree,
  getAdminLatestBetsOne,
  getAdminLatestBetsTwo,
  getAdminLatestBetsThree,
  deleteBetByTicketIdOne,
  deleteBetByTicketIdThree,
  deleteBetByTicketIdTwo,
  getCurrentGameOne,
  getCurrentGameTwo,
  getCurrentGameThree,
  getAllSelectedCardsOne,
  getAllSelectedCardsTwo,
  getAllSelectedCardsThree,
  getAdminGameResultOne,
  getAdminGameResultTwo,
  getAdminGameResultThree,
  getAdminResultsOne,
  getAdminResultsTwo,
  getAdminResultsThree,
  claimWinningsOne,
  claimWinningsTwo,
  claimWinningsThree,
  getLatestSelectedCardsOne,
  getLatestSelectedCardsTwo,
  getLatestSelectedCardsThree,
  claimAllWinningsOne,
  claimAllWinningsThree,
  claimAllWinningsTwo,
  claimAllWinnings,
  getGameDetails,
  calculateCardWin,
} from "../controllers/cardController.js";
import { authAdmin, authSubAdmin, authUser } from "../middleware/auth.js";
//New
import  PercentageMode  from "../models/PercentageMode.js"

const router = express.Router();

// Start the timer
// router.post('/start-timer', startTimer);

// Route to calculate total, lowest, and perform operations
router.get("/calculate", calculateAmounts);

// Route to place a bet
router.post("/bet", authAdmin, placeBet);

// New
// Route for SubAdmin to place a bet
router.post('/bet/subadmin/:adminId', authSubAdmin, placeBet);

// In your routes file
router.get('/getBets/:userId/:type', getAdminLatestBets);

// DELETE /api/bets/:ticketId
router.delete('/deleteBets/:ticketId/:type', deleteBetByTicketId);

router.post("/betBot", placeAutomatedBet);

// Route to get all cards
router.get("/all-cards", getAllCards);

// Route to post card number
router.post("/card-number", postCardNumber);

// Route to get current game
router.get("/current-game", getCurrentGame);

router.get("/selected-cards", getAllSelectedCards);

// router.get('/admin-game-results/:gameId', getAdminGameResults);

router.get("/admin-game", getAdminGameResult);

router.get("/admin-results/:userId/:type", getAdminResults);

router.post("/claim", claimWinnings);

router.post("/save-selected-cards", processAllSelectedCards);

// router.get("/recent-winning-cards", getAllRecentWinningCards);

router.get("/recent-winning-cards", getLatestSelectedCards);


// New
// Get current percentage mode
router.get('/getpercentage-mode', async (req, res) => {
  try {
    let mode = await PercentageMode.findOne();
    if (!mode) {
      mode = await PercentageMode.create({
        mode: 'automatic'
      });
    }
    res.json(mode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// New
// Update percentage mode
router.put('/percentage-mode', async (req, res) => {
  try {
    const { mode } = req.body;
    let percentageMode = await PercentageMode.findOne();
    
    if (!percentageMode) {
      percentageMode = new PercentageMode();
    }
    
    if (mode) percentageMode.mode = mode;
    percentageMode.updatedAt = new Date();
    
    await percentageMode.save();
    res.json(percentageMode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Latest 
router.get("/calculate-one", calculateAmountsOne);
router.get("/calculate-two", calculateAmountsTwo);
router.get("/calculate-three", calculateAmountsThree);

router.post("/bet-one", authUser, placeBetOne);
router.post("/bet-two", authUser, placeBetTwo);
router.post("/bet-three", authUser, placeBetThree);

router.get("/all-cards-one", getAllCardsOne);
router.get("/all-cards-two", getAllCardsTwo);
router.get("/all-cards-three", getAllCardsThree);

router.get('/getBetsOne/:userId', getAdminLatestBetsOne);
router.get('/getBetsTwo/:userId', getAdminLatestBetsTwo);
router.get('/getBetsThree/:userId', getAdminLatestBetsThree);

router.delete('/deleteBetsOne/:ticketId', deleteBetByTicketIdOne);
router.delete('/deleteBetsTwo/:ticketId', deleteBetByTicketIdTwo);
router.delete('/deleteBetsThree/:ticketId', deleteBetByTicketIdThree);

router.get("/current-game-one", getCurrentGameOne);
router.get("/current-game-two", getCurrentGameTwo);
router.get("/current-game-three", getCurrentGameThree);

router.get("/selected-cards-one", getAllSelectedCardsOne);
router.get("/selected-cards-two", getAllSelectedCardsTwo);
router.get("/selected-cards-three", getAllSelectedCardsThree);

router.get("/admin-game-one", getAdminGameResultOne);
router.get("/admin-game-two", getAdminGameResultTwo);
router.get("/admin-game-three", getAdminGameResultThree);

router.get("/admin-results-one/:userId/:type", getAdminResultsOne);
router.get("/admin-results-two/:userId/:type", getAdminResultsTwo);
router.get("/admin-results-three/:userId/:type", getAdminResultsThree);

router.post("/claim-one", claimWinningsOne);
router.post("/claim-two", claimWinningsTwo);
router.post("/claim-three", claimWinningsThree);

router.get("/recent-winning-cards-one", getLatestSelectedCardsOne);
router.get("/recent-winning-cards-two", getLatestSelectedCardsTwo);
router.get("/recent-winning-cards-three", getLatestSelectedCardsThree);


// Claim all winnings for an admin
router.post("/claim-all/:adminId", claimAllWinnings);
router.post("/claim-all-one/:adminId", claimAllWinningsOne);
router.post("/claim-all-two/:adminId", claimAllWinningsTwo);
router.post("/claim-all-three/:adminId", claimAllWinningsThree);


// Route to get all game details and total amounts
router.get('/game/:gameId', getGameDetails);
// Route to calculate win for a specific card
router.post('/game/:gameId/card/win', calculateCardWin);

export default router;