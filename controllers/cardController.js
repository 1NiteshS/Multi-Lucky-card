import SelectedCard from "../models/selectedCardModel.js";
import SelectedCardOne from "../models/selectedCardModelOne.js";
import SelectedCardTwo from "../models/selectedCardModelTwo.js";
import SelectedCardThree from "../models/selectedCardModelThree.js";
import Game from "../models/gameModel.js";
import GameOne from "../models/gameModelOne.js";
import GameTwo from "../models/gameModelTwo.js";
import GameThree from "../models/gameModelThree.js";
import Admin from "../models/Admin.js";
import AdminGameResult from "../models/AdminGameResult.js";
import AdminGameResultOne from "../models/AdminGameResultOne.js";
import AdminGameResultTwo from "../models/AdminGameResultTwo.js";
import AdminGameResultThree from "../models/AdminGameResultThree.js";
import { 
  calculateAndStoreAdminWinnings, 
  calculateAndStoreAdminWinningsOne, 
  calculateAndStoreAdminWinningsTwo, 
  calculateAndStoreAdminWinningsThree 
} from "./adminController.js";
import AdminChoice from "../models/AdminChoice.js";
import BetPercentage from "../models/BetPercentage.js";
import RecentWinningCard from "../models/recentWinningCard.js";
import { v4 as uuidv4 } from "uuid";
// New
import SubAdmin from '../models/SubAdmin.js';
//New
import  PercentageMode  from "../models/PercentageMode.js"

import User from "../models/User.js";

export const searchTickets = async (searchTerm) => {
  try {
    const searchRegex = { $regex: new RegExp(`^${searchTerm}$`, "i") };

    const result = await AdminGameResult.findOne({
      $or: [
        { "winners.ticketsID": searchRegex },
        { "losers.ticketsID": searchRegex },
      ],
    });

    if (!result) {
      return null;
    }
    const matchedWinner = result.winners.filter(
      (winner) => winner.ticketsID === searchTerm
    );
    const matchedLoser = result.losers.filter(
      (loser) => loser.ticketsID === searchTerm
    );

    const matchedTicket = matchedWinner || matchedLoser;

    if (matchedTicket) {
      return {
        ...matchedTicket,
      };
    }

    return null;
  } catch (error) {
    throw error;
  }
};

async function getPercentageFromDatabase() {
  const betPercentage = await BetPercentage.findOne();
  return betPercentage ? betPercentage.percentage : 85;
}

async function processBetsWithDynamicPercentage(bets) {
  try {
    const betPercentage = await getPercentageFromDatabase();
    return betPercentage;
  } catch (error) {
    console.error("Error processing bets:", error);
    throw error;
  }
}

const cardNumbers = {
  A001: "Jheart",
  A002: "Jspade",
  A003: "Jdiamond",
  A004: "Jclub",
  A005: "Qheart",
  A006: "Qspade",
  A007: "Qdiamond",
  A008: "Qclub",
  A009: "Kheart",
  A010: "Kspade",
  A011: "Kdiamond",
  A012: "Kclub",
};

const cardNumbers1 = {
  A001: "Jheart",
  A002: "Jspade",
  A003: "Jdiamond",
  A004: "Jclub",
  A005: "Qheart",
  A006: "Qspade",
  A007: "Qdiamond",
  A008: "Qclub",
  A009: "Kheart",
  A010: "Kspade",
  A011: "Kdiamond",
  A012: "Kclub",
  A013: "AOfHeart",
  A014: "AOfSpade",
  A015: "AOfDiamond",
  A016: "AOfClub",
};

const cardNumbers2 = {
  A001: "0",
  A002: "1",
  A003: "2",
  A004: "3",
  A005: "4",
  A006: "5",
  A007: "6",
  A008: "7",
  A009: "8",
  A010: "9",
};

const cardNumbers3 = {
  A001: "0",
  A002: "1",
  A003: "2",
  A004: "3",
  A005: "4",
  A006: "5",
  A007: "6",
  A008: "7",
  A009: "8",
  A010: "9",
};



// New 
// Alternative version using object with weighted probabilities
const processBetsWithDynamicPercentageWeighted = () => {
  const percentageConfig = {
    50: 40,  // 40% chance
    70: 30,  // 30% chance
    80: 15,  // 15% chance
    90: 10,  // 10% chance
    120: 5    // 5% chance
  };
  
  // Convert percentageConfig to array for weighted random selection
  const entries = Object.entries(percentageConfig);
  const weights = entries.map(([_, weight]) => weight);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  let random = Math.random() * totalWeight;
  
  for (const [percentage, weight] of entries) {
    random -= weight;
    if (random <= 0) {
      return Number(percentage);
    }
  }
  
  // Fallback to first percentage if something goes wrong
  return Number(entries[0][0]);
};

// Get all cards on frontend
export const getAllCards = async (req, res) => {
  try {
    const allCards = Object.entries(cardNumbers).map(([cardNo, cardName]) => ({
      cardNo: cardNo,
      cardName,
    }));

    res.status(200).json({
      success: true,
      data: allCards,
    });
  } catch (error) {
    console.error("Error fetching all cards:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching all cards",
      error: error.message,
    });
  }
};

// Post card number one by one
export const postCardNumber = async (req, res) => {
  try {
    const { cardNo } = req.body;

    if (cardNo === undefined || cardNo === null) {
      return res.status(400).json({
        success: false,
        message: "Card number is required",
      });
    }

    const cardName = cardNumbers[cardNo];

    if (!cardName) {
      return res.status(400).json({
        success: false,
        message: "Invalid card number",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        cardNo: cardNo,
        cardName: cardName,
      },
    });
  } catch (error) {
    console.error("Error processing card number:", error);
    res.status(500).json({
      success: false,
      message: "Error processing card number",
      error: error.message,
    });
  }
};

// Function to get the current gameID
export const getCurrentGame = async (req, res) => {
  try {
    // Find the most recent game
    const currentGame = await Game.findOne().sort({ createdAt: -1 });

    if (!currentGame) {
      return { message: "No active game found" };
      // return res.status(404).json({ message: 'No active game found' });
    }

    res.status(200).json({
      success: true,
      data: {
        gameId: currentGame.GameId,
        // createdAt: currentGame.createdAt
      },
    });

    return {
      success: true,
      data: {
        gameId: currentGame.GameId,
        // createdAt: currentGame.createdAt
      },
    };
    
  } catch (error) {
    console.error("Error fetching current game:", error);
    return {
      success: false,
      message: "Error fetching current game",
      error: error.message,
    };
  }
};

// This function will calculate amounts based on remaining time
export const calculateAmounts = async () => {
  try {
    const latestGame = await Game.findOne().sort({ createdAt: -1 }).lean();

    if (!latestGame) {
      return { message: "No games found" };
    }

    const choiceDoc = await AdminChoice.findOne();
    const chosenAlgorithm = choiceDoc ? choiceDoc.algorithm : "default";
    let processedData;

    switch (chosenAlgorithm) {
      case "minAmount":
        processedData = await processGameBetsWithMinAmount(latestGame.Bets);
        break;
      case "zeroAndRandom":
        processedData = await processGameBetsWithZeroRandomAndMin(
          latestGame.Bets
        );
        break;
      default:
        processedData = await processGameBets(latestGame.Bets);
    }

    let { multipliedArray, percAmount, type } = processedData;
    const selectedCard = await selectRandomAmount(
      multipliedArray,
      percAmount,
      type
    );

    if (!selectedCard || !selectedCard.randomEntry) {
      throw new Error("No valid card selected");
    }

    const { randomEntry } = selectedCard;

    // Convert the index to the corresponding card number
    const cardNumbers = [
      "A001",
      "A002",
      "A003",
      "A004",
      "A005",
      "A006",
      "A007",
      "A008",
      "A009",
      "A010",
      "A011",
      "A012",
    ];
    const selectedCardNo = cardNumbers[randomEntry.index];

    if (!selectedCardNo) {
      throw new Error("Invalid card index");
    }

    const WinningCard = {
      cardId: selectedCardNo,
      multiplier: parseInt(randomEntry.key),
      amount: randomEntry.value,
    };

    await saveSelectedCard(WinningCard, latestGame.GameId);
    // console.log("latestGame", latestGame);
    // console.log("WinningCard", WinningCard);
    const adminResults = await calculateAdminResults(latestGame, WinningCard);
    await getAdminGameResults(latestGame.GameId, adminResults);
    // await processAllSelectedCards();
    await calculateAndStoreAdminWinnings(latestGame.GameId);

    // console.log("adminResults", adminResults);

    return {
      message: "Amounts calculated successfully",
      WinningCard,
      adminResults,
    };
  } catch (err) {
    console.error(`Error during calculation: ${err}`);
    return { message: "Error calculating amounts", error: err.message };
  }
};

export const chooseAlgorithm = async (req, res) => {
  try {
    const { algorithm } = req.body;
    if (!["default", "minAmount", "zeroAndRandom"].includes(algorithm)) {
      return res.status(400).json({ message: "Invalid algorithm choice" });
    }

    // Try to find an existing AdminChoice document
    let adminChoice = await AdminChoice.findOne();

    if (!adminChoice) {
      // If no document exists, create a new one
      adminChoice = new AdminChoice({ algorithm });
      await adminChoice.save();
      return res
        .status(201)
        .json({ message: "Algorithm choice created successfully" });
    } else {
      // If a document exists, update it
      adminChoice.algorithm = algorithm;
      await adminChoice.save();
      return res.json({ message: "Algorithm choice updated successfully" });
    }
  } catch (error) {
    console.error("Error in chooseAlgorithm:", error);
    return res.status(500).json({
      message: "Error updating algorithm choice",
      error: error.message,
    });
  }
};

export const getCurrentAlgorithm = async (req, res) => {
  try {
    const choice = await AdminChoice.findOne();
    res.json({ currentAlgorithm: choice ? choice.algorithm : "default" });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching current algorithm",
      error: error.message,
    });
  }
};

// Function to process the bets of each game
const processGameBets = async (bets) => {
  // Check if bets array is empty
  if (!bets || bets.length === 0) {
    console.log("No bets placed. Skipping bet processing...");
    return {}; // Returning an empty object or any default value to avoid errors
  }

  let totalAmount = 0;
  const amounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (const bet of bets) {
    // Access cards in the bet
    bet.card.forEach((card) => {
      if (card.cardNo == "A001") {
        totalAmount += card.Amount;
        amounts[0] += card.Amount;
      } else if (card.cardNo == "A002") {
        totalAmount += card.Amount;
        amounts[1] += card.Amount;
      } else if (card.cardNo == "A003") {
        totalAmount += card.Amount;
        amounts[2] += card.Amount;
      } else if (card.cardNo == "A004") {
        totalAmount += card.Amount;
        amounts[3] += card.Amount;
      } else if (card.cardNo == "A005") {
        totalAmount += card.Amount;
        amounts[4] += card.Amount;
      } else if (card.cardNo == "A006") {
        totalAmount += card.Amount;
        amounts[5] += card.Amount;
      } else if (card.cardNo == "A007") {
        totalAmount += card.Amount;
        amounts[6] += card.Amount;
      } else if (card.cardNo == "A008") {
        totalAmount += card.Amount;
        amounts[7] += card.Amount;
      } else if (card.cardNo == "A009") {
        totalAmount += card.Amount;
        amounts[8] += card.Amount;
      } else if (card.cardNo == "A010") {
        totalAmount += card.Amount;
        amounts[9] += card.Amount;
      } else if (card.cardNo == "A011") {
        totalAmount += card.Amount;
        amounts[10] += card.Amount;
      } else if (card.cardNo == "A012") {
        totalAmount += card.Amount;
        amounts[11] += card.Amount;
      }
    });
  }

  let multipliedArray = {
    1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    10: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };
  // Get current percentage mode from database
  // const percentageMode = await PercentageMode.findOne();
  // let perc;

  let perc = await processBetsWithDynamicPercentage();

  // if (!percentageMode || percentageMode.mode === 'automatic') {
  //   perc = await processBetsWithDynamicPercentageWeighted();
  // } else {
  //   perc = await processBetsWithDynamicPercentage();
  // } 

  // const percAmount = totalAmount * 0.85;
  const percAmount = totalAmount * (perc / 100);

  for (let i = 0; i < amounts.length; i++) {
    if (amounts[i] * 10 !== 0) {
      multipliedArray["1"][i] = amounts[i] * 10;
    }
    if (amounts[i] * 20 !== 0) {
      multipliedArray["2"][i] = amounts[i] * 20;
    }
    if (amounts[i] * 30 !== 0) {
      multipliedArray["3"][i] = amounts[i] * 30;
    }
    if (amounts[i] * 40 !== 0) {
      multipliedArray["4"][i] = amounts[i] * 40;
    }
    if (amounts[i] * 50 !== 0) {
      multipliedArray["5"][i] = amounts[i] * 50;
    }
    if (amounts[i] * 60 !== 0) {
      multipliedArray["6"][i] = amounts[i] * 60;
    }
    if (amounts[i] * 70 !== 0) {
      multipliedArray["7"][i] = amounts[i] * 70;
    }
    if (amounts[i] * 80 !== 0) {
      multipliedArray["8"][i] = amounts[i] * 80;
    }
    if (amounts[i] * 60 !== 0) {
      multipliedArray["9"][i] = amounts[i] * 90;
    }
    if (amounts[i] * 100 !== 0) {
      multipliedArray["10"][i] = amounts[i] * 100;
    }
  }

  let type = "processGameBets";

  return {
    multipliedArray,
    percAmount,
    type,
  };
};

// Function to process the bets of each game
const processGameBetsWithMinAmount = async (bets) => {
  // Check if bets array is empty
  if (!bets || bets.length === 0) {
    console.log("No bets placed. Skipping bet processing...");
    return {}; // Returning an empty object or any default value to avoid errors
  }

  let totalAmount = 0;
  const amounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (const bet of bets) {
    // Access cards in the bet
    bet.card.forEach((card) => {
      if (card.cardNo == "A001") {
        totalAmount += card.Amount;
        amounts[0] += card.Amount;
      } else if (card.cardNo == "A002") {
        totalAmount += card.Amount;
        amounts[1] += card.Amount;
      } else if (card.cardNo == "A003") {
        totalAmount += card.Amount;
        amounts[2] += card.Amount;
      } else if (card.cardNo == "A004") {
        totalAmount += card.Amount;
        amounts[3] += card.Amount;
      } else if (card.cardNo == "A005") {
        totalAmount += card.Amount;
        amounts[4] += card.Amount;
      } else if (card.cardNo == "A006") {
        totalAmount += card.Amount;
        amounts[5] += card.Amount;
      } else if (card.cardNo == "A007") {
        totalAmount += card.Amount;
        amounts[6] += card.Amount;
      } else if (card.cardNo == "A008") {
        totalAmount += card.Amount;
        amounts[7] += card.Amount;
      } else if (card.cardNo == "A009") {
        totalAmount += card.Amount;
        amounts[8] += card.Amount;
      } else if (card.cardNo == "A010") {
        totalAmount += card.Amount;
        amounts[9] += card.Amount;
      } else if (card.cardNo == "A011") {
        totalAmount += card.Amount;
        amounts[10] += card.Amount;
      } else if (card.cardNo == "A012") {
        totalAmount += card.Amount;
        amounts[11] += card.Amount;
      }
    });
  }

  let multipliedArray = {
    1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    10: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };

  let perc = await processBetsWithDynamicPercentage();

  // const percAmount = totalAmount * 0.85;
  const percAmount = totalAmount * (perc / 100);

  for (let i = 0; i < amounts.length; i++) {
    if (amounts[i] * 10 !== 0) {
      multipliedArray["1"][i] = amounts[i] * 10;
    }
    if (amounts[i] * 20 !== 0) {
      multipliedArray["2"][i] = amounts[i] * 20;
    }
    if (amounts[i] * 30 !== 0) {
      multipliedArray["3"][i] = amounts[i] * 30;
    }
    if (amounts[i] * 40 !== 0) {
      multipliedArray["4"][i] = amounts[i] * 40;
    }
    if (amounts[i] * 50 !== 0) {
      multipliedArray["5"][i] = amounts[i] * 50;
    }
    if (amounts[i] * 60 !== 0) {
      multipliedArray["6"][i] = amounts[i] * 60;
    }
    if (amounts[i] * 70 !== 0) {
      multipliedArray["7"][i] = amounts[i] * 70;
    }
    if (amounts[i] * 80 !== 0) {
      multipliedArray["8"][i] = amounts[i] * 80;
    }
    if (amounts[i] * 60 !== 0) {
      multipliedArray["9"][i] = amounts[i] * 90;
    }
    if (amounts[i] * 100 !== 0) {
      multipliedArray["10"][i] = amounts[i] * 100;
    }
  }

  let type = "processGameBetsWithMinAmount";

  return {
    multipliedArray,
    percAmount,
    type,
  };
};

const processGameBetsWithZeroRandomAndMin = async (bets) => {
  // Check if bets array is empty
  if (!bets || bets.length === 0) {
    console.log("No bets placed. Skipping bet processing...");
    return {}; // Returning an empty object or any default value to avoid errors
  }

  let totalAmount = 0;
  const amounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (const bet of bets) {
    // Access cards in the bet
    bet.card.forEach((card) => {
      if (card.cardNo == "A001") {
        totalAmount += card.Amount;
        amounts[0] += card.Amount;
      } else if (card.cardNo == "A002") {
        totalAmount += card.Amount;
        amounts[1] += card.Amount;
      } else if (card.cardNo == "A003") {
        totalAmount += card.Amount;
        amounts[2] += card.Amount;
      } else if (card.cardNo == "A004") {
        totalAmount += card.Amount;
        amounts[3] += card.Amount;
      } else if (card.cardNo == "A005") {
        totalAmount += card.Amount;
        amounts[4] += card.Amount;
      } else if (card.cardNo == "A006") {
        totalAmount += card.Amount;
        amounts[5] += card.Amount;
      } else if (card.cardNo == "A007") {
        totalAmount += card.Amount;
        amounts[6] += card.Amount;
      } else if (card.cardNo == "A008") {
        totalAmount += card.Amount;
        amounts[7] += card.Amount;
      } else if (card.cardNo == "A009") {
        totalAmount += card.Amount;
        amounts[8] += card.Amount;
      } else if (card.cardNo == "A010") {
        totalAmount += card.Amount;
        amounts[9] += card.Amount;
      } else if (card.cardNo == "A011") {
        totalAmount += card.Amount;
        amounts[10] += card.Amount;
      } else if (card.cardNo == "A012") {
        totalAmount += card.Amount;
        amounts[11] += card.Amount;
      }
    });
  }

  let multipliedArray = {
    1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    10: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };

  let perc = await processBetsWithDynamicPercentage();

  // const percAmount = totalAmount * 0.85;
  const percAmount = totalAmount * (perc / 100);

  for (let i = 0; i < amounts.length; i++) {
    if (amounts[i] * 10 !== 0) {
      multipliedArray["1"][i] = amounts[i] * 10;
    }
    if (amounts[i] * 20 !== 0) {
      multipliedArray["2"][i] = amounts[i] * 20;
    }
    if (amounts[i] * 30 !== 0) {
      multipliedArray["3"][i] = amounts[i] * 30;
    }
    if (amounts[i] * 40 !== 0) {
      multipliedArray["4"][i] = amounts[i] * 40;
    }
    if (amounts[i] * 50 !== 0) {
      multipliedArray["5"][i] = amounts[i] * 50;
    }
    if (amounts[i] * 60 !== 0) {
      multipliedArray["6"][i] = amounts[i] * 60;
    }
    if (amounts[i] * 70 !== 0) {
      multipliedArray["7"][i] = amounts[i] * 70;
    }
    if (amounts[i] * 80 !== 0) {
      multipliedArray["8"][i] = amounts[i] * 80;
    }
    if (amounts[i] * 60 !== 0) {
      multipliedArray["9"][i] = amounts[i] * 90;
    }
    if (amounts[i] * 100 !== 0) {
      multipliedArray["10"][i] = amounts[i] * 100;
    }
  }

  let type = "processGameBetsWithZeroRandomAndMin";

  return {
    multipliedArray,
    percAmount,
    type,
  };
};

async function selectRandomAmount(validAmounts, percAmount, type) {
  if (type === "processGameBets") {
    let allEntries = [];   

    // Collect all valid entries with their values
    for (let key in validAmounts) {
      if (Array.isArray(validAmounts[key])) {
        validAmounts[key].forEach((value, index) => {  
          if (value <= percAmount) {
            allEntries.push({ key, index, value });
          }
        });
      }
    }

    if (allEntries.length === 0) {
      let Cnum = Infinity;
      let smallestEntry = null;
    
      for (let key in validAmounts) {
        if (Array.isArray(validAmounts[key])) {
          validAmounts[key].forEach((value, index) => {
            if (value < Cnum) {
              Cnum = value;
              smallestEntry = { key, index, value }; 
            }
          });
        }
      }
    
      if (smallestEntry) {
        allEntries.push(smallestEntry); // Push the smallest entry into allEntries
      }
    }
    

    // Sort entries by value in descending order (highest to lowest)
    allEntries.sort((a, b) => b.value - a.value);

    // Get top 3 entries
    const topThreeEntries = allEntries.slice(0, 3);

    // Select random entry from top 3
    const randomEntry = topThreeEntries[Math.floor(Math.random() * topThreeEntries.length)];

    return { randomEntry };
  } else if (type === "processGameBetsWithMinAmount") {
    // Logic for always selecting the minimum amount
    let minEntry = null;

    for (let key in validAmounts) {
      if (Array.isArray(validAmounts[key])) {
        validAmounts[key].forEach((value, index) => {
          if (value !== 0 && (minEntry === null || value < minEntry.value)) {
            minEntry = { key, index, value };
          }
        });
      }
    }

    if (minEntry) {
      console.log("Selected minimum entry:", minEntry);
      return { randomEntry: minEntry };
    } else {
      console.log("No non-zero entries found. Returning null.");
      return null;
    }
  } else if (type === "processGameBetsWithZeroRandomAndMin") {
    // Logic for prioritizing zero amounts, then minimum if no zero exists
    let zeroEntries = [];
    let minEntry = null;

    for (let key in validAmounts) {
      if (Array.isArray(validAmounts[key])) {
        validAmounts[key].forEach((value, index) => {
          if (value === 0) {
            zeroEntries.push({ key, index, value });
          } else if (minEntry === null || value < minEntry.value) {
            minEntry = { key, index, value };
          }
        });
      }
    }

    let selectedEntry;

    if (zeroEntries.length > 0) {
      console.log("Zero entries found. Selecting a random zero entry.");
      selectedEntry =
        zeroEntries[Math.floor(Math.random() * zeroEntries.length)];
    } else if (minEntry) {
      console.log("No zero entries found. Selecting the minimum entry.");
      selectedEntry = minEntry;
    } else {
      console.log("No entries found. Returning null.");
      return null;
    }

    return { randomEntry: selectedEntry };
  } else {
    const entries = [
      { key: '1', index: 1, value: 0 },
      { key: '1', index: 2, value: 0 },
      { key: '1', index: 3, value: 0 },
      { key: '1', index: 4, value: 0 },
      { key: '1', index: 5, value: 0 },
      { key: '1', index: 6, value: 0 },
      { key: '1', index: 7, value: 0 },
      { key: '1', index: 8, value: 0 },
      { key: '2', index: 9, value: 0 },
      { key: '10', index: 10, value: 0 },
      { key: '1', index: 11, value: 0 },
      { key: '2', index: 2, value: 0 },
      { key: '1', index: 1, value: 0 },
      { key: '1', index: 2, value: 0 },
      { key: '3', index: 3, value: 0 },
      { key: '1', index: 4, value: 0 },
      { key: '1', index: 5, value: 0 },
      { key: '1', index: 6, value: 0 },
      { key: '1', index: 7, value: 0 },
      { key: '2', index: 8, value: 0 },
      { key: '1', index: 9, value: 0 },
      { key: '1', index: 10, value: 0 },
      { key: '1', index: 11, value: 0 },
      { key: '1', index: 2, value: 0 },
      { key: '1', index: 1, value: 0 },
      { key: '1', index: 2, value: 0 },
      { key: '1', index: 3, value: 0 },
      { key: '4', index: 4, value: 0 },
      // Add more entries as needed
    ];

    // Generate a random index
    const randomIndex = Math.floor(Math.random() * entries.length);
    let randomEntry = entries[randomIndex];

    return { randomEntry };
    // return null;
  }
}

// Function to save the selected card data
const saveSelectedCard = async (selectedAmount, gameId) => {
  console.log("selectedAmount", selectedAmount);
  
  // Check if selectedAmount is empty
  if (Object.keys(selectedAmount).length === 0) {
    console.log("selected amounts is empty.");
    return {}; // Return an empty object if validAmounts is empty
  }

  const drowTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  const selectedCardData = {
    gameId: gameId,
    cardId: selectedAmount.cardId,
    multiplier: selectedAmount.multiplier,
    amount: selectedAmount.amount,
    drowTime: drowTime,
  };

  const selectedCard = new SelectedCard(selectedCardData);
  await selectedCard.save();
};

// Controller function to fetch all selected cards
export const getAllSelectedCards = async (req, res) => {
  try {
    // Retrieve all selected cards from the database
    const selectedCards = await SelectedCard.find();

    // Send the selected cards as a response
    res.status(200).json({
      success: true,
      data: selectedCards,
    });
  } catch (error) {
    console.error("Error fetching selected cards:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching selected cards",
    });
  }
};

export const getTimer = async (req, res) => {
  try {
    const timer = await Timer.findOne({ timerId: "game-timer" });

    if (!timer) {
      return res.status(404).json({ message: "No active timer found" });
    }

    res.status(200).json({
      remainingTime: timer.remainingTime,
      isRunning: timer.isRunning,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching timer", error: err.message });
  }
};

// Function to reset the timer
export const resetTimer = async () => {
  let timer = await Timer.findOne({ timerId: "game-timer" });

  if (timer) {
    timer.remainingTime = 100; // Reset timer to 30 seconds
    await timer.save();

    // Start the timer again after resetting
    startTimer();
    socketClient.emit("timerUpdate", {
      remainingTime: timer.remainingTime,
      isRunning: true,
    });
  }
};

// New
export const placeBet = async (req, res) => {
  const { ticketsID, cards, GameId } = req.body;
  // const { adminId } = req.params; // Get adminId from URL params
  // console.log(adminId);
  
  try {
    let user = req.user;  // User details from middleware

    if (!user) {
      return res.status(404).json({ message: 'User not authenticated!' });
    }

    // Calculate the total bet amount from all the cards
    let totalAmount = 0;
    if (Array.isArray(cards)) {
      cards.forEach((card) => {
        if (card.Amount) {
          totalAmount += card.Amount; // Accumulate the amount from each card
        }
      });
    }

    // Check if user has sufficient balance
    if (user.wallet < totalAmount) {
      return res.status(400).json({ message: 'Insufficient balance in wallet!' });
    }

    // Check if there is an active game with the given GameId
    const activeGame = await Game.findOne({ GameId: GameId });
    if (!activeGame) {
      return res.status(404).json({ message: 'Game not found!' });
    }

    // Create a new bet entry (gameDetails) to be pushed into the Bets array
    const newBet = {
      adminID: user.userId,  // Identify the user by userId
      ticketsID: ticketsID,
      card: [],
      ticketTime: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }), // Indian Standard Time (IST)
    };

    // Loop through the cards array and add each card to the newBet
    if (Array.isArray(cards)) {
      cards.forEach((card) => {
        if (card.cardNo && card.Amount) {
          // Ensure cardNo and Amount are provided
          newBet.card.push({
            cardNo: card.cardNo,
            Amount: card.Amount,
          });
        }
      });
    }

    // Add the new bet to the Bets array of the game
    activeGame.Bets.push(newBet);

    // Deduct the total bet amount from user's wallet
    user.wallet -= totalAmount;

    // Save the updated game and user wallet
    await Promise.all([activeGame.save(), user.save()]);

    return res.status(200).json({
      message: "Game data successfully uploaded and bet placed successfully!",
      game: activeGame,
      updatedWalletBalance: user.wallet,
    });
  } catch (error) {
    console.error("Error uploading game data:", error);
    return res.status(500).json({ message: "Failed to upload game data.", error: error.message });
  }
};

// New
export const getAdminLatestBets = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find user based on type
    let  user = await SubAdmin.findOne({ subAdminId: userId });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: `User not found!` 
      });
    }

    // Find the latest game that contains bets from this user
    const latestGame = await Game.findOne().sort({ _id: -1 });

    if (!latestGame) {
      return res.status(404).json({ 
        success: false,
        message: "No bets found",
        userId: userId,
        userType: type
      });
    }

    // Filter bets to only include those from this user
    const userBets = latestGame.Bets.filter(bet => 
      bet.adminID === userId
    );  

    if (userBets.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No bets found for this user`,
        userId: userId,
      });
    }

    // Calculate total bet amount for this game
    const totalGameAmount = userBets.reduce((total, bet) => 
      total + bet.card.reduce((sum, card) => sum + card.Amount, 0), 0
    );

    return res.status(200).json({
      success: true,
      userId: userId,
      currentWalletBalance: user.wallet,
      gameDetails: {
        gameId: latestGame.GameId,
        gameDate: latestGame.Date,
        totalBets: userBets.length,
        totalAmount: totalGameAmount,
        bets: userBets.map(bet => ({
          ticketsID: bet.ticketsID,
          ticketTime: bet.ticketTime,
          cards: bet.card.map(card => ({
            cardNo: card.cardNo,
            amount: card.Amount
          }))
        }))
      }
    });

  } catch (error) {
    console.error(`Error fetching user's latest game bets:`, error);
    return res.status(500).json({ 
      success: false,
      message: `Failed to fetch user's latest game bet data`,
      error: error.message 
    });
  }
};

export const placeAutomatedBet = async (req, res) => {
  // const { GameId, ticketsID } = req.body;
  const adminId = "056233a7-d02a-4fe8-87df-6ccfd9983955"; // Hardcoded admin ID

  try {
    // Fetch the admin details using admin ID
    const admin = await Admin.findOne({ adminId: adminId });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found!" });
    }

    // Create a new game if none exists
    let activeGame = await Game.findOne({}, {}, { sort: { createdAt: -1 } });
    if (!activeGame) {
      activeGame = await Game.create({});
    }
    // Generate a new ticket ID
    const ticketsID = uuidv4();

    // Create a new bet entry (gameDetails) to be pushed into the Bets array
    const newBet = {
      adminID: admin.adminId,
      ticketsID: ticketsID,
      card: [],
      ticketTime: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }), // Indian Standard Time (IST)
    };

    // Loop through the card numbers and create a bet for each
    const cardNumbers = {
      A001: "Jheart",
      A002: "Jspade",
      A003: "Jdiamond",
      A004: "Jclub",
      A005: "Qheart",
      A006: "Qspade",
      A007: "Qdiamond",
      A008: "Qclub",
      A009: "Kheart",
      A010: "Kspade",
      A011: "Kdiamond",
      A012: "Kclub",
    };

    const betAmount = 5;
    let totalAmount = 0;

    for (const [cardNo, cardName] of Object.entries(cardNumbers)) {
      newBet.card.push({
        cardNo,
        Amount: betAmount,
      });
      totalAmount += betAmount;
    }

    // Check if admin has sufficient balance
    if (admin.wallet < totalAmount) {
      return res
        .status(400)
        .json({ message: "Insufficient balance in wallet!" });
    }

    // Add the new bet to the Bets array of the game
    activeGame.Bets.push(newBet);

    // Deduct the total bet amount from admin's wallet
    admin.wallet -= totalAmount;

    // Save the updated game and admin wallet
    await Promise.all([activeGame.save(), admin.save()]);

    return {
      message: "Automated bet placed successfully!",
      game: activeGame,
      updatedWalletBalance: admin.wallet,
    };
  } catch (error) {
    console.error("Error placing automated bet:", error);
    return res.status(500).json({
      message: "Failed to place automated bet.",
      error: error.message,
    });
  }
};

// New
export const deleteBetByTicketId = async (req, res) => {
  const { ticketId } = req.params;

  try {
    // Step 1: Find the game and bet containing the ticket
    const game = await Game.findOne({ "Bets.ticketsID": ticketId });
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: `Bet does not exist for Ticket ID ${ticketId}`
      });
    }

    // Step 2: Find the bet with the given ticketId
    const bet = game.Bets.find(bet => bet.ticketsID === ticketId);
    if (!bet) {
      return res.status(404).json({
        success: false,
        message: `Bet not found for Ticket ID ${ticketId}`
      });
    }

    // Extract adminId and type from the bet
    const { adminID } = bet;
    const totalAmount = bet.card.reduce((sum, card) => sum + card.Amount, 0);

    // Step 3: Delete the bet from the game
    const result = await Game.findOneAndUpdate(
      { "Bets.ticketsID": ticketId },
      { $pull: { Bets: { ticketsID: ticketId } } },
      { new: true }
    );

    let updatedWallet;

    // Step 4: Update wallet based on type
    // Update SubAdmin's wallet
    const updatedUser = await User.findOneAndUpdate(
      { userId: adminID },
      { $inc: { wallet: totalAmount } },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    updatedWallet = updatedUser.wallet;

    // Return the updated wallet amount in the response
    return res.status(200).json({
      success: true,
      message: `Delete successful for Ticket ID ${ticketId}`,
      deletedFromGame: result.GameId,
      updatedAdminWallet: updatedWallet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in deleting Bet",
      error: error.message
    });
  }
};

const calculateAdminResults = async (game, winningCard) => {
  const winnerMultiplier = {
    1: 10,
    2: 20,
    3: 30,
    4: 40,
    5: 50,
    6: 60,
    7: 70,
    8: 80,
    9: 90,
    10: 100,
  };
  const adminResults = {
    winners: [],
    losers: [],
  };
  for (const bet of game.Bets) {

    const admin = await User.findOne({ userId: bet.adminID });
    
    if (!admin) continue;
    let adminResult = {
      adminId: bet.adminID,
      gameId: game.GameId,
      betAmount: 0,
      winAmount: 0,
      winningCardAmount: 0,
      ticketsID: bet.ticketsID,
      ticketTime: bet.ticketTime,
      status: "lose", // Default status
    };
    for (const card of bet.card) {
      adminResult.betAmount += card.Amount;
      if (card.cardNo === winningCard.cardId) {
        adminResult.winningCardAmount = card.Amount;
        const multiplier = winnerMultiplier[winningCard.multiplier] || 1;
        adminResult.winAmount = card.Amount * multiplier;
        adminResult.ticketsID = bet.ticketsID;
        (adminResult.ticketTime = bet.ticketTime), (adminResult.status = "win"); // Update status if it's a winning card
      }
    }
    if (adminResult.status === "win") {
      adminResults.winners.push(adminResult);
    } else {
      adminResults.losers.push(adminResult);
    }
  }

  return adminResults;
};

// New API endpoint for admin game results
export const getAdminGameResults = async (gameId, adminResults) => {
  try {
    const game = await Game.findOne({ GameId: gameId }).lean();
    if (!game) {
      return { message: "Game not found" };
    }
    const selectedCard = await SelectedCard.findOne({ gameId: gameId }).lean();
    if (!selectedCard) {
      return { message: "Selected card not found for this game" };
    }

    // Save results to MongoDB
    const newAdminGameResult = new AdminGameResult({
      gameId: game.GameId,
      winningCard: {
        cardId: selectedCard.cardId,
        multiplier: selectedCard.multiplier,
        amount: selectedCard.amount,
        Drowtime: selectedCard.drowTime,
      },
      winners: adminResults.winners,
      losers: adminResults.losers,
    });
    await newAdminGameResult.save();
    return {
      success: true,
      message: "Admin game results calculated and saved successfully",
      data: {
        gameId: game.GameId,
        winningCard: selectedCard,
        adminResults: adminResults,
      },
    };
  } catch (error) {
    console.error("Error processing and saving admin game results:", error);
    return {
      success: false,
      message: "Error processing and saving admin game results",
      error: error.message,
    };
  }
};

export const getAdminGameResult = async (req, res) => {
  try {
    const result = await AdminGameResult.findOne();
    // console.log(result);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error retrieving admin game results:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving admin game results",
      error: error.message,
    });
  }
};

// New
export const getAdminResults = async (req, res) => {
  try {
    const { userId, type } = req.params;

    // Find user based on type
    let user;
    if (type === 'subAdmin') {
      user = await SubAdmin.findOne({ subAdminId: userId });
    } else {
      user = await Admin.findOne({ adminId: userId });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `${type === 'subAdmin' ? 'SubAdmin' : 'Admin'} not found`,
      });
    }

    // Create query condition based on user type
    const queryCondition = type === 'subAdmin' 
      ? { $or: [{ "winners.subAdminId": userId }, { "losers.subAdminId": userId }] }
      : { $or: [{ "winners.adminId": userId }, { "losers.adminId": userId }] };

    // Find all game results for this user
    const gameResults = await AdminGameResult.find(queryCondition)
      .sort({ createdAt: -1 }); // Sort by most recent games first

    // Process the results to only include this user's data
    const processedResults = gameResults.map((gameResult) => {
      // Find user data in winners or losers based on type
      const userData = type === 'subAdmin'
        ? gameResult.winners.find((winner) => winner.subAdminId === userId) ||
          gameResult.losers.find((loser) => loser.subAdminId === userId)
        : gameResult.winners.find((winner) => winner.adminId === userId) ||
          gameResult.losers.find((loser) => loser.adminId === userId);

      // Determine if user is in winners array
      const isWinner = type === 'subAdmin'
        ? gameResult.winners.some(winner => winner.subAdminId === userId)
        : gameResult.winners.some(winner => winner.adminId === userId);

      return {
        gameId: gameResult.gameId,
        userResult: {
          userData: userData._doc,
          status: isWinner ? "win" : "lose"
        },
        playedAt: gameResult.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      message: `${type === 'subAdmin' ? 'SubAdmin' : 'Admin'} game results retrieved successfully`,
      data: {
        userId: userId,
        userType: type,
        gameResults: processedResults,
      },
    });

  } catch (error) {
    console.error(`Error retrieving ${req.params.type} game results:`, error);
    res.status(500).json({
      success: false,
      message: `Error retrieving ${req.params.type} game results`,
      error: error.message,
    });
  }
};

// New
export const claimWinnings = async (req, res) => {
  try {
    const { userId, gameId, ticketsID } = req.body;

    let actualAdminId;


    let user = await User.findOne({ userId });
    if(!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    actualAdminId = userId;

    const gameResult = await AdminGameResult.findOne({ gameId });
    if(!gameResult) {
      return res.status(404).json({
        success: false,
        message: "Game result not found",
      });
    }

     // Check if the user is a winner in this game and has the specified ticket
    const winner = gameResult.winners.find(
      (w) => w.adminId === actualAdminId && w.ticketsID === ticketsID
    );

    if (!winner) {
      return res.status(400).json({
        success: false,
        message: `User is not a winner with the specified ticket in this game`,
      });
    }

    // Check if the ticket has already been claimed
    if (winner.status === "claimed") {
      return res.status(400).json({
        success: false,
        message: "This ticket has already been claimed",
      });
    }

    // Update user's wallet
    user.wallet += winner.winAmount;
    await user.save();

    // Mark the ticket as claimed
    winner.status = "claimed";
    await gameResult.save();

    res.status(200).json({
      success: true,
      message: "Winnings claimed successfully",
      data: {
        adminID: user.userId,
        gameId: gameResult.gameId,
        ticketId: winner.ticketId,
        claimedAmount: winner.winAmount,
        newWalletBalance: user.wallet,
        userType: userType
      },
    });
  } catch (error) {
    console.error("Error claiming winnings:", error);
    res.status(500).json({
      success: false,
      message: "Error claiming winnings",
      error: error.message,
    });
  }
};

export const processAllSelectedCards = async (req, res) => {
  try {
    // Fetch all unique gameIds from SelectedCard collection
    const uniqueGameIds = await SelectedCard.distinct("gameId");

    if (uniqueGameIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No games found with selected cards.",
      });
    }
    const processedGames = await Promise.all(
      uniqueGameIds.map(async (gameId) => {
        // Fetch all selected cards for this game
        const selectedCards = await SelectedCard.find({ gameId });

        // Process each selected card
        const processedCards = await Promise.all(
          selectedCards.map(async (card) => {
            const newCard = new SelectedCard({
              gameId: card.gameId,
              cardId: card.cardId,
              multiplier: card.multiplier,
              amount: card.amount,
            });
            return newCard;
          })
        );

        // Calculate and store admin winnings
        await calculateAndStoreAdminWinnings(gameId);
        // Store recent winning card and keep only latest 10
        const winningCard =
          processedCards[Math.floor(Math.random() * processedCards.length)];
        // await saveLatest10WinningCards(gameId, winningCard);
        // Fetch the saved winning card to return in the response
        const recentWinningCard = await RecentWinningCard.findOne({
          gameId,
        }).sort({ createdAt: -1 });

        return {
          gameId,
          winningCard: recentWinningCard,
        };
      })
    );
    // Send the response with all processed games and winning cards
  } catch (error) {
    console.error("Error in processAllSelectedCards:", error);
    res.status(500).json({
      success: false,
      message: "Error processing request",
      error: error.message,
    });
  }
};

// Fetch all recent winning cards recent created limit 5
export const getAllRecentWinningCards = async (req, res) => {
  try {
    const recentWinningCards = await RecentWinningCard.find()
      .sort({ createdAt: -1 })
      .limit(5);
    console.log(recentWinningCards, "recentWinningCards");
    if (recentWinningCards.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No recent winning cards found.",
      });
    }

    res.status(200).json({
      success: true,
      data: recentWinningCards,
    });
  } catch (error) {
    console.error("Error fetching recent winning cards:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent winning cards",
      error: error.message,
    });
  }
};

// New
export const getAdminGameResultsForAdmin = async (req, res) => {
  try {
    const { userId, type } = req.params;
    const gameId = req.params.gameId || req.query.gameId;
    const { from, to } = req.body;

    // Get authenticated user based on type
    const authenticatedUser = type === 'subAdmin' ? req.subAdmin : req.admin;
    const userIdField = type === 'subAdmin' ? 'subAdminId' : 'adminId';

    // Check authentication
    if (authenticatedUser[userIdField] !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized access" 
      });
    }

    // Build query
    let query = {};
    if (gameId) {
      query.gameId = gameId;
    }
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      query.createdAt = {
        $gte: fromDate,
        $lte: toDate,
      };
    }

    const gameResults = await AdminGameResult.find(query).lean();

    if (gameResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No game results found for this ${type}`
      });
    }

    const transformedResults = gameResults.map((result) => {
      // Filter winners and losers based on user type
      const filteredWinners = (result.winners || []).filter(
        (winner) => winner.adminId === userId
      );

      const filteredLosers = (result.losers || []).filter(
        (loser) => loser.adminId === userId
      );

      // Combine filtered results
      const userResults = [...filteredWinners, ...filteredLosers];

      // Add user type to each result for clarity
      const resultsWithType = userResults.map(result => ({
        ...result,
        userType: type
      }));

      return {
        _id: result._id,
        gameId: result.gameId,
        winningCard: result.winningCard,
        adminresult: resultsWithType,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      };
    });

    // Filter out games where user had no results
    const finalResults = transformedResults.filter(
      (result) => result.adminresult.length > 0
    );

    // Calculate summary statistics
    const totalGames = finalResults.length;
    const totalWins = finalResults.reduce((count, game) => 
      count + game.adminresult.filter(r => r.status === 'win').length, 0
    );

    return res.status(200).json({
      success: true,
      message: `${type} game results retrieved successfully`,
      data: finalResults
      // data: {
      //   userId,
      //   userType: type,
      //   summary: {
      //     totalGames,
      //     totalWins,
      //     winRate: totalGames ? ((totalWins / totalGames) * 100).toFixed(2) + '%' : '0%'
      //   },
      //   results: finalResults
      // }
    });

  } catch (error) {
    console.error(`Error retrieving ${req.params.type} game results:`, error);
    return res.status(500).json({
      success: false,
      message: `Error retrieving ${req.params.type} game results`,
      error: error.message
    });
  }
};

// Get total winnings amount for an admin
export const getTotalWinnings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { from, to } = req.query;

    // Check if authenticated user matches the requested userId
    if (req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Build query based on date range if provided
    let query = {};
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      query.createdAt = {
        $gte: fromDate,
        $lte: toDate,
      };
    }

    // Find all game results
    const gameResults = await AdminGameResult.find(query);

    let totalWinnings = 0;
    let winningGames = [];

    // Calculate total winnings and collect winning games
    gameResults.forEach((game) => {
      const adminWinners = game.winners.filter(
        (winner) => winner.adminId === userId && winner.status === "win"
      );

      adminWinners.forEach((winner) => {
        totalWinnings += winner.winAmount;
        winningGames.push({
          gameId: game.gameId,
          ticketsID: winner.ticketsID,
          winAmount: winner.winAmount,
          status: winner.status,
        });
      });
    });

    return res.status(200).json({
      success: true,
      message: "Total winnings calculated successfully",
      data: {
        totalWinnings,
        winningGames,
        gamesCount: winningGames.length,
      },
    });
  } catch (error) {
    console.error("Error calculating total winnings:", error);
    return res.status(500).json({
      success: false,
      message: "Error calculating total winnings",
      error: error.message,
    });
  }
};

// New
export const claimAllWinnings = async (req, res) => {
  try {
    const { userId } = req.params;

    let totalClaimedAmount = 0;
    const claimedGames = [];

    // Find the User
    let user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find all game results with unclaimed winnings for this user
    const gameResults = await AdminGameResult.find({
      "winners.adminId": userId,
      "winners.status": "win",
    });

      // Process each game result
    for (const game of gameResults) {
      const adminWinners = game.winners.filter(
        (winner) => winner.adminId === userId && winner.status === "win"
      );

      for (const winner of adminWinners) {
        // Update winner status to claimed
        winner.status = "claimed";
        totalClaimedAmount += winner.winAmount;

        claimedGames.push({
          gameId: game.gameId,
          ticketsID: winner.ticketsID,
          winAmount: winner.winAmount,
        });
      }

      await game.save();
    }

    // Update user's wallet with total claimed amount
    if (totalClaimedAmount > 0) {
      user.wallet += totalClaimedAmount;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: `User winnings claimed successfully`,
      data: {
        adminID: user.userId, // Return the user ID based on type
        totalClaimedAmount,
        claimedGames,
        newWalletBalance: user.wallet,
      },
    });
  } catch (error) {
    console.error("Error claiming all winnings:", error);
    return res.status(500).json({
      success: false,
      message: "Error claiming all winnings",
      error: error.message,
    });
  }
};

// Controller function to fetch latest 10 selected cards
export const getLatestSelectedCards = async (req, res) => {
  try {
    // Retrieve latest 10 selected cards from the database
    // Using sort({_id: -1}) to sort in descending order (newest first)
    // limit(10) to get only 10 records
    const latestSelectedCards = await SelectedCard.find()
      .sort({ _id: -1 })
      .limit(10);

    // Send the selected cards as a response
    res.status(200).json({
      success: true,
      data: latestSelectedCards,
    });
  } catch (error) {
    console.error("Error fetching latest selected cards:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching latest selected cards",
    });
  }
};










// Latest have to do 3 times
//for 16 cards
export const getAllCardsOne = async (req, res) => {
  try {
    const allCards = Object.entries(cardNumbers1).map(([cardNo, cardName]) => ({
      cardNo: cardNo,
      cardName,
    }));

    res.status(200).json({
      success: true,
      data: allCards,
    });
  } catch (error) {
    console.error("Error fetching all cards:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching all cards",
      error: error.message,
    });
  }
};
//for 10 cards
export const getAllCardsTwo = async (req, res) => {
  try {
    const allCards = Object.entries(cardNumbers2).map(([cardNo, cardName]) => ({
      cardNo: cardNo,
      cardName,
    }));

    res.status(200).json({
      success: true,
      data: allCards,
    });
  } catch (error) {
    console.error("Error fetching all cards:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching all cards",
      error: error.message,
    });
  }
};
//for 10 cards
export const getAllCardsThree = async (req, res) => {
  try {
    const allCards = Object.entries(cardNumbers3).map(([cardNo, cardName]) => ({
      cardNo: cardNo,
      cardName,
    }));

    res.status(200).json({
      success: true,
      data: allCards,
    });
  } catch (error) {
    console.error("Error fetching all cards:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching all cards",
      error: error.message,
    });
  }
};

// Latest have to do 3 times
//for 16 cards
export const getCurrentGameOne = async () => {
  try {
    // Find the most recent game
    const currentGame = await GameOne.findOne().sort({ createdAt: -1 });

    if (!currentGame) {
      return { message: "No active game found" };
      // return res.status(404).json({ message: 'No active game found' });
    }
    return {
      success: true,
      data: {
        gameId: currentGame.GameId,
        // createdAt: currentGame.createdAt
      },
    };
  } catch (error) {
    console.error("Error fetching current game:", error);
    return {
      success: false,
      message: "Error fetching current game",
      error: error.message,
    };
  }
};
//for 10 cards
export const getCurrentGameTwo = async () => {
  try {
    // Find the most recent game
    const currentGame = await GameTwo.findOne().sort({ createdAt: -1 });

    if (!currentGame) {
      return { message: "No active game found" };
      // return res.status(404).json({ message: 'No active game found' });
    }
    return {
      success: true,
      data: {
        gameId: currentGame.GameId,
        // createdAt: currentGame.createdAt
      },
    };
  } catch (error) {
    console.error("Error fetching current game:", error);
    return {
      success: false,
      message: "Error fetching current game",
      error: error.message,
    };
  }
};
//for 10 cards
export const getCurrentGameThree = async () => {
  try {
    // Find the most recent game
    const currentGame = await GameThree.findOne().sort({ createdAt: -1 });

    if (!currentGame) {
      return { message: "No active game found" };
      // return res.status(404).json({ message: 'No active game found' });
    }
    return {
      success: true,
      data: {
        gameId: currentGame.GameId,
        // createdAt: currentGame.createdAt
      },
    };
  } catch (error) {
    console.error("Error fetching current game:", error);
    return {
      success: false,
      message: "Error fetching current game",
      error: error.message,
    };
  }
};

// Latest have to do 3 times
//for 16 cards
export const calculateAmountsOne = async () => {
  try {
    const latestGame = await GameOne.findOne().sort({ createdAt: -1 }).lean();

    if (!latestGame) {
      return { message: "No games found" };
    }

    const choiceDoc = await AdminChoice.findOne();
    const chosenAlgorithm = choiceDoc ? choiceDoc.algorithm : "default";
    let processedData;

    switch (chosenAlgorithm) {
      case "minAmount":
        processedData = await processGameBetsWithMinAmount(latestGame.Bets);
        break;
      case "zeroAndRandom":
        processedData = await processGameBetsWithZeroRandomAndMin(
          latestGame.Bets
        );
        break;
      default:
        processedData = await processGameBetsOne(latestGame.Bets);
    }

    let { multipliedArray, percAmount, type } = processedData;
    const selectedCard = await selectRandomAmountOne(
      multipliedArray,
      percAmount,
      type
    );

    if (!selectedCard || !selectedCard.randomEntry) {
      throw new Error("No valid card selected");
    }

    const { randomEntry } = selectedCard;

    // Convert the index to the corresponding card number
    const cardNumbers = [
      "A001",
      "A002",
      "A003",
      "A004",
      "A005",
      "A006",
      "A007",
      "A008",
      "A009",
      "A010",
      "A011",
      "A012",
      "A013",
      "A014",
      "A015",
      "A016",
    ];
    const selectedCardNo = cardNumbers[randomEntry.index];

    if (!selectedCardNo) {
      throw new Error("Invalid card index");
    }

    const WinningCard = {
      cardId: selectedCardNo,
      multiplier: parseInt(randomEntry.key),
      amount: randomEntry.value,
    };

    await saveSelectedCardOne(WinningCard, latestGame.GameId);
    // console.log("latestGame", latestGame);
    // console.log("WinningCard", WinningCard);
    const adminResults = await calculateAdminResultsOne(latestGame, WinningCard);
    await getAdminGameResultsOne(latestGame.GameId, adminResults);
    // await processAllSelectedCards();
    await calculateAndStoreAdminWinningsOne(latestGame.GameId);

    // console.log("adminResults", adminResults);

    return {
      message: "Amounts calculated successfully",
      WinningCard,
      adminResults,
    };
  } catch (err) {
    console.error(`Error during calculation: ${err}`);
    return { message: "Error calculating amounts", error: err.message };
  }
};
//for 10 cards
export const calculateAmountsTwo = async () => {
  try {
    const latestGame = await GameTwo.findOne().sort({ createdAt: -1 }).lean();

    if (!latestGame) {
      return { message: "No games found" };
    }

    const choiceDoc = await AdminChoice.findOne();
    const chosenAlgorithm = choiceDoc ? choiceDoc.algorithm : "default";
    let processedData;

    switch (chosenAlgorithm) {
      case "minAmount":
        processedData = await processGameBetsWithMinAmount(latestGame.Bets);
        break;
      case "zeroAndRandom":
        processedData = await processGameBetsWithZeroRandomAndMin(
          latestGame.Bets
        );
        break;
      default:
        processedData = await processGameBetsTwo(latestGame.Bets);
    }

    let { multipliedArray, percAmount, type } = processedData;
    const selectedCard = await selectRandomAmountTwo(
      multipliedArray,
      percAmount,
      type
    );

    if (!selectedCard || !selectedCard.randomEntry) {
      throw new Error("No valid card selected");
    }

    const { randomEntry } = selectedCard;

    // Convert the index to the corresponding card number
    const cardNumbers = [
      "A001",
      "A002",
      "A003",
      "A004",
      "A005",
      "A006",
      "A007",
      "A008",
      "A009",
      "A010",
    ];
    const selectedCardNo = cardNumbers[randomEntry.index];

    if (!selectedCardNo) {
      throw new Error("Invalid card index");
    }

    const WinningCard = {
      cardId: selectedCardNo,
      multiplier: parseInt(randomEntry.key),
      amount: randomEntry.value,
    };

    await saveSelectedCardTwo(WinningCard, latestGame.GameId);
    // console.log("latestGame", latestGame);
    // console.log("WinningCard", WinningCard);
    const adminResults = await calculateAdminResultsTwo(latestGame, WinningCard);
    await getAdminGameResultsTwo(latestGame.GameId, adminResults);
    // await processAllSelectedCards();
    await calculateAndStoreAdminWinningsTwo(latestGame.GameId);

    // console.log("adminResults", adminResults);

    return {
      message: "Amounts calculated successfully",
      WinningCard,
      adminResults,
    };
  } catch (err) {
    console.error(`Error during calculation: ${err}`);
    return { message: "Error calculating amounts", error: err.message };
  }
};
//for 10 cards
export const calculateAmountsThree = async () => {
  try {
    const latestGame = await GameThree.findOne().sort({ createdAt: -1 }).lean();

    if (!latestGame) {
      return { message: "No games found" };
    }

    const choiceDoc = await AdminChoice.findOne();
    const chosenAlgorithm = choiceDoc ? choiceDoc.algorithm : "default";
    let processedData;

    switch (chosenAlgorithm) {
      case "minAmount":
        processedData = await processGameBetsWithMinAmount(latestGame.Bets);
        break;
      case "zeroAndRandom":
        processedData = await processGameBetsWithZeroRandomAndMin(
          latestGame.Bets
        );
        break;
      default:
        processedData = await processGameBetsThree(latestGame.Bets);
    }

    let { multipliedArray, percAmount, type } = processedData;
    const selectedCard = await selectRandomAmountThree(
      multipliedArray,
      percAmount,
      type
    );

    if (!selectedCard || !selectedCard.randomEntry) {
      throw new Error("No valid card selected");
    }

    const { randomEntry } = selectedCard;

    // Convert the index to the corresponding card number
    const cardNumbers = [
      "A001",
      "A002",
      "A003",
      "A004",
      "A005",
      "A006",
      "A007",
      "A008",
      "A009",
      "A010",
    ];
    const selectedCardNo = cardNumbers[randomEntry.index];

    if (!selectedCardNo) {
      throw new Error("Invalid card index");
    }

    const WinningCard = {
      cardId: selectedCardNo,
      multiplier: parseInt(randomEntry.key),
      amount: randomEntry.value,
    };

    await saveSelectedCardThree(WinningCard, latestGame.GameId);
    // console.log("latestGame", latestGame);
    // console.log("WinningCard", WinningCard);
    const adminResults = await calculateAdminResultsThree(latestGame, WinningCard);
    await getAdminGameResults(latestGame.GameId, adminResults);
    // await processAllSelectedCards();
    await calculateAndStoreAdminWinningsThree(latestGame.GameId);

    // console.log("adminResults", adminResults);

    return {
      message: "Amounts calculated successfully",
      WinningCard,
      adminResults,
    };
  } catch (err) {
    console.error(`Error during calculation: ${err}`);
    return { message: "Error calculating amounts", error: err.message };
  }
};

// Latest have to do 3 times
//for 16 cards
const processGameBetsOne = async (bets) => {
  // Check if bets array is empty
  if (!bets || bets.length === 0) {
    console.log("No bets placed. Skipping bet processing...");
    return {}; // Returning an empty object or any default value to avoid errors
  }

  let totalAmount = 0;
  const amounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (const bet of bets) {
    // Access cards in the bet
    bet.card.forEach((card) => {
      if (card.cardNo == "A001") {
        totalAmount += card.Amount;
        amounts[0] += card.Amount;
      } else if (card.cardNo == "A002") {
        totalAmount += card.Amount;
        amounts[1] += card.Amount;
      } else if (card.cardNo == "A003") {
        totalAmount += card.Amount;
        amounts[2] += card.Amount;
      } else if (card.cardNo == "A004") {
        totalAmount += card.Amount;
        amounts[3] += card.Amount;
      } else if (card.cardNo == "A005") {
        totalAmount += card.Amount;
        amounts[4] += card.Amount;
      } else if (card.cardNo == "A006") {
        totalAmount += card.Amount;
        amounts[5] += card.Amount;
      } else if (card.cardNo == "A007") {
        totalAmount += card.Amount;
        amounts[6] += card.Amount;
      } else if (card.cardNo == "A008") {
        totalAmount += card.Amount;
        amounts[7] += card.Amount;
      } else if (card.cardNo == "A009") {
        totalAmount += card.Amount;
        amounts[8] += card.Amount;
      } else if (card.cardNo == "A010") {
        totalAmount += card.Amount;
        amounts[9] += card.Amount;
      } else if (card.cardNo == "A011") {
        totalAmount += card.Amount;
        amounts[10] += card.Amount;
      } else if (card.cardNo == "A012") {
        totalAmount += card.Amount;
        amounts[11] += card.Amount;
      } else if (card.cardNo == "A013") {
        totalAmount += card.Amount;
        amounts[12] += card.Amount;
      } else if (card.cardNo == "A014") {
        totalAmount += card.Amount;
        amounts[13] += card.Amount;
      } else if (card.cardNo == "A015") {
        totalAmount += card.Amount;
        amounts[14] += card.Amount;
      } else if (card.cardNo == "A016") {
        totalAmount += card.Amount;
        amounts[15] += card.Amount;
      }
    });
  }

  let multipliedArray = {
    1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    10: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };
  // Get current percentage mode from database
  const percentageMode = await PercentageMode.findOne();
  let perc;

  if (!percentageMode || percentageMode.mode === 'automatic') {
    perc = await processBetsWithDynamicPercentageWeighted();
  } else {
    perc = await processBetsWithDynamicPercentage();
  } 

  // const percAmount = totalAmount * 0.85;
  const percAmount = totalAmount * (perc / 100);

  for (let i = 0; i < amounts.length; i++) {
    if (amounts[i] * 10 !== 0) {
      multipliedArray["1"][i] = amounts[i] * 10;
    }
    if (amounts[i] * 20 !== 0) {
      multipliedArray["2"][i] = amounts[i] * 20;
    }
    if (amounts[i] * 30 !== 0) {
      multipliedArray["3"][i] = amounts[i] * 30;
    }
    if (amounts[i] * 40 !== 0) {
      multipliedArray["4"][i] = amounts[i] * 40;
    }
    if (amounts[i] * 50 !== 0) {
      multipliedArray["5"][i] = amounts[i] * 50;
    }
    if (amounts[i] * 60 !== 0) {
      multipliedArray["6"][i] = amounts[i] * 60;
    }
    if (amounts[i] * 70 !== 0) {
      multipliedArray["7"][i] = amounts[i] * 70;
    }
    if (amounts[i] * 80 !== 0) {
      multipliedArray["8"][i] = amounts[i] * 80;
    }
    if (amounts[i] * 60 !== 0) {
      multipliedArray["9"][i] = amounts[i] * 90;
    }
    if (amounts[i] * 100 !== 0) {
      multipliedArray["10"][i] = amounts[i] * 100;
    }
  }

  let type = "processGameBets";

  return {
    multipliedArray,
    percAmount,
    type,
  };
};
//for 10 cards
const processGameBetsTwo = async (bets) => {
  // Check if bets array is empty
  if (!bets || bets.length === 0) {
    console.log("No bets placed. Skipping bet processing...");
    return {}; // Returning an empty object or any default value to avoid errors
  }

  let totalAmount = 0;
  const amounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (const bet of bets) {
    // Access cards in the bet
    bet.card.forEach((card) => {
      if (card.cardNo == "A001") {
        totalAmount += card.Amount;
        amounts[0] += card.Amount;
      } else if (card.cardNo == "A002") {
        totalAmount += card.Amount;
        amounts[1] += card.Amount;
      } else if (card.cardNo == "A003") {
        totalAmount += card.Amount;
        amounts[2] += card.Amount;
      } else if (card.cardNo == "A004") {
        totalAmount += card.Amount;
        amounts[3] += card.Amount;
      } else if (card.cardNo == "A005") {
        totalAmount += card.Amount;
        amounts[4] += card.Amount;
      } else if (card.cardNo == "A006") {
        totalAmount += card.Amount;
        amounts[5] += card.Amount;
      } else if (card.cardNo == "A007") {
        totalAmount += card.Amount;
        amounts[6] += card.Amount;
      } else if (card.cardNo == "A008") {
        totalAmount += card.Amount;
        amounts[7] += card.Amount;
      } else if (card.cardNo == "A009") {
        totalAmount += card.Amount;
        amounts[8] += card.Amount;
      } else if (card.cardNo == "A010") {
        totalAmount += card.Amount;
        amounts[9] += card.Amount;
      }
    });
  }

  let multipliedArray = {
    1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    10: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };
  // Get current percentage mode from database
  const percentageMode = await PercentageMode.findOne();
  let perc;

  if (!percentageMode || percentageMode.mode === 'automatic') {
    perc = await processBetsWithDynamicPercentageWeighted();
  } else {
    perc = await processBetsWithDynamicPercentage();
  } 

  // const percAmount = totalAmount * 0.85;
  const percAmount = totalAmount * (perc / 100);

  for (let i = 0; i < amounts.length; i++) {
    if (amounts[i] * 10 !== 0) {
      multipliedArray["1"][i] = amounts[i] * 10;
    }
    if (amounts[i] * 20 !== 0) {
      multipliedArray["2"][i] = amounts[i] * 20;
    }
    if (amounts[i] * 30 !== 0) {
      multipliedArray["3"][i] = amounts[i] * 30;
    }
    if (amounts[i] * 40 !== 0) {
      multipliedArray["4"][i] = amounts[i] * 40;
    }
    if (amounts[i] * 50 !== 0) {
      multipliedArray["5"][i] = amounts[i] * 50;
    }
    if (amounts[i] * 60 !== 0) {
      multipliedArray["6"][i] = amounts[i] * 60;
    }
    if (amounts[i] * 70 !== 0) {
      multipliedArray["7"][i] = amounts[i] * 70;
    }
    if (amounts[i] * 80 !== 0) {
      multipliedArray["8"][i] = amounts[i] * 80;
    }
    if (amounts[i] * 60 !== 0) {
      multipliedArray["9"][i] = amounts[i] * 90;
    }
    if (amounts[i] * 100 !== 0) {
      multipliedArray["10"][i] = amounts[i] * 100;
    }
  }

  let type = "processGameBets";

  return {
    multipliedArray,
    percAmount,
    type,
  };
};
//for 10 cards
const processGameBetsThree = async (bets) => {
  // Check if bets array is empty
  if (!bets || bets.length === 0) {
    console.log("No bets placed. Skipping bet processing...");
    return {}; // Returning an empty object or any default value to avoid errors
  }

  let totalAmount = 0;
  const amounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (const bet of bets) {
    // Access cards in the bet
    bet.card.forEach((card) => {
      if (card.cardNo == "A001") {
        totalAmount += card.Amount;
        amounts[0] += card.Amount;
      } else if (card.cardNo == "A002") {
        totalAmount += card.Amount;
        amounts[1] += card.Amount;
      } else if (card.cardNo == "A003") {
        totalAmount += card.Amount;
        amounts[2] += card.Amount;
      } else if (card.cardNo == "A004") {
        totalAmount += card.Amount;
        amounts[3] += card.Amount;
      } else if (card.cardNo == "A005") {
        totalAmount += card.Amount;
        amounts[4] += card.Amount;
      } else if (card.cardNo == "A006") {
        totalAmount += card.Amount;
        amounts[5] += card.Amount;
      } else if (card.cardNo == "A007") {
        totalAmount += card.Amount;
        amounts[6] += card.Amount;
      } else if (card.cardNo == "A008") {
        totalAmount += card.Amount;
        amounts[7] += card.Amount;
      } else if (card.cardNo == "A009") {
        totalAmount += card.Amount;
        amounts[8] += card.Amount;
      } else if (card.cardNo == "A010") {
        totalAmount += card.Amount;
        amounts[9] += card.Amount;
      }
    });
  }

  let multipliedArray = {
    1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    10: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };
  // Get current percentage mode from database
  const percentageMode = await PercentageMode.findOne();
  let perc;

  if (!percentageMode || percentageMode.mode === 'automatic') {
    perc = await processBetsWithDynamicPercentageWeighted();
  } else {
    perc = await processBetsWithDynamicPercentage();
  } 

  // const percAmount = totalAmount * 0.85;
  const percAmount = totalAmount * (perc / 100);

  for (let i = 0; i < amounts.length; i++) {
    if (amounts[i] * 10 !== 0) {
      multipliedArray["1"][i] = amounts[i] * 10;
    }
    if (amounts[i] * 20 !== 0) {
      multipliedArray["2"][i] = amounts[i] * 20;
    }
    if (amounts[i] * 30 !== 0) {
      multipliedArray["3"][i] = amounts[i] * 30;
    }
    if (amounts[i] * 40 !== 0) {
      multipliedArray["4"][i] = amounts[i] * 40;
    }
    if (amounts[i] * 50 !== 0) {
      multipliedArray["5"][i] = amounts[i] * 50;
    }
    if (amounts[i] * 60 !== 0) {
      multipliedArray["6"][i] = amounts[i] * 60;
    }
    if (amounts[i] * 70 !== 0) {
      multipliedArray["7"][i] = amounts[i] * 70;
    }
    if (amounts[i] * 80 !== 0) {
      multipliedArray["8"][i] = amounts[i] * 80;
    }
    if (amounts[i] * 60 !== 0) {
      multipliedArray["9"][i] = amounts[i] * 90;
    }
    if (amounts[i] * 100 !== 0) {
      multipliedArray["10"][i] = amounts[i] * 100;
    }
  }

  let type = "processGameBets";

  return {
    multipliedArray,
    percAmount,
    type,
  };
};

// Latest have to do 3 times
//for 16 cards
async function selectRandomAmountOne(validAmounts, percAmount, type) {
  if (type === "processGameBets") {
    let allEntries = [];   

    // Collect all valid entries with their values
    for (let key in validAmounts) {
      if (Array.isArray(validAmounts[key])) {
        validAmounts[key].forEach((value, index) => {  
          if (value <= percAmount) {
            allEntries.push({ key, index, value });
          }
        });
      }
    }

    if (allEntries.length === 0) {
      let Cnum = Infinity;
      let smallestEntry = null;
    
      for (let key in validAmounts) {
        if (Array.isArray(validAmounts[key])) {
          validAmounts[key].forEach((value, index) => {
            if (value < Cnum) {
              Cnum = value;
              smallestEntry = { key, index, value }; 
            }
          });
        }
      }
    
      if (smallestEntry) {
        allEntries.push(smallestEntry); // Push the smallest entry into allEntries
      }
    }
    

    // Sort entries by value in descending order (highest to lowest)
    allEntries.sort((a, b) => b.value - a.value);

    // Get top 3 entries
    const topThreeEntries = allEntries.slice(0, 3);

    // Select random entry from top 3
    const randomEntry = topThreeEntries[Math.floor(Math.random() * topThreeEntries.length)];

    return { randomEntry };
  } else if (type === "processGameBetsWithMinAmount") {
    // Logic for always selecting the minimum amount
    let minEntry = null;

    for (let key in validAmounts) {
      if (Array.isArray(validAmounts[key])) {
        validAmounts[key].forEach((value, index) => {
          if (value !== 0 && (minEntry === null || value < minEntry.value)) {
            minEntry = { key, index, value };
          }
        });
      }
    }

    if (minEntry) {
      console.log("Selected minimum entry:", minEntry);
      return { randomEntry: minEntry };
    } else {
      console.log("No non-zero entries found. Returning null.");
      return null;
    }
  } else if (type === "processGameBetsWithZeroRandomAndMin") {
    // Logic for prioritizing zero amounts, then minimum if no zero exists
    let zeroEntries = [];
    let minEntry = null;

    for (let key in validAmounts) {
      if (Array.isArray(validAmounts[key])) {
        validAmounts[key].forEach((value, index) => {
          if (value === 0) {
            zeroEntries.push({ key, index, value });
          } else if (minEntry === null || value < minEntry.value) {
            minEntry = { key, index, value };
          }
        });
      }
    }

    let selectedEntry;

    if (zeroEntries.length > 0) {
      console.log("Zero entries found. Selecting a random zero entry.");
      selectedEntry =
        zeroEntries[Math.floor(Math.random() * zeroEntries.length)];
    } else if (minEntry) {
      console.log("No zero entries found. Selecting the minimum entry.");
      selectedEntry = minEntry;
    } else {
      console.log("No entries found. Returning null.");
      return null;
    }

    return { randomEntry: selectedEntry };
  } else {
    const entries = [
      { key: '1', index: 1, value: 0 },
      { key: '1', index: 2, value: 0 },
      { key: '1', index: 3, value: 0 },
      { key: '1', index: 4, value: 0 },
      { key: '1', index: 5, value: 0 },
      { key: '1', index: 6, value: 0 },
      { key: '1', index: 7, value: 0 },
      { key: '1', index: 8, value: 0 },
      { key: '2', index: 9, value: 0 },
      { key: '10', index: 10, value: 0 },
      { key: '1', index: 11, value: 0 },
      { key: '2', index: 2, value: 0 },
      { key: '1', index: 1, value: 0 },
      { key: '1', index: 2, value: 0 },
      { key: '3', index: 3, value: 0 },
      { key: '1', index: 4, value: 0 },
      { key: '1', index: 5, value: 0 },
      { key: '1', index: 6, value: 0 },
      { key: '1', index: 7, value: 0 },
      { key: '2', index: 8, value: 0 },
      { key: '1', index: 9, value: 0 },
      { key: '1', index: 10, value: 0 },
      { key: '1', index: 11, value: 0 },
      { key: '1', index: 2, value: 0 },
      { key: '1', index: 1, value: 0 },
      { key: '1', index: 2, value: 0 },
      { key: '1', index: 3, value: 0 },
      { key: '4', index: 4, value: 0 },
      // Add more entries as needed
    ];

    // Generate a random index
    const randomIndex = Math.floor(Math.random() * entries.length);
    let randomEntry = entries[randomIndex];

    return { randomEntry };
    // return null;
  }
}
//for 10 cards
async function selectRandomAmountTwo(validAmounts, percAmount, type) {
  if (type === "processGameBets") {
    let allEntries = [];   

    // Collect all valid entries with their values
    for (let key in validAmounts) {
      if (Array.isArray(validAmounts[key])) {
        validAmounts[key].forEach((value, index) => {  
          if (value <= percAmount) {
            allEntries.push({ key, index, value });
          }
        });
      }
    }

    if (allEntries.length === 0) {
      let Cnum = Infinity;
      let smallestEntry = null;
    
      for (let key in validAmounts) {
        if (Array.isArray(validAmounts[key])) {
          validAmounts[key].forEach((value, index) => {
            if (value < Cnum) {
              Cnum = value;
              smallestEntry = { key, index, value }; 
            }
          });
        }
      }
    
      if (smallestEntry) {
        allEntries.push(smallestEntry); // Push the smallest entry into allEntries
      }
    }
    

    // Sort entries by value in descending order (highest to lowest)
    allEntries.sort((a, b) => b.value - a.value);

    // Get top 3 entries
    const topThreeEntries = allEntries.slice(0, 3);

    // Select random entry from top 3
    const randomEntry = topThreeEntries[Math.floor(Math.random() * topThreeEntries.length)];

    return { randomEntry };
  } else if (type === "processGameBetsWithMinAmount") {
    // Logic for always selecting the minimum amount
    let minEntry = null;

    for (let key in validAmounts) {
      if (Array.isArray(validAmounts[key])) {
        validAmounts[key].forEach((value, index) => {
          if (value !== 0 && (minEntry === null || value < minEntry.value)) {
            minEntry = { key, index, value };
          }
        });
      }
    }

    if (minEntry) {
      console.log("Selected minimum entry:", minEntry);
      return { randomEntry: minEntry };
    } else {
      console.log("No non-zero entries found. Returning null.");
      return null;
    }
  } else if (type === "processGameBetsWithZeroRandomAndMin") {
    // Logic for prioritizing zero amounts, then minimum if no zero exists
    let zeroEntries = [];
    let minEntry = null;

    for (let key in validAmounts) {
      if (Array.isArray(validAmounts[key])) {
        validAmounts[key].forEach((value, index) => {
          if (value === 0) {
            zeroEntries.push({ key, index, value });
          } else if (minEntry === null || value < minEntry.value) {
            minEntry = { key, index, value };
          }
        });
      }
    }

    let selectedEntry;

    if (zeroEntries.length > 0) {
      console.log("Zero entries found. Selecting a random zero entry.");
      selectedEntry =
        zeroEntries[Math.floor(Math.random() * zeroEntries.length)];
    } else if (minEntry) {
      console.log("No zero entries found. Selecting the minimum entry.");
      selectedEntry = minEntry;
    } else {
      console.log("No entries found. Returning null.");
      return null;
    }

    return { randomEntry: selectedEntry };
  } else {
    const entries = [
      { key: '1', index: 1, value: 0 },
      { key: '1', index: 2, value: 0 },
      { key: '1', index: 3, value: 0 },
      { key: '1', index: 4, value: 0 },
      { key: '1', index: 5, value: 0 },
      { key: '1', index: 6, value: 0 },
      { key: '1', index: 7, value: 0 },
      { key: '1', index: 8, value: 0 },
      { key: '2', index: 9, value: 0 },
      { key: '2', index: 2, value: 0 },
      { key: '1', index: 1, value: 0 },
      { key: '1', index: 2, value: 0 },
      { key: '3', index: 3, value: 0 },
      { key: '1', index: 4, value: 0 },
      { key: '1', index: 5, value: 0 },
      { key: '1', index: 6, value: 0 },
      { key: '1', index: 7, value: 0 },
      { key: '2', index: 8, value: 0 },
      { key: '1', index: 9, value: 0 },
      { key: '1', index: 2, value: 0 },
      { key: '1', index: 1, value: 0 },
      { key: '1', index: 2, value: 0 },
      { key: '1', index: 3, value: 0 },
      { key: '4', index: 4, value: 0 },
      // Add more entries as needed
    ];

    // Generate a random index
    const randomIndex = Math.floor(Math.random() * entries.length);
    let randomEntry = entries[randomIndex];

    return { randomEntry };
    // return null;
  }
}
//for 10 cards
async function selectRandomAmountThree(validAmounts, percAmount, type) {
  if (type === "processGameBets") {
    let allEntries = [];   

    // Collect all valid entries with their values
    for (let key in validAmounts) {
      if (Array.isArray(validAmounts[key])) {
        validAmounts[key].forEach((value, index) => {  
          if (value <= percAmount) {
            allEntries.push({ key, index, value });
          }
        });
      }
    }

    if (allEntries.length === 0) {
      let Cnum = Infinity;
      let smallestEntry = null;
    
      for (let key in validAmounts) {
        if (Array.isArray(validAmounts[key])) {
          validAmounts[key].forEach((value, index) => {
            if (value < Cnum) {
              Cnum = value;
              smallestEntry = { key, index, value }; 
            }
          });
        }
      }
    
      if (smallestEntry) {
        allEntries.push(smallestEntry); // Push the smallest entry into allEntries
      }
    }
    

    // Sort entries by value in descending order (highest to lowest)
    allEntries.sort((a, b) => b.value - a.value);

    // Get top 3 entries
    const topThreeEntries = allEntries.slice(0, 3);

    // Select random entry from top 3
    const randomEntry = topThreeEntries[Math.floor(Math.random() * topThreeEntries.length)];

    return { randomEntry };
  } else if (type === "processGameBetsWithMinAmount") {
    // Logic for always selecting the minimum amount
    let minEntry = null;

    for (let key in validAmounts) {
      if (Array.isArray(validAmounts[key])) {
        validAmounts[key].forEach((value, index) => {
          if (value !== 0 && (minEntry === null || value < minEntry.value)) {
            minEntry = { key, index, value };
          }
        });
      }
    }

    if (minEntry) {
      console.log("Selected minimum entry:", minEntry);
      return { randomEntry: minEntry };
    } else {
      console.log("No non-zero entries found. Returning null.");
      return null;
    }
  } else if (type === "processGameBetsWithZeroRandomAndMin") {
    // Logic for prioritizing zero amounts, then minimum if no zero exists
    let zeroEntries = [];
    let minEntry = null;

    for (let key in validAmounts) {
      if (Array.isArray(validAmounts[key])) {
        validAmounts[key].forEach((value, index) => {
          if (value === 0) {
            zeroEntries.push({ key, index, value });
          } else if (minEntry === null || value < minEntry.value) {
            minEntry = { key, index, value };
          }
        });
      }
    }

    let selectedEntry;

    if (zeroEntries.length > 0) {
      console.log("Zero entries found. Selecting a random zero entry.");
      selectedEntry =
        zeroEntries[Math.floor(Math.random() * zeroEntries.length)];
    } else if (minEntry) {
      console.log("No zero entries found. Selecting the minimum entry.");
      selectedEntry = minEntry;
    } else {
      console.log("No entries found. Returning null.");
      return null;
    }

    return { randomEntry: selectedEntry };
  } else {
    const entries = [
      { key: '1', index: 1, value: 0 },
      { key: '1', index: 2, value: 0 },
      { key: '1', index: 3, value: 0 },
      { key: '1', index: 4, value: 0 },
      { key: '1', index: 5, value: 0 },
      { key: '1', index: 6, value: 0 },
      { key: '1', index: 7, value: 0 },
      { key: '1', index: 8, value: 0 },
      { key: '2', index: 9, value: 0 },
      { key: '2', index: 2, value: 0 },
      { key: '1', index: 1, value: 0 },
      { key: '1', index: 2, value: 0 },
      { key: '3', index: 3, value: 0 },
      { key: '1', index: 4, value: 0 },
      { key: '1', index: 5, value: 0 },
      { key: '1', index: 6, value: 0 },
      { key: '1', index: 7, value: 0 },
      { key: '2', index: 8, value: 0 },
      { key: '1', index: 9, value: 0 },
      { key: '1', index: 2, value: 0 },
      { key: '1', index: 1, value: 0 },
      { key: '1', index: 2, value: 0 },
      { key: '1', index: 3, value: 0 },
      { key: '4', index: 4, value: 0 },
      // Add more entries as needed
    ];

    // Generate a random index
    const randomIndex = Math.floor(Math.random() * entries.length);
    let randomEntry = entries[randomIndex];

    return { randomEntry };
    // return null;
  }
}

// Latest have to do 3 times
//for 16 cards
const saveSelectedCardOne = async (selectedAmount, gameId) => {
  console.log("selectedAmount", selectedAmount);
  
  // Check if selectedAmount is empty
  if (Object.keys(selectedAmount).length === 0) {
    console.log("selected amounts is empty.");
    return {}; // Return an empty object if validAmounts is empty
  }

  const drowTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  const selectedCardData = {
    gameId: gameId,
    cardId: selectedAmount.cardId,
    multiplier: selectedAmount.multiplier,
    amount: selectedAmount.amount,
    drowTime: drowTime,
  };

  const selectedCard = new SelectedCardOne(selectedCardData);
  await selectedCard.save();
};
//for 10 cards
const saveSelectedCardTwo = async (selectedAmount, gameId) => {
  console.log("selectedAmount", selectedAmount);
  
  // Check if selectedAmount is empty
  if (Object.keys(selectedAmount).length === 0) {
    console.log("selected amounts is empty.");
    return {}; // Return an empty object if validAmounts is empty
  }

  const drowTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  const selectedCardData = {
    gameId: gameId,
    cardId: selectedAmount.cardId,
    multiplier: selectedAmount.multiplier,
    amount: selectedAmount.amount,
    drowTime: drowTime,
  };

  const selectedCard = new SelectedCardTwo(selectedCardData);
  await selectedCard.save();
};
//for 10 cards
const saveSelectedCardThree = async (selectedAmount, gameId) => {
  console.log("selectedAmount", selectedAmount);
  
  // Check if selectedAmount is empty
  if (Object.keys(selectedAmount).length === 0) {
    console.log("selected amounts is empty.");
    return {}; // Return an empty object if validAmounts is empty
  }

  const drowTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  const selectedCardData = {
    gameId: gameId,
    cardId: selectedAmount.cardId,
    multiplier: selectedAmount.multiplier,
    amount: selectedAmount.amount,
    drowTime: drowTime,
  };

  const selectedCard = new SelectedCardThree(selectedCardData);
  await selectedCard.save();
};

// Latest have to do 3 times
//for 16 cards
export const getAllSelectedCardsOne = async (req, res) => {
  try {
    // Retrieve all selected cards from the database
    const selectedCards = await SelectedCardOne.find();

    // Send the selected cards as a response
    res.status(200).json({
      success: true,
      data: selectedCards,
    });
  } catch (error) {
    console.error("Error fetching selected cards:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching selected cards",
    });
  }
};
//for 10 cards
export const getAllSelectedCardsTwo = async (req, res) => {
  try {
    // Retrieve all selected cards from the database
    const selectedCards = await SelectedCardTwo.find();

    // Send the selected cards as a response
    res.status(200).json({
      success: true,
      data: selectedCards,
    });
  } catch (error) {
    console.error("Error fetching selected cards:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching selected cards",
    });
  }
};
//for 10 cards
export const getAllSelectedCardsThree = async (req, res) => {
  try {
    // Retrieve all selected cards from the database
    const selectedCards = await SelectedCardThree.find();

    // Send the selected cards as a response
    res.status(200).json({
      success: true,
      data: selectedCards,
    });
  } catch (error) {
    console.error("Error fetching selected cards:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching selected cards",
    });
  }
};

// Latest have to do 3 times
//for 16 cards
export const placeBetOne = async (req, res) => {
  const { ticketsID, cards, GameId } = req.body;
  // const { user } = req.params; // Get adminId from URL params
  // console.log(adminId);
  
  try {
    let user = req.user;

    if (!user) {
      return res.status(404).json({ message: 'User not authenticated!' });
    }

    // Calculate the total bet amount from all the cards
    let totalAmount = 0;
    if (Array.isArray(cards)) {
      cards.forEach((card) => {
        if (card.Amount) {
          totalAmount += card.Amount; // Accumulate the amount from each card
        }
      });
    }

    // Check if user has sufficient balance
    if (user.wallet < totalAmount) {
      return res.status(400).json({ message: 'Insufficient balance in wallet!' });
    }

    // Check if there is an active game with the given GameId
    const activeGame = await GameOne.findOne({ GameId: GameId });
    if (!activeGame) {
      return res.status(404).json({ message: 'Game not found!' });
    }

    // Create a new bet entry (gameDetails) to be pushed into the Bets array
    const newBet = {
      userID: user.userId,  // Identify the user by adminId or subAdminId
      ticketsID: ticketsID,
      card: [],
      ticketTime: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }), // Indian Standard Time (IST)
    };

    // Loop through the cards array and add each card to the newBet
    if (Array.isArray(cards)) {
      cards.forEach((card) => {
        if (card.cardNo && card.Amount) {
          // Ensure cardNo and Amount are provided
          newBet.card.push({
            cardNo: card.cardNo,
            Amount: card.Amount,
          });
        }
      });
    }

    // Add the new bet to the Bets array of the game
    activeGame.Bets.push(newBet);

    // Deduct the total bet amount from user's wallet
    user.wallet -= totalAmount;

    // Save the updated game and user wallet
    await Promise.all([activeGame.save(), user.save()]);

    return res.status(200).json({
      message: "Game data successfully uploaded and bet placed successfully!",
      game: activeGame,
      updatedWalletBalance: user.wallet,
    });
  } catch (error) {
    console.error("Error uploading game data:", error);
    return res.status(500).json({ message: "Failed to upload game data.", error: error.message });
  }
};
//for 10 cards
export const placeBetTwo = async (req, res) => {
  const { ticketsID, cards, GameId } = req.body;
  // const { user } = req.params; // Get adminId from URL params
  // console.log(adminId);
  
  try {
    let user = req.user;

    if (!user) {
      return res.status(404).json({ message: 'User not authenticated!' });
    }

    // Calculate the total bet amount from all the cards
    let totalAmount = 0;
    if (Array.isArray(cards)) {
      cards.forEach((card) => {
        if (card.Amount) {
          totalAmount += card.Amount; // Accumulate the amount from each card
        }
      });
    }

    // Check if user has sufficient balance
    if (user.wallet < totalAmount) {
      return res.status(400).json({ message: 'Insufficient balance in wallet!' });
    }

    // Check if there is an active game with the given GameId
    const activeGame = await GameTwo.findOne({ GameId: GameId });
    if (!activeGame) {
      return res.status(404).json({ message: 'Game not found!' });
    }

    // Create a new bet entry (gameDetails) to be pushed into the Bets array
    const newBet = {
      userID: user.userId,  // Identify the user by adminId or subAdminId
      ticketsID: ticketsID,
      card: [],
      ticketTime: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }), // Indian Standard Time (IST)
    };

    // Loop through the cards array and add each card to the newBet
    if (Array.isArray(cards)) {
      cards.forEach((card) => {
        if (card.cardNo && card.Amount) {
          // Ensure cardNo and Amount are provided
          newBet.card.push({
            cardNo: card.cardNo,
            Amount: card.Amount,
          });
        }
      });
    }

    // Add the new bet to the Bets array of the game
    activeGame.Bets.push(newBet);

    // Deduct the total bet amount from user's wallet
    user.wallet -= totalAmount;

    // Save the updated game and user wallet
    await Promise.all([activeGame.save(), user.save()]);

    return res.status(200).json({
      message: "Game data successfully uploaded and bet placed successfully!",
      game: activeGame,
      updatedWalletBalance: user.wallet,
    });
  } catch (error) {
    console.error("Error uploading game data:", error);
    return res.status(500).json({ message: "Failed to upload game data.", error: error.message });
  }
};
//for 10 cards
export const placeBetThree = async (req, res) => {
  const { ticketsID, cards, GameId } = req.body;
  // const { user } = req.params; // Get adminId from URL params
  // console.log(adminId);
  
  try {
    let user = req.user;

    if (!user) {
      return res.status(404).json({ message: 'User not authenticated!' });
    }

    // Calculate the total bet amount from all the cards
    let totalAmount = 0;
    if (Array.isArray(cards)) {
      cards.forEach((card) => {
        if (card.Amount) {
          totalAmount += card.Amount; // Accumulate the amount from each card
        }
      });
    }

    // Check if user has sufficient balance
    if (user.wallet < totalAmount) {
      return res.status(400).json({ message: 'Insufficient balance in wallet!' });
    }

    // Check if there is an active game with the given GameId
    const activeGame = await GameThree.findOne({ GameId: GameId });
    if (!activeGame) {
      return res.status(404).json({ message: 'Game not found!' });
    }

    // Create a new bet entry (gameDetails) to be pushed into the Bets array
    const newBet = {
      userID: user.userId,  // Identify the user by adminId or subAdminId
      ticketsID: ticketsID,
      card: [],
      ticketTime: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }), // Indian Standard Time (IST)
    };

    // Loop through the cards array and add each card to the newBet
    if (Array.isArray(cards)) {
      cards.forEach((card) => {
        if (card.cardNo && card.Amount) {
          // Ensure cardNo and Amount are provided
          newBet.card.push({
            cardNo: card.cardNo,
            Amount: card.Amount,
          });
        }
      });
    }

    // Add the new bet to the Bets array of the game
    activeGame.Bets.push(newBet);

    // Deduct the total bet amount from user's wallet
    user.wallet -= totalAmount;

    // Save the updated game and user wallet
    await Promise.all([activeGame.save(), user.save()]);

    return res.status(200).json({
      message: "Game data successfully uploaded and bet placed successfully!",
      game: activeGame,
      updatedWalletBalance: user.wallet,
    });
  } catch (error) {
    console.error("Error uploading game data:", error);
    return res.status(500).json({ message: "Failed to upload game data.", error: error.message });
  }
};

// Latest have to do 3 times
//for 16 cards
export const getAdminLatestBetsOne = async (req, res) => {
  const { userId, type } = req.params;

  try {
    // Find user based on type
    let user = await User.findOne({ subAdminId: userId });;
    // if (type === 'subAdmin') {
    //   user = await SubAdmin.findOne({ subAdminId: userId });
    // } else {
    //   user = await Admin.findOne({ adminId: userId });
    // }
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: `User not found!` 
      });
    }

    // Find the latest game that contains bets from this user
    const latestGame = await GameOne.findOne().sort({ _id: -1 });

    if (!latestGame) {
      return res.status(404).json({ 
        success: false,
        message: "No bets found",
        userId: userId,
      });
    }

    // Filter bets to only include those from this user
    const userBets = latestGame.Bets.filter(bet => 
      bet.adminID === userId
    );

    console.log(userBets);
    

    if (userBets.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No bets found for this User`,
        userId: userId,
      });
    }

    // Calculate total bet amount for this game
    const totalGameAmount = userBets.reduce((total, bet) => 
      total + bet.card.reduce((sum, card) => sum + card.Amount, 0), 0
    );

    return res.status(200).json({
      success: true,
      userId: userId,
      currentWalletBalance: user.wallet,
      gameDetails: {
        gameId: latestGame.GameId,
        gameDate: latestGame.Date,
        totalBets: userBets.length,
        totalAmount: totalGameAmount,
        bets: userBets.map(bet => ({
          ticketsID: bet.ticketsID,
          ticketTime: bet.ticketTime,
          cards: bet.card.map(card => ({
            cardNo: card.cardNo,
            amount: card.Amount
          }))
        }))
      }
    });

  } catch (error) {
    console.error(`Error fetching User's latest game bets:`, error);
    return res.status(500).json({ 
      success: false,
      message: `Failed to fetch User's latest game bet data`,
      error: error.message 
    });
  }
};
//for 10 cards
export const getAdminLatestBetsTwo = async (req, res) => {
  const { userId, type } = req.params;

  try {
    // Find user based on type
    let user = await User.findOne({ subAdminId: userId });;
    // if (type === 'subAdmin') {
    //   user = await SubAdmin.findOne({ subAdminId: userId });
    // } else {
    //   user = await Admin.findOne({ adminId: userId });
    // }
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: `User not found!` 
      });
    }

    // Find the latest game that contains bets from this user
    const latestGame = await GameTwo.findOne().sort({ _id: -1 });

    if (!latestGame) {
      return res.status(404).json({ 
        success: false,
        message: "No bets found",
        userId: userId,
      });
    }

    // Filter bets to only include those from this user
    const userBets = latestGame.Bets.filter(bet => 
      bet.adminID === userId
    );

    console.log(userBets);
    

    if (userBets.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No bets found for this User`,
        userId: userId,
      });
    }

    // Calculate total bet amount for this game
    const totalGameAmount = userBets.reduce((total, bet) => 
      total + bet.card.reduce((sum, card) => sum + card.Amount, 0), 0
    );

    return res.status(200).json({
      success: true,
      userId: userId,
      currentWalletBalance: user.wallet,
      gameDetails: {
        gameId: latestGame.GameId,
        gameDate: latestGame.Date,
        totalBets: userBets.length,
        totalAmount: totalGameAmount,
        bets: userBets.map(bet => ({
          ticketsID: bet.ticketsID,
          ticketTime: bet.ticketTime,
          cards: bet.card.map(card => ({
            cardNo: card.cardNo,
            amount: card.Amount
          }))
        }))
      }
    });

  } catch (error) {
    console.error(`Error fetching User's latest game bets:`, error);
    return res.status(500).json({ 
      success: false,
      message: `Failed to fetch User's latest game bet data`,
      error: error.message 
    });
  }
};
//for 10 cards
export const getAdminLatestBetsThree = async (req, res) => {
  const { userId, type } = req.params;

  try {
    // Find user based on type
    let user = await User.findOne({ subAdminId: userId });;
    // if (type === 'subAdmin') {
    //   user = await SubAdmin.findOne({ subAdminId: userId });
    // } else {
    //   user = await Admin.findOne({ adminId: userId });
    // }
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: `User not found!` 
      });
    }

    // Find the latest game that contains bets from this user
    const latestGame = await GameThree.findOne().sort({ _id: -1 });

    if (!latestGame) {
      return res.status(404).json({ 
        success: false,
        message: "No bets found",
        userId: userId,
      });
    }

    // Filter bets to only include those from this user
    const userBets = latestGame.Bets.filter(bet => 
      bet.adminID === userId
    );

    console.log(userBets);
    

    if (userBets.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No bets found for this User`,
        userId: userId,
      });
    }

    // Calculate total bet amount for this game
    const totalGameAmount = userBets.reduce((total, bet) => 
      total + bet.card.reduce((sum, card) => sum + card.Amount, 0), 0
    );

    return res.status(200).json({
      success: true,
      userId: userId,
      currentWalletBalance: user.wallet,
      gameDetails: {
        gameId: latestGame.GameId,
        gameDate: latestGame.Date,
        totalBets: userBets.length,
        totalAmount: totalGameAmount,
        bets: userBets.map(bet => ({
          ticketsID: bet.ticketsID,
          ticketTime: bet.ticketTime,
          cards: bet.card.map(card => ({
            cardNo: card.cardNo,
            amount: card.Amount
          }))
        }))
      }
    });

  } catch (error) {
    console.error(`Error fetching User's latest game bets:`, error);
    return res.status(500).json({ 
      success: false,
      message: `Failed to fetch User's latest game bet data`,
      error: error.message 
    });
  }
};

// Latest have to do 3 times
//for 16 cards
export const deleteBetByTicketIdOne = async (req, res) => {
  const { ticketId } = req.params;

  try {
    // Step 1: Find the game and bet containing the ticket
    const game = await GameOne.findOne({ "Bets.ticketsID": ticketId });
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: `Bet does not exist for Ticket ID ${ticketId}`
      });
    }

    // Step 2: Find the bet with the given ticketId
    const bet = game.Bets.find(bet => bet.ticketsID === ticketId);
    if (!bet) {
      return res.status(404).json({
        success: false,
        message: `Bet not found for Ticket ID ${ticketId}`
      });
    }

    // Extract adminId and type from the bet
    const { adminID } = bet;
    const totalAmount = bet.card.reduce((sum, card) => sum + card.Amount, 0);

    // Step 3: Delete the bet from the game
    const result = await GameOne.findOneAndUpdate(
      { "Bets.ticketsID": ticketId },
      { $pull: { Bets: { ticketsID: ticketId } } },
      { new: true }
    );

    let updatedWallet;

      // Update User's wallet
      const updatedSubAdmin = await User.findOneAndUpdate(
        { userId: adminID },
        { $inc: { wallet: totalAmount } },
        { new: true }
      );
      
      if (!updatedSubAdmin) {
        return res.status(404).json({
          success: false,
          message: "SubAdmin not found"
        });
      }
      
      updatedWallet = updatedSubAdmin.wallet;

    // Return the updated wallet amount in the response
    return res.status(200).json({
      success: true,
      message: `Delete successful for Ticket ID ${ticketId}`,
      deletedFromGame: result.GameId,
      updatedAdminWallet: updatedWallet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in deleting Bet",
      error: error.message
    });
  }
};
//for 10 cards
export const deleteBetByTicketIdTwo = async (req, res) => {
  const { ticketId } = req.params;

  try {
    // Step 1: Find the game and bet containing the ticket
    const game = await GameTwo.findOne({ "Bets.ticketsID": ticketId });
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: `Bet does not exist for Ticket ID ${ticketId}`
      });
    }

    // Step 2: Find the bet with the given ticketId
    const bet = game.Bets.find(bet => bet.ticketsID === ticketId);
    if (!bet) {
      return res.status(404).json({
        success: false,
        message: `Bet not found for Ticket ID ${ticketId}`
      });
    }

    // Extract adminId and type from the bet
    const { adminID } = bet;
    const totalAmount = bet.card.reduce((sum, card) => sum + card.Amount, 0);

    // Step 3: Delete the bet from the game
    const result = await GameTwo.findOneAndUpdate(
      { "Bets.ticketsID": ticketId },
      { $pull: { Bets: { ticketsID: ticketId } } },
      { new: true }
    );

    let updatedWallet;

      // Update User's wallet
      const updatedSubAdmin = await User.findOneAndUpdate(
        { userId: adminID },
        { $inc: { wallet: totalAmount } },
        { new: true }
      );
      
      if (!updatedSubAdmin) {
        return res.status(404).json({
          success: false,
          message: "SubAdmin not found"
        });
      }
      
      updatedWallet = updatedSubAdmin.wallet;

    // Return the updated wallet amount in the response
    return res.status(200).json({
      success: true,
      message: `Delete successful for Ticket ID ${ticketId}`,
      deletedFromGame: result.GameId,
      updatedAdminWallet: updatedWallet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in deleting Bet",
      error: error.message
    });
  }
};
//for 10 cards
export const deleteBetByTicketIdThree = async (req, res) => {
  const { ticketId } = req.params;

  try {
    // Step 1: Find the game and bet containing the ticket
    const game = await GameThree.findOne({ "Bets.ticketsID": ticketId });
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: `Bet does not exist for Ticket ID ${ticketId}`
      });
    }

    // Step 2: Find the bet with the given ticketId
    const bet = game.Bets.find(bet => bet.ticketsID === ticketId);
    if (!bet) {
      return res.status(404).json({
        success: false,
        message: `Bet not found for Ticket ID ${ticketId}`
      });
    }

    // Extract adminId and type from the bet
    const { adminID } = bet;
    const totalAmount = bet.card.reduce((sum, card) => sum + card.Amount, 0);

    // Step 3: Delete the bet from the game
    const result = await GameThree.findOneAndUpdate(
      { "Bets.ticketsID": ticketId },
      { $pull: { Bets: { ticketsID: ticketId } } },
      { new: true }
    );

    let updatedWallet;

      // Update User's wallet
      const updatedSubAdmin = await User.findOneAndUpdate(
        { userId: adminID },
        { $inc: { wallet: totalAmount } },
        { new: true }
      );
      
      if (!updatedSubAdmin) {
        return res.status(404).json({
          success: false,
          message: "SubAdmin not found"
        });
      }
      
      updatedWallet = updatedSubAdmin.wallet;

    // Return the updated wallet amount in the response
    return res.status(200).json({
      success: true,
      message: `Delete successful for Ticket ID ${ticketId}`,
      deletedFromGame: result.GameId,
      updatedAdminWallet: updatedWallet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in deleting Bet",
      error: error.message
    });
  }
};

// Latest have to do 3 times
//for 16 cards
const calculateAdminResultsOne = async (game, winningCard) => {
  const winnerMultiplier = {
    1: 10,
    2: 20,
    3: 30,
    4: 40,
    5: 50,
    6: 60,
    7: 70,
    8: 80,
    9: 90,
    10: 100,
  };
  const adminResults = {
    winners: [],
    losers: [],
  };
  for (const bet of game.Bets) {
    const user = await User.findOne({ userId: bet.adminID });
    if (!user) continue;
    let adminResult = {
      userId: bet.adminID,
      gameId: game.GameId,
      betAmount: 0,
      winAmount: 0,
      winningCardAmount: 0,
      ticketsID: bet.ticketsID,
      ticketTime: bet.ticketTime,
      status: "lose", // Default status
    };
    for (const card of bet.card) {
      adminResult.betAmount += card.Amount;
      if (card.cardNo === winningCard.cardId) {
        adminResult.winningCardAmount = card.Amount;
        const multiplier = winnerMultiplier[winningCard.multiplier] || 1;
        adminResult.winAmount = card.Amount * multiplier;
        adminResult.ticketsID = bet.ticketsID;
        (adminResult.ticketTime = bet.ticketTime), (adminResult.status = "win"); // Update status if it's a winning card
      }
    }
    if (adminResult.status === "win") {
      adminResults.winners.push(adminResult);
    } else {
      adminResults.losers.push(adminResult);
    }
  }

  return adminResults;
};
//for 10 cards
const calculateAdminResultsTwo = async (game, winningCard) => {
  const winnerMultiplier = {
    1: 10,
    2: 20,
    3: 30,
    4: 40,
    5: 50,
    6: 60,
    7: 70,
    8: 80,
    9: 90,
    10: 100,
  };
  const adminResults = {
    winners: [],
    losers: [],
  };
  for (const bet of game.Bets) {
    const user = await User.findOne({ userId: bet.adminID });
    if (!user) continue;
    let adminResult = {
      userId: bet.adminID,
      gameId: game.GameId,
      betAmount: 0,
      winAmount: 0,
      winningCardAmount: 0,
      ticketsID: bet.ticketsID,
      ticketTime: bet.ticketTime,
      status: "lose", // Default status
    };
    for (const card of bet.card) {
      adminResult.betAmount += card.Amount;
      if (card.cardNo === winningCard.cardId) {
        adminResult.winningCardAmount = card.Amount;
        const multiplier = winnerMultiplier[winningCard.multiplier] || 1;
        adminResult.winAmount = card.Amount * multiplier;
        adminResult.ticketsID = bet.ticketsID;
        (adminResult.ticketTime = bet.ticketTime), (adminResult.status = "win"); // Update status if it's a winning card
      }
    }
    if (adminResult.status === "win") {
      adminResults.winners.push(adminResult);
    } else {
      adminResults.losers.push(adminResult);
    }
  }

  return adminResults;
};
//for 10 cards
const calculateAdminResultsThree = async (game, winningCard) => {
  const winnerMultiplier = {
    1: 10,
    2: 20,
    3: 30,
    4: 40,
    5: 50,
    6: 60,
    7: 70,
    8: 80,
    9: 90,
    10: 100,
  };
  const adminResults = {
    winners: [],
    losers: [],
  };
  for (const bet of game.Bets) {
    const user = await User.findOne({ userId: bet.adminID });
    if (!user) continue;
    let adminResult = {
      userId: bet.adminID,
      gameId: game.GameId,
      betAmount: 0,
      winAmount: 0,
      winningCardAmount: 0,
      ticketsID: bet.ticketsID,
      ticketTime: bet.ticketTime,
      status: "lose", // Default status
    };
    for (const card of bet.card) {
      adminResult.betAmount += card.Amount;
      if (card.cardNo === winningCard.cardId) {
        adminResult.winningCardAmount = card.Amount;
        const multiplier = winnerMultiplier[winningCard.multiplier] || 1;
        adminResult.winAmount = card.Amount * multiplier;
        adminResult.ticketsID = bet.ticketsID;
        (adminResult.ticketTime = bet.ticketTime), (adminResult.status = "win"); // Update status if it's a winning card
      }
    }
    if (adminResult.status === "win") {
      adminResults.winners.push(adminResult);
    } else {
      adminResults.losers.push(adminResult);
    }
  }

  return adminResults;
};

// Latest have to do 3 times
//for 16 cards
export const getAdminGameResultsOne = async (gameId, adminResults) => {
  try {
    const game = await GameOne.findOne({ GameId: gameId }).lean();
    if (!game) {
      return { message: "Game not found" };
    }
    const selectedCard = await SelectedCardOne.findOne({ gameId: gameId }).lean();
    if (!selectedCard) {
      return { message: "Selected card not found for this game" };
    }

    // Save results to MongoDB
    const newAdminGameResult = new AdminGameResultOne({
      gameId: game.GameId,
      winningCard: {
        cardId: selectedCard.cardId,
        multiplier: selectedCard.multiplier,
        amount: selectedCard.amount,
        Drowtime: selectedCard.drowTime,
      },
      winners: adminResults.winners,
      losers: adminResults.losers,
    });
    await newAdminGameResult.save();
    return {
      success: true,
      message: "Admin game results calculated and saved successfully",
      data: {
        gameId: game.GameId,
        winningCard: selectedCard,
        adminResults: adminResults,
      },
    };
  } catch (error) {
    console.error("Error processing and saving admin game results:", error);
    return {
      success: false,
      message: "Error processing and saving admin game results",
      error: error.message,
    };
  }
};
//for 10 cards
export const getAdminGameResultsTwo = async (gameId, adminResults) => {
  try {
    const game = await GameTwo.findOne({ GameId: gameId }).lean();
    if (!game) {
      return { message: "Game not found" };
    }
    const selectedCard = await SelectedCardTwo.findOne({ gameId: gameId }).lean();
    if (!selectedCard) {
      return { message: "Selected card not found for this game" };
    }

    // Save results to MongoDB
    const newAdminGameResult = new AdminGameResultTwo({
      gameId: game.GameId,
      winningCard: {
        cardId: selectedCard.cardId,
        multiplier: selectedCard.multiplier,
        amount: selectedCard.amount,
        Drowtime: selectedCard.drowTime,
      },
      winners: adminResults.winners,
      losers: adminResults.losers,
    });
    await newAdminGameResult.save();
    return {
      success: true,
      message: "Admin game results calculated and saved successfully",
      data: {
        gameId: game.GameId,
        winningCard: selectedCard,
        adminResults: adminResults,
      },
    };
  } catch (error) {
    console.error("Error processing and saving admin game results:", error);
    return {
      success: false,
      message: "Error processing and saving admin game results",
      error: error.message,
    };
  }
};
//for 10 cards
export const getAdminGameResultsThree = async (gameId, adminResults) => {
  try {
    const game = await GameThree.findOne({ GameId: gameId }).lean();
    if (!game) {
      return { message: "Game not found" };
    }
    const selectedCard = await SelectedCardTree.findOne({ gameId: gameId }).lean();
    if (!selectedCard) {
      return { message: "Selected card not found for this game" };
    }

    // Save results to MongoDB
    const newAdminGameResult = new AdminGameResultThree({
      gameId: game.GameId,
      winningCard: {
        cardId: selectedCard.cardId,
        multiplier: selectedCard.multiplier,
        amount: selectedCard.amount,
        Drowtime: selectedCard.drowTime,
      },
      winners: adminResults.winners,
      losers: adminResults.losers,
    });
    await newAdminGameResult.save();
    return {
      success: true,
      message: "Admin game results calculated and saved successfully",
      data: {
        gameId: game.GameId,
        winningCard: selectedCard,
        adminResults: adminResults,
      },
    };
  } catch (error) {
    console.error("Error processing and saving admin game results:", error);
    return {
      success: false,
      message: "Error processing and saving admin game results",
      error: error.message,
    };
  }
};

// Latest have to do 3 times
//for 16 cards
export const claimWinningsOne = async (req, res) => {
  try {
    const { userId, gameId, ticketsID } = req.body;

    let user = await User.findOne({ userId });
    if(!user) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const gameResult = await AdminGameResultOne.findOne({ gameId });
    if(!gameResult) {
      return res.status(404).json({
        success: false,
        message: "Game result not found",
      });
    }

     // Check if the user is a winner in this game and has the specified ticket
    const winner = gameResult.winners.find(
      (w) => w.adminId === userId && w.ticketsID === ticketsID
    );

    if (!winner) {
      return res.status(400).json({
        success: false,
        message: `User is not a winner with the specified ticket in this game`,
      });
    }

    // Check if the ticket has already been claimed
    if (winner.status === "claimed") {
      return res.status(400).json({
        success: false,
        message: "This ticket has already been claimed",
      });
    }

    // Update user's wallet
    user.wallet += winner.winAmount;
    await user.save();

    // Mark the ticket as claimed
    winner.status = "claimed";
    await gameResult.save();

    res.status(200).json({
      success: true,
      message: "Winnings claimed successfully",
      data: {
        adminID:  user.userId,
        gameId: gameResult.gameId,
        ticketId: winner.ticketId,
        claimedAmount: winner.winAmount,
        newWalletBalance: user.wallet,
      },
    });
  } catch (error) {
    console.error("Error claiming winnings:", error);
    res.status(500).json({
      success: false,
      message: "Error claiming winnings",
      error: error.message,
    });
  }
};
//for 10 cards
export const claimWinningsTwo = async (req, res) => {
  try {
    const { userId, gameId, ticketsID } = req.body;

    let user = await User.findOne({ userId });
    if(!user) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const gameResult = await AdminGameResultTwo.findOne({ gameId });
    if(!gameResult) {
      return res.status(404).json({
        success: false,
        message: "Game result not found",
      });
    }

     // Check if the user is a winner in this game and has the specified ticket
    const winner = gameResult.winners.find(
      (w) => w.adminId === userId && w.ticketsID === ticketsID
    );

    if (!winner) {
      return res.status(400).json({
        success: false,
        message: `User is not a winner with the specified ticket in this game`,
      });
    }

    // Check if the ticket has already been claimed
    if (winner.status === "claimed") {
      return res.status(400).json({
        success: false,
        message: "This ticket has already been claimed",
      });
    }

    // Update user's wallet
    user.wallet += winner.winAmount;
    await user.save();

    // Mark the ticket as claimed
    winner.status = "claimed";
    await gameResult.save();

    res.status(200).json({
      success: true,
      message: "Winnings claimed successfully",
      data: {
        adminID:  user.userId,
        gameId: gameResult.gameId,
        ticketId: winner.ticketId,
        claimedAmount: winner.winAmount,
        newWalletBalance: user.wallet,
      },
    });
  } catch (error) {
    console.error("Error claiming winnings:", error);
    res.status(500).json({
      success: false,
      message: "Error claiming winnings",
      error: error.message,
    });
  }
};
//for 10 cards
export const claimWinningsThree = async (req, res) => {
  try {
    const { userId, gameId, ticketsID } = req.body;

    let user = await User.findOne({ userId });
    if(!user) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const gameResult = await AdminGameResultThree.findOne({ gameId });
    if(!gameResult) {
      return res.status(404).json({
        success: false,
        message: "Game result not found",
      });
    }

     // Check if the user is a winner in this game and has the specified ticket
    const winner = gameResult.winners.find(
      (w) => w.adminId === userId && w.ticketsID === ticketsID
    );

    if (!winner) {
      return res.status(400).json({
        success: false,
        message: `User is not a winner with the specified ticket in this game`,
      });
    }

    // Check if the ticket has already been claimed
    if (winner.status === "claimed") {
      return res.status(400).json({
        success: false,
        message: "This ticket has already been claimed",
      });
    }

    // Update user's wallet
    user.wallet += winner.winAmount;
    await user.save();

    // Mark the ticket as claimed
    winner.status = "claimed";
    await gameResult.save();

    res.status(200).json({
      success: true,
      message: "Winnings claimed successfully",
      data: {
        adminID:  user.userId,
        gameId: gameResult.gameId,
        ticketId: winner.ticketId,
        claimedAmount: winner.winAmount,
        newWalletBalance: user.wallet,
      },
    });
  } catch (error) {
    console.error("Error claiming winnings:", error);
    res.status(500).json({
      success: false,
      message: "Error claiming winnings",
      error: error.message,
    });
  }
};

// Latest have to do 3 times
//for 16 cards
export const claimAllWinningsOne = async (req, res) => {
  try {
    const { adminId } = req.params;
    let user;
    let totalClaimedAmount = 0;
    const claimedGames = [];

      const admin = await User.findOne({ adminId });
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Find all game results with unclaimed winnings for this admin
      const gameResults = await AdminGameResultOne.find({
        "winners.adminId": adminId,
        "winners.status": "win",
      });

      // Process each game result
      for (const game of gameResults) {
        const adminWinners = game.winners.filter(
          (winner) => winner.adminId === adminId && winner.status === "win"
        );

        for (const winner of adminWinners) {
          // Update winner status to claimed
          winner.status = "claimed";
          totalClaimedAmount += winner.winAmount;

          claimedGames.push({
            gameId: game.gameId,
            ticketsID: winner.ticketsID,
            winAmount: winner.winAmount,
          });
        }

        await game.save();
      }

      // Update admin's wallet with total claimed amount
      if (totalClaimedAmount > 0) {
        admin.wallet += totalClaimedAmount;
        await admin.save();
      }

      user = admin; // Set user to admin


    return res.status(200).json({
      success: true,
      message: `User winnings claimed successfully`,
      data: {
        adminID: user.userId, // Return the user ID based on type
        totalClaimedAmount,
        claimedGames,
        newWalletBalance: user.wallet,
      },
    });
  } catch (error) {
    console.error("Error claiming all winnings:", error);
    return res.status(500).json({
      success: false,
      message: "Error claiming all winnings",
      error: error.message,
    });
  }
};
//for 10 cards
export const claimAllWinningsTwo = async (req, res) => {
  try {
    const { adminId } = req.params;
    let user;
    let totalClaimedAmount = 0;
    const claimedGames = [];

      const admin = await User.findOne({ adminId });
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Find all game results with unclaimed winnings for this admin
      const gameResults = await AdminGameResultTwo.find({
        "winners.adminId": adminId,
        "winners.status": "win",
      });

      // Process each game result
      for (const game of gameResults) {
        const adminWinners = game.winners.filter(
          (winner) => winner.adminId === adminId && winner.status === "win"
        );

        for (const winner of adminWinners) {
          // Update winner status to claimed
          winner.status = "claimed";
          totalClaimedAmount += winner.winAmount;

          claimedGames.push({
            gameId: game.gameId,
            ticketsID: winner.ticketsID,
            winAmount: winner.winAmount,
          });
        }

        await game.save();
      }

      // Update admin's wallet with total claimed amount
      if (totalClaimedAmount > 0) {
        admin.wallet += totalClaimedAmount;
        await admin.save();
      }

      user = admin; // Set user to admin


    return res.status(200).json({
      success: true,
      message: `User winnings claimed successfully`,
      data: {
        adminID: user.userId, // Return the user ID based on type
        totalClaimedAmount,
        claimedGames,
        newWalletBalance: user.wallet,
      },
    });
  } catch (error) {
    console.error("Error claiming all winnings:", error);
    return res.status(500).json({
      success: false,
      message: "Error claiming all winnings",
      error: error.message,
    });
  }
};
//for 10 cards
export const claimAllWinningsThree = async (req, res) => {
  try {
    const { adminId } = req.params;
    let user;
    let totalClaimedAmount = 0;
    const claimedGames = [];

      const admin = await User.findOne({ adminId });
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Find all game results with unclaimed winnings for this admin
      const gameResults = await AdminGameResultThree.find({
        "winners.adminId": adminId,
        "winners.status": "win",
      });

      // Process each game result
      for (const game of gameResults) {
        const adminWinners = game.winners.filter(
          (winner) => winner.adminId === adminId && winner.status === "win"
        );

        for (const winner of adminWinners) {
          // Update winner status to claimed
          winner.status = "claimed";
          totalClaimedAmount += winner.winAmount;

          claimedGames.push({
            gameId: game.gameId,
            ticketsID: winner.ticketsID,
            winAmount: winner.winAmount,
          });
        }

        await game.save();
      }

      // Update admin's wallet with total claimed amount
      if (totalClaimedAmount > 0) {
        admin.wallet += totalClaimedAmount;
        await admin.save();
      }

      user = admin; // Set user to admin


    return res.status(200).json({
      success: true,
      message: `User winnings claimed successfully`,
      data: {
        adminID: user.userId, // Return the user ID based on type
        totalClaimedAmount,
        claimedGames,
        newWalletBalance: user.wallet,
      },
    });
  } catch (error) {
    console.error("Error claiming all winnings:", error);
    return res.status(500).json({
      success: false,
      message: "Error claiming all winnings",
      error: error.message,
    });
  }
};

// Latest have to do 3 times
//for 16 cards
export const getLatestSelectedCardsOne = async (req, res) => {
  try {
    // Retrieve latest 10 selected cards from the database
    // Using sort({_id: -1}) to sort in descending order (newest first)
    // limit(10) to get only 10 records
    const latestSelectedCards = await SelectedCardOne.find()
      .sort({ _id: -1 })
      .limit(10);

    // Send the selected cards as a response
    res.status(200).json({
      success: true,
      data: latestSelectedCards,
    });
  } catch (error) {
    console.error("Error fetching latest selected cards:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching latest selected cards",
    });
  }
};
//for 10 cards
export const getLatestSelectedCardsTwo = async (req, res) => {
  try {
    // Retrieve latest 10 selected cards from the database
    // Using sort({_id: -1}) to sort in descending order (newest first)
    // limit(10) to get only 10 records
    const latestSelectedCards = await SelectedCardTwo.find()
      .sort({ _id: -1 })
      .limit(10);

    // Send the selected cards as a response
    res.status(200).json({
      success: true,
      data: latestSelectedCards,
    });
  } catch (error) {
    console.error("Error fetching latest selected cards:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching latest selected cards",
    });
  }
};
//for 10 cards
export const getLatestSelectedCardsThree = async (req, res) => {
  try {
    // Retrieve latest 10 selected cards from the database
    // Using sort({_id: -1}) to sort in descending order (newest first)
    // limit(10) to get only 10 records
    const latestSelectedCards = await SelectedCardThree.find()
      .sort({ _id: -1 })
      .limit(10);

    // Send the selected cards as a response
    res.status(200).json({
      success: true,
      data: latestSelectedCards,
    });
  } catch (error) {
    console.error("Error fetching latest selected cards:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching latest selected cards",
    });
  }
};

// Latest have to do 3 times
//for 16 cards
export const getAdminGameResultOne = async (req, res) => {
  try {
    const result = await AdminGameResultOne.findOne();
    // console.log(result);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error retrieving admin game results:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving admin game results",
      error: error.message,
    });
  }
};
//for 10 cards
export const getAdminGameResultTwo = async (req, res) => {
  try {
    const result = await AdminGameResultTwo.findOne();
    // console.log(result);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error retrieving admin game results:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving admin game results",
      error: error.message,
    });
  }
};
//for 10 cards
export const getAdminGameResultThree = async (req, res) => {
  try {
    const result = await AdminGameResultThree.findOne();
    // console.log(result);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error retrieving admin game results:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving admin game results",
      error: error.message,
    });
  }
};

// Latest have to do 3 times
//for 16 cards
export const getAdminResultsOne = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user based on type
    let user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found`,
      });
    }

    // Create query condition based on user type
    const queryCondition = 'user' 
      ? { $or: [{ "winners.userId": userId }, { "losers.userId": userId }] }
      : { $or: [{ "winners.adminId": userId }, { "losers.adminId": userId }] };

    // Find all game results for this user
    const gameResults = await AdminGameResultOne.find(queryCondition)
      .sort({ createdAt: -1 }); // Sort by most recent games first

    // Process the results to only include this user's data
    const processedResults = gameResults.map((gameResult) => {
      // Find user data in winners or losers based on type
      const userData = 'user'
        ? gameResult.winners.find((winner) => winner.userId === userId) ||
          gameResult.losers.find((loser) => loser.userId === userId)
        : gameResult.winners.find((winner) => winner.adminId === userId) ||
          gameResult.losers.find((loser) => loser.adminId === userId);

      // Determine if user is in winners array
      const isWinner = 'user'
        ? gameResult.winners.some(winner => winner.userId === userId)
        : gameResult.winners.some(winner => winner.adminId === userId);

      return {
        gameId: gameResult.gameId,
        userResult: {
          userData: userData._doc,
          status: isWinner ? "win" : "lose"
        },
        playedAt: gameResult.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      message: `User game results retrieved successfully`,
      data: {
        userId: userId,
        gameResults: processedResults,
      },
    });

  } catch (error) {
    console.error(`Error retrieving ${req.params.type} game results:`, error);
    res.status(500).json({
      success: false,
      message: `Error retrieving ${req.params.type} game results`,
      error: error.message,
    });
  }
};
//for 10 cards
export const getAdminResultsTwo = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user based on type
    let user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found`,
      });
    }

    // Create query condition based on user type
    const queryCondition = 'user' 
      ? { $or: [{ "winners.userId": userId }, { "losers.userId": userId }] }
      : { $or: [{ "winners.adminId": userId }, { "losers.adminId": userId }] };

    // Find all game results for this user
    const gameResults = await AdminGameResultTwo.find(queryCondition)
      .sort({ createdAt: -1 }); // Sort by most recent games first

    // Process the results to only include this user's data
    const processedResults = gameResults.map((gameResult) => {
      // Find user data in winners or losers based on type
      const userData = 'user'
        ? gameResult.winners.find((winner) => winner.userId === userId) ||
          gameResult.losers.find((loser) => loser.userId === userId)
        : gameResult.winners.find((winner) => winner.adminId === userId) ||
          gameResult.losers.find((loser) => loser.adminId === userId);

      // Determine if user is in winners array
      const isWinner = 'user'
        ? gameResult.winners.some(winner => winner.userId === userId)
        : gameResult.winners.some(winner => winner.adminId === userId);

      return {
        gameId: gameResult.gameId,
        userResult: {
          userData: userData._doc,
          status: isWinner ? "win" : "lose"
        },
        playedAt: gameResult.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      message: `User game results retrieved successfully`,
      data: {
        userId: userId,
        gameResults: processedResults,
      },
    });

  } catch (error) {
    console.error(`Error retrieving ${req.params.type} game results:`, error);
    res.status(500).json({
      success: false,
      message: `Error retrieving ${req.params.type} game results`,
      error: error.message,
    });
  }
};
//for 10 cards
export const getAdminResultsThree = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user based on type
    let user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found`,
      });
    }

    // Create query condition based on user type
    const queryCondition = 'user' 
      ? { $or: [{ "winners.userId": userId }, { "losers.userId": userId }] }
      : { $or: [{ "winners.adminId": userId }, { "losers.adminId": userId }] };

    // Find all game results for this user
    const gameResults = await AdminGameResultThree.find(queryCondition)
      .sort({ createdAt: -1 }); // Sort by most recent games first

    // Process the results to only include this user's data
    const processedResults = gameResults.map((gameResult) => {
      // Find user data in winners or losers based on type
      const userData = 'user'
        ? gameResult.winners.find((winner) => winner.userId === userId) ||
          gameResult.losers.find((loser) => loser.userId === userId)
        : gameResult.winners.find((winner) => winner.adminId === userId) ||
          gameResult.losers.find((loser) => loser.adminId === userId);

      // Determine if user is in winners array
      const isWinner = 'user'
        ? gameResult.winners.some(winner => winner.userId === userId)
        : gameResult.winners.some(winner => winner.adminId === userId);

      return {
        gameId: gameResult.gameId,
        userResult: {
          userData: userData._doc,
          status: isWinner ? "win" : "lose"
        },
        playedAt: gameResult.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      message: `User game results retrieved successfully`,
      data: {
        userId: userId,
        gameResults: processedResults,
      },
    });

  } catch (error) {
    console.error(`Error retrieving ${req.params.type} game results:`, error);
    res.status(500).json({
      success: false,
      message: `Error retrieving ${req.params.type} game results`,
      error: error.message,
    });
  }
};

// Latest have to do 3 times
//for 16 cards
export const getTotalWinningsOne = async (req, res) => {
  try {
    const { userId } = req.params;
    const { from, to } = req.query;

    // Check if authenticated admin matches the requested adminId
    if (req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Build query based on date range if provided
    let query = {};
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      query.createdAt = {
        $gte: fromDate,
        $lte: toDate,
      };
    }

    // Find all game results
    const gameResults = await AdminGameResultOne.find(query);

    let totalWinnings = 0;
    let winningGames = [];

    // Calculate total winnings and collect winning games
    gameResults.forEach((game) => {
      const adminWinners = game.winners.filter(
        (winner) => winner.adminId === userId && winner.status === "win"
      );

      adminWinners.forEach((winner) => {
        totalWinnings += winner.winAmount;
        winningGames.push({
          gameId: game.gameId,
          ticketsID: winner.ticketsID,
          winAmount: winner.winAmount,
          status: winner.status,
        });
      });
    });

    return res.status(200).json({
      success: true,
      message: "Total winnings calculated successfully",
      data: {
        totalWinnings,
        winningGames,
        gamesCount: winningGames.length,
      },
    });
  } catch (error) {
    console.error("Error calculating total winnings:", error);
    return res.status(500).json({
      success: false,
      message: "Error calculating total winnings",
      error: error.message,
    });
  }
};
//for 10 cards
export const getTotalWinningsTwo = async (req, res) => {
  try {
    const { userId } = req.params;
    const { from, to } = req.query;

    // Check if authenticated admin matches the requested adminId
    if (req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Build query based on date range if provided
    let query = {};
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      query.createdAt = {
        $gte: fromDate,
        $lte: toDate,
      };
    }

    // Find all game results
    const gameResults = await AdminGameResultTwo.find(query);

    let totalWinnings = 0;
    let winningGames = [];

    // Calculate total winnings and collect winning games
    gameResults.forEach((game) => {
      const adminWinners = game.winners.filter(
        (winner) => winner.adminId === userId && winner.status === "win"
      );

      adminWinners.forEach((winner) => {
        totalWinnings += winner.winAmount;
        winningGames.push({
          gameId: game.gameId,
          ticketsID: winner.ticketsID,
          winAmount: winner.winAmount,
          status: winner.status,
        });
      });
    });

    return res.status(200).json({
      success: true,
      message: "Total winnings calculated successfully",
      data: {
        totalWinnings,
        winningGames,
        gamesCount: winningGames.length,
      },
    });
  } catch (error) {
    console.error("Error calculating total winnings:", error);
    return res.status(500).json({
      success: false,
      message: "Error calculating total winnings",
      error: error.message,
    });
  }
};
//for 10 cards
export const getTotalWinningsThree = async (req, res) => {
  try {
    const { userId } = req.params;
    const { from, to } = req.query;

    // Check if authenticated admin matches the requested adminId
    if (req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Build query based on date range if provided
    let query = {};
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      query.createdAt = {
        $gte: fromDate,
        $lte: toDate,
      };
    }

    // Find all game results
    const gameResults = await AdminGameResultThree.find(query);

    let totalWinnings = 0;
    let winningGames = [];

    // Calculate total winnings and collect winning games
    gameResults.forEach((game) => {
      const adminWinners = game.winners.filter(
        (winner) => winner.adminId === userId && winner.status === "win"
      );

      adminWinners.forEach((winner) => {
        totalWinnings += winner.winAmount;
        winningGames.push({
          gameId: game.gameId,
          ticketsID: winner.ticketsID,
          winAmount: winner.winAmount,
          status: winner.status,
        });
      });
    });

    return res.status(200).json({
      success: true,
      message: "Total winnings calculated successfully",
      data: {
        totalWinnings,
        winningGames,
        gamesCount: winningGames.length,
      },
    });
  } catch (error) {
    console.error("Error calculating total winnings:", error);
    return res.status(500).json({
      success: false,
      message: "Error calculating total winnings",
      error: error.message,
    });
  }
};

// Latest have to do 3 times
export const getUserResultsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const gameId = req.params.gameId || req.query.gameId;
    const { from, to } = req.body;

    // Get authenticated user based on type
    const authenticatedUser = req.user;
 

    // Check authentication
    if (authenticatedUser !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized access" 
      });
    }

    // Build query
    let query = {};
    if (gameId) {
      query.gameId = gameId;
    }
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      query.createdAt = {
        $gte: fromDate,
        $lte: toDate,
      };
    }

    const gameResults = await AdminGameResult.find(query).lean();

    if (gameResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No game results found for this User`
      });
    }

    const transformedResults = gameResults.map((result) => {
      // Filter winners and losers based on user type
      const filteredWinners = (result.winners || []).filter(
        (winner) => winner.adminId === userId
      );

      const filteredLosers = (result.losers || []).filter(
        (loser) => loser.adminId === userId
      );

      // Combine filtered results
      const userResults = [...filteredWinners, ...filteredLosers];

      // Add user type to each result for clarity
      const resultsWithType = userResults.map(result => ({
        ...result,
      }));

      return {
        _id: result._id,
        gameId: result.gameId,
        winningCard: result.winningCard,
        adminresult: resultsWithType,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      };
    });

    // Filter out games where user had no results
    const finalResults = transformedResults.filter(
      (result) => result.adminresult.length > 0
    );

    // Calculate summary statistics
    const totalGames = finalResults.length;
    const totalWins = finalResults.reduce((count, game) => 
      count + game.adminresult.filter(r => r.status === 'win').length, 0
    );

    return res.status(200).json({
      success: true,
      message: `User game results retrieved successfully`,
      data: finalResults
      // data: {
      //   userId,
      //   userType: type,
      //   summary: {
      //     totalGames,
      //     totalWins,
      //     winRate: totalGames ? ((totalWins / totalGames) * 100).toFixed(2) + '%' : '0%'
      //   },
      //   results: finalResults
      // }
    });

  } catch (error) {
    console.error(`Error retrieving ${req.params.type} game results:`, error);
    return res.status(500).json({
      success: false,
      message: `Error retrieving ${req.params.type} game results`,
      error: error.message
    });
  }
};
//for 16 cards
export const getUserResultsForAdminOne = async (req, res) => {
  try {
    const { userId } = req.params;
    const gameId = req.params.gameId || req.query.gameId;
    const { from, to } = req.body;

    // Get authenticated user based on type
    const authenticatedUser = req.user;
 

    // Check authentication
    if (authenticatedUser !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized access" 
      });
    }

    // Build query
    let query = {};
    if (gameId) {
      query.gameId = gameId;
    }
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      query.createdAt = {
        $gte: fromDate,
        $lte: toDate,
      };
    }

    const gameResults = await AdminGameResultOne.find(query).lean();

    if (gameResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No game results found for this User`
      });
    }

    const transformedResults = gameResults.map((result) => {
      // Filter winners and losers based on user type
      const filteredWinners = (result.winners || []).filter(
        (winner) => winner.adminId === userId
      );

      const filteredLosers = (result.losers || []).filter(
        (loser) => loser.adminId === userId
      );

      // Combine filtered results
      const userResults = [...filteredWinners, ...filteredLosers];

      // Add user type to each result for clarity
      const resultsWithType = userResults.map(result => ({
        ...result,
      }));

      return {
        _id: result._id,
        gameId: result.gameId,
        winningCard: result.winningCard,
        adminresult: resultsWithType,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      };
    });

    // Filter out games where user had no results
    const finalResults = transformedResults.filter(
      (result) => result.adminresult.length > 0
    );

    // Calculate summary statistics
    const totalGames = finalResults.length;
    const totalWins = finalResults.reduce((count, game) => 
      count + game.adminresult.filter(r => r.status === 'win').length, 0
    );

    return res.status(200).json({
      success: true,
      message: `User game results retrieved successfully`,
      data: finalResults
      // data: {
      //   userId,
      //   userType: type,
      //   summary: {
      //     totalGames,
      //     totalWins,
      //     winRate: totalGames ? ((totalWins / totalGames) * 100).toFixed(2) + '%' : '0%'
      //   },
      //   results: finalResults
      // }
    });

  } catch (error) {
    console.error(`Error retrieving ${req.params.type} game results:`, error);
    return res.status(500).json({
      success: false,
      message: `Error retrieving ${req.params.type} game results`,
      error: error.message
    });
  }
};
//for 10 cards
export const getUserResultsForAdminTwo = async (req, res) => {
  try {
    const { userId } = req.params;
    const gameId = req.params.gameId || req.query.gameId;
    const { from, to } = req.body;

    // Get authenticated user based on type
    const authenticatedUser = req.user;
 

    // Check authentication
    if (authenticatedUser !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized access" 
      });
    }

    // Build query
    let query = {};
    if (gameId) {
      query.gameId = gameId;
    }
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      query.createdAt = {
        $gte: fromDate,
        $lte: toDate,
      };
    }

    const gameResults = await AdminGameResultTwo.find(query).lean();

    if (gameResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No game results found for this User`
      });
    }

    const transformedResults = gameResults.map((result) => {
      // Filter winners and losers based on user type
      const filteredWinners = (result.winners || []).filter(
        (winner) => winner.adminId === userId
      );

      const filteredLosers = (result.losers || []).filter(
        (loser) => loser.adminId === userId
      );

      // Combine filtered results
      const userResults = [...filteredWinners, ...filteredLosers];

      // Add user type to each result for clarity
      const resultsWithType = userResults.map(result => ({
        ...result,
      }));

      return {
        _id: result._id,
        gameId: result.gameId,
        winningCard: result.winningCard,
        adminresult: resultsWithType,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      };
    });

    // Filter out games where user had no results
    const finalResults = transformedResults.filter(
      (result) => result.adminresult.length > 0
    );

    // Calculate summary statistics
    const totalGames = finalResults.length;
    const totalWins = finalResults.reduce((count, game) => 
      count + game.adminresult.filter(r => r.status === 'win').length, 0
    );

    return res.status(200).json({
      success: true,
      message: `User game results retrieved successfully`,
      data: finalResults
      // data: {
      //   userId,
      //   userType: type,
      //   summary: {
      //     totalGames,
      //     totalWins,
      //     winRate: totalGames ? ((totalWins / totalGames) * 100).toFixed(2) + '%' : '0%'
      //   },
      //   results: finalResults
      // }
    });

  } catch (error) {
    console.error(`Error retrieving ${req.params.type} game results:`, error);
    return res.status(500).json({
      success: false,
      message: `Error retrieving ${req.params.type} game results`,
      error: error.message
    });
  }
};
//for 10 cards
export const getUserResultsForAdminThree = async (req, res) => {
  try {
    const { userId } = req.params;
    const gameId = req.params.gameId || req.query.gameId;
    const { from, to } = req.body;

    // Get authenticated user based on type
    const authenticatedUser = req.user;
 

    // Check authentication
    if (authenticatedUser !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized access" 
      });
    }

    // Build query
    let query = {};
    if (gameId) {
      query.gameId = gameId;
    }
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      query.createdAt = {
        $gte: fromDate,
        $lte: toDate,
      };
    }

    const gameResults = await AdminGameResultThree.find(query).lean();

    if (gameResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No game results found for this User`
      });
    }

    const transformedResults = gameResults.map((result) => {
      // Filter winners and losers based on user type
      const filteredWinners = (result.winners || []).filter(
        (winner) => winner.adminId === userId
      );

      const filteredLosers = (result.losers || []).filter(
        (loser) => loser.adminId === userId
      );

      // Combine filtered results
      const userResults = [...filteredWinners, ...filteredLosers];

      // Add user type to each result for clarity
      const resultsWithType = userResults.map(result => ({
        ...result,
      }));

      return {
        _id: result._id,
        gameId: result.gameId,
        winningCard: result.winningCard,
        adminresult: resultsWithType,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      };
    });

    // Filter out games where user had no results
    const finalResults = transformedResults.filter(
      (result) => result.adminresult.length > 0
    );

    // Calculate summary statistics
    const totalGames = finalResults.length;
    const totalWins = finalResults.reduce((count, game) => 
      count + game.adminresult.filter(r => r.status === 'win').length, 0
    );

    return res.status(200).json({
      success: true,
      message: `User game results retrieved successfully`,
      data: finalResults
      // data: {
      //   userId,
      //   userType: type,
      //   summary: {
      //     totalGames,
      //     totalWins,
      //     winRate: totalGames ? ((totalWins / totalGames) * 100).toFixed(2) + '%' : '0%'
      //   },
      //   results: finalResults
      // }
    });

  } catch (error) {
    console.error(`Error retrieving ${req.params.type} game results:`, error);
    return res.status(500).json({
      success: false,
      message: `Error retrieving ${req.params.type} game results`,
      error: error.message
    });
  }
};



// Latest
export const getGameDetails = async (req, res) => {
  try {
      const { gameId } = req.params;

      // Fetch the game by GameId
      const game = await Game.findOne({ GameId: gameId });
      console.log("game", game);

      if (!game) {
          return res.status(404).json({ message: 'Game not found' });
      }

      if (!game.Bets || game.Bets.length === 0) {
          return res.status(404).json({ message: 'No bets found for this game' });
      }

      // Aggregate total amounts per card across all tickets
      const cardTotals = {};
      let totalGameAmount = 0;

      game.Bets.forEach(bet => {
          bet.card.forEach(card => {
              const { cardNo, Amount } = card;
              if (!cardTotals[cardNo]) {
                  cardTotals[cardNo] = 0; // Initialize total for this card
              }
              cardTotals[cardNo] += Amount; // Add the card's amount
              totalGameAmount += Amount; // Add to the overall game total
          });
      });

      // Convert card totals to an array for output
      const cardsWithTotals = Object.keys(cardTotals).map(cardNo => ({
          cardNo,
          totalAmount: cardTotals[cardNo]
      }));

      return res.status(200).json({
          gameId: game.GameId,
          totalGameAmount,
          cards: cardsWithTotals
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error', error });
  }
};

export const calculateCardWin = async (req, res) => {
  try {
      const { gameId } = req.params;
      const { cardNo, multiplier } = req.body;

      if (!cardNo || !multiplier) {
          return res.status(400).json({ message: 'Card number and multiplier are required' });
      }

      // Fetch the game by GameId
      const game = await Game.findOne({ GameId: gameId });
      const latestGame = await Game.findOne().sort({ createdAt: -1 }).lean();

      if (!game) {
          return res.status(404).json({ message: 'Game not found' });
      }

      if (!game.Bets || game.Bets.length === 0) {
          return res.status(404).json({ message: 'No bets found for this game' });
      }

      // Aggregate the total amount for the selected card across all bets
      let totalCardAmount = 0;

      game.Bets.forEach(bet => {
          bet.card.forEach(card => {
              if (card.cardNo === cardNo) {
                  totalCardAmount += card.Amount;
              }
          });
      });

      if (totalCardAmount === 0) {
          return res.status(404).json({ message: `Card with cardNo ${cardNo} not found in the game` });
      }

      let winningAmount;

      // Calculate the winning amount
      if(multiplier < 0 || multiplier > 16) {
        winningAmount = totalCardAmount * (multiplier*10);
      } else{
        return res.status(400).json({ message: 'Multiplier should be between 0 and 16' });
      }

      // Save the calculated data into the SelectedCard model
      const selectedCardData = new SelectedCard({
          gameId,
          cardId: cardNo,
          multiplier,
          amount: winningAmount,
          drowTime: new Date().toISOString() // Save the draw time as ISO string
      });

      await selectedCardData.save();

      const adminResults = await calculateAdminResults(latestGame, selectedCardData);
      await getAdminGameResults(latestGame.GameId, adminResults);
      // await processAllSelectedCards();
      await calculateAndStoreAdminWinnings(latestGame.GameId);

      return res.status(200).json({
          cardNo,
          totalCardAmount,
          multiplier,
          winningAmount,
          message: 'Winning data saved successfully',
          savedData: selectedCardData
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error', error });
  }
};


// Latest 
export const getWeeklyGameData = async (req, res) => {
  try {
      const { startDate, endDate } = getCurrentWeek(); // Helper function to get the week's date range

      // Fetch all users
      const users = await SubAdmin.find({});

      // Aggregate data for the week
      const gameResults = await AdminGameResult.aggregate([
          {
              $match: {
                  createdAt: {
                      $gte: new Date(startDate),
                      $lt: new Date(endDate),
                  },
              },
          },
          {
              $unwind: "$winners",
          },
          {
              $group: {
                  _id: "$winners.adminId",
                  totalBetAmount: { $sum: "$winners.betAmount" },
                  totalWinAmount: { $sum: "$winners.winAmount" },
              },
          },
      ]);

      // Map results to users
      const userData = users.map(user => {
          const userGameData = gameResults.find(gr => gr._id === user.userId) || {};
          return {
              name: user.name,
              email: user.email,
              wallet: user.wallet,
              totalBetAmount: userGameData.totalBetAmount || 0,
              totalWinAmount: userGameData.totalWinAmount || 0,
              totalClaimed: user.commission || 0, // Assuming commission as claimed amount
          };
      });

      res.status(200).json({
          week: { startDate, endDate },
          users: userData,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to get the current week's date range (Monday-Saturday)
const getCurrentWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust if it's Sunday

  const monday = new Date(now.setDate(diffToMonday));
  monday.setHours(0, 0, 0, 0);

  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);
  saturday.setHours(23, 59, 59, 999);

  return { startDate: monday, endDate: saturday };
};
