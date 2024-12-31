import SubAdmin from "../models/SubAdmin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import UserCount from "../models/UserCount.js";
import Game from '../models/gameModel.js';
import SelectedCard from '../models/selectedCardModel.js';
import AdminGameResult from '../models/AdminGameResult.js';
import nodemailer from 'nodemailer';
import TransactionHistoryOne from '../models/TransactionHistoryOne.js';
import DistrictAdmin from '../models/DistrictAdmin.js';

// New
export const create = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Assuming logged-in Admin's ID is available in `req.admin.adminId`
    const adminId = req.admin.adminId;

    // Check if SubAdmin already exists with this email
    // const existingSubAdmin = await SubAdmin.findOne({ email });

    // if (existingSubAdmin) {
    //   return res.status(400).send({ error: "Email already in use" });
    // }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 8);

    // Create new SubAdmin
    const subAdminId = uuidv4();
    const subAdmin = new SubAdmin({
      name,
      email,
      password: hashedPassword,
      subAdminId,
      createdBy: adminId, // Track the creator Admin
    });

    // Save SubAdmin to database
    await subAdmin.save();

    // Send success response
    res.status(201).send({
      message: "SubAdmin created successfully",
      subAdmin: {
        name: subAdmin.name,
        email: subAdmin.email,
        createdBy: subAdmin.createdBy,
      },
    });
  } catch (error) {
    res.status(400).send(error);
  }
};

// New
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await SubAdmin.findOne({ email });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return res.status(401).send({ error: "Invalid login credentials" });
    }

    const token = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET);
    
    res.send({ 
        token, 
        adminId: admin.subAdminId,
        wallet: admin.wallet,
        name: admin.name,
    });
} catch (error) {
    res.status(400).send(error);
}
};

// New
export const logout = async (req, res) => {
  try {
    const admin = await SubAdmin.findById(req.admin._id);

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Admin not found",
      });
    }

    admin.isLoggedIn = false;
    await admin.save();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await UserCount.findOneAndUpdate(
      { date: { $gte: today } },
      {
        $inc: { loggedInUsers: -1 },
      }
    );

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

// New
export const getSubAdminGameTotalInfo = async (req, res) => {
  try {
    const { subAdminId } = req.params;
    const { from, to } = req.query;

    // Fetch the necessary data from the database for sub-admin
    const { games, selectedCards, subAdmin, adminGameResults } =
      await getSubAdminGameData(subAdminId, from, to);

    // Calculate the required metrics
    const {
      totalBetAmount,
      totalWinAmount,
      endAmount,
      commission,
      totalClaimedAmount,
      unclaimedAmount,
      NTP,
    } = await calculateSubAdminGameTotals(
      games,
      selectedCards,
      subAdmin,
      adminGameResults
    );

    // Construct the response
    return res.status(200).json({
      success: true,
      data: {
        totalBetAmount,
        totalWinAmount,
        endAmount,
        commission,
        totalClaimedAmount,
        unclaimedAmount,
        NTP,
      },
    });
  } catch (error) {
    console.error("Error retrieving sub-admin game total info:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving sub-admin game total info",
      error: error.message,
    });
  }
};

// New
// Helper function to fetch sub-admin game data
async function getSubAdminGameData(subAdminId, from, to) {
  // Verify sub-admin exists
  const subAdmin = await SubAdmin.findOne({ subAdminId });
  if (!subAdmin) {
    throw new Error("Sub-Admin not found");
  }

  // Prepare date filter if from and to are provided
  const dateFilter = {};
  if (from && to) {
    dateFilter.createdAt = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  // Fetch related game data
  const games = await Game.find({
    ...dateFilter,
    "Bets.adminID": subAdmin.adminId,
  });

  const selectedCards = await SelectedCard.find({
    ...dateFilter,
    adminId: subAdmin.adminId,
  });

  const adminGameResults = await AdminGameResult.find({
    ...dateFilter,
    "winners.adminId": subAdmin.adminId,
  });

  return {
    games,
    selectedCards,
    subAdmin,
    adminGameResults,
  };
}

// New
// Helper function to calculate sub-admin game totals
async function calculateSubAdminGameTotals(
  games,
  selectedCards,
  subAdmin,
  adminGameResults
) {
  let totalBetAmount = 0;
  let totalWinAmount = 0;
  let totalClaimedAmount = 0;

  // Calculate total bet amount
  for (const game of games) {
    const subAdminBets = game.Bets.filter(
      (bet) => bet.adminID === subAdmin.adminId
    );
    for (const bet of subAdminBets) {
      totalBetAmount += bet.card.reduce(
        (total, card) => total + card.Amount,
        0
      );
    }
  }

  // Calculate total win amount from AdminGameResult
  for (const result of adminGameResults) {
    const winnerEntry = result.winners.find(
      (winner) => winner.adminId === subAdmin.adminId
    );
    if (winnerEntry) {
      totalWinAmount += winnerEntry.winAmount || 0;
      if (winnerEntry.status === "claimed") {
        totalClaimedAmount += winnerEntry.winAmount || 0;
      }
    }
  }

  // If no claimed amount is found, default to 0
  totalClaimedAmount = totalClaimedAmount || 0;

  // Calculate derived values
  const endAmount = totalBetAmount - totalWinAmount;
  const commission = totalBetAmount * 0.05; // Assuming same 5% commission as admin
  const unclaimedAmount = totalWinAmount - totalClaimedAmount;
  const NTP = endAmount - commission;

  return {
    totalBetAmount,
    totalWinAmount,
    endAmount,
    commission,
    totalClaimedAmount,
    unclaimedAmount,
    NTP,
  };
}

// New
export const resetSubPassword = async (req, res) => {
  try {
      const { subAdminId } = req.params;
      const { newPassword } = req.body;

      // Validate inputs
      if (!subAdminId || !newPassword) {
          return res.status(400).json({
              success: false,
              message: "SubAdmin ID and new password are required"
          });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Find and update SubAdmin's password
      const updatedSubAdmin = await SubAdmin.findOneAndUpdate(
          { subAdminId },
          { 
              password: hashedPassword,
              isVerified: true
          },
          { new: true }
      );

      if (!updatedSubAdmin) {
          return res.status(404).json({
              success: false,
              message: "SubAdmin not found"
          });
      }

      return res.status(200).json({
          success: true,
          message: "Password reset successful"
      });

  } catch (error) {
      return res.status(500).json({
          success: false,
          message: "Error in resetting password",
          error: error.message
      });
  }
};

// New
const createTransporter = () => {
  // Log environment variables (remove in production)
  console.log('Email User:', process.env.EMAIL_USER ? 'Set' : 'Not Set');
  console.log('Email Password:', process.env.EMAIL_APP_PASSWORD ? 'Set' : 'Not Set');

  return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      // secure: true, // use SSL
      auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD
      },
      debug: true // Enable debug logs
  });
};

const sendTransferEmail = async (adminEmail, amount, transactionId) => {
  // Validate email addresses
  if (!adminEmail) {
      throw new Error('Email addresses are required');
  }

  try {
      const transporter = createTransporter();

      // Test the connection
      await transporter.verify();
      console.log('SMTP connection verified successfully');

      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: [adminEmail].filter(Boolean).join(', '),
          subject: 'Money Transfer Notification',
          html: `
              <h2>Money Transfer Successful</h2>
              <p>Transaction Details:</p>
              <ul>
                  <li>Amount: ${amount}</li>
                  <li>Transaction ID: ${transactionId}</li>
                  <li>Status: Success</li>
              </ul>
              <p>This is an automated notification. Please do not reply.</p>
          `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;

  } catch (error) {
      console.error('Detailed email error:', {
          message: error.message,
          code: error.code,
          command: error.command,
          response: error.response
      });
      throw error;
  }
};

export const transferMoney = async (req, res) => {
  const { subAdminId, districtAdminId, amount } = req.body;

  // Input validation
  if (!subAdminId || !districtAdminId || !amount) {
      return res.status(400).json({ message: "All fields are required" });
  }

  if (amount <= 0) {
      return res.status(400).json({ message: "Amount should be greater than 0" });
  }

  try {
      // Fetch the admin
      const subAdmin = await SubAdmin.findOne({ subAdminId });
      if (!subAdmin) {
          return res.status(404).json({ message: "SubAdmin not found" });
      }

      // Check if admin has enough balance
      if (subAdmin.wallet < amount) {
          return res.status(400).json({ message: "Insufficient balance in Admin's wallet" });
      }

      // Fetch the sub-admin
      const districtAdmin = await DistrictAdmin.findOne({ districtAdminId });
      if (!districtAdmin) {
          return res.status(404).json({ message: "DistrictAdmin not found" });
      }

      // Store initial balances
      const subAdminBalanceBefore = subAdmin.wallet;
      const districtAdminBalanceBefore = districtAdmin.wallet;

      // Update wallets
      subAdmin.wallet -= amount;
      districtAdmin.wallet += amount;

      // Save changes
      await subAdmin.save();
      await districtAdmin.save();

      // Create transaction history
      const transaction = new TransactionHistoryOne({
          subAdminId,
          districtAdminId,
          amount,
          transactionType: 'TRANSFER',
          status: 'SUCCESS',
          subAdminBalanceBefore,
          subAdminBalanceAfter: subAdmin.wallet,
          districtAdminBalanceBefore,
          districtAdminBalanceAfter: districtAdmin.wallet
      });

      await transaction.save();

      // Send email notification
      try {
          await sendTransferEmail("loomdiary100@gmail.com", amount, transaction._id);
      } catch (emailError) {
          console.error("Error sending email:", emailError);
          // Continue with the response even if email fails
      }

      return res.status(200).json({
          message: "Money transferred successfully",
          subAdminWallet: subAdmin.wallet,
          districtAdminWallet: districtAdmin.wallet,
          transactionId: transaction._id
      });
  } catch (error) {
      console.error("Error during wallet transfer:", error);
      return res.status(500).json({ message: "Internal server error" });
  }
};

// New
export const getTransactionHistory = async (req, res) => {
  try {
      const subAdminId = req.admin.subAdminId;

      // Simply fetch all transactions for the admin, sorted by date
      const transactions = await TransactionHistoryOne.find({ subAdminId }).sort({ createdAt: -1 });

      return res.status(200).json({
          success: true,
          data: transactions
      });
  } catch (error) {
      return res.status(500).json({
          success: false,
          message: 'Server error. Please try again later.'
      });
  }
};

// New
export const setCommission = async (req, res) => {
  const { subAdminId, districtAdminId, commission } = req.body;

  // Input validation
  if (!subAdminId || !districtAdminId || commission === undefined) {
      return res.status(400).json({ message: "All fields are required" });
  }

  if (commission < 0 || commission > 100) {
      return res.status(400).json({ message: "Commission should be between 0 and 100 percent" });
  }

  try {
      // Fetch the admin
      const subAdmin = await SubAdmin.findOne({ subAdminId });
      if (!subAdmin) {
          return res.status(404).json({ message: "SubAdmin not found" });
      }

      // Fetch the sub-admin
      const districtAdmin = await DistrictAdmin.findOne({ districtAdminId });
      if (!districtAdmin) {
          return res.status(404).json({ message: "DistrictAdmin not found" });
      }

      // Update the commission
      districtAdmin.commission = commission;

      // Save changes
      await districtAdmin.save();

      res.status(200).json({
          message: "Commission set successfully",
          districtAdminId: districtAdmin.districtAdminId,
          commission: districtAdmin.commission,
      });
  } catch (error) {
      console.error("Error while setting commission:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

// New
export const getDistrictAdminByAdmin = async (req, res) => {
  try {
    const { subAdminId } = req.params;

    //check if the admin exists
    const subAdmin = await SubAdmin.findOne({ subAdminId });
    if (!subAdmin) {
      return res.status(404).json({message: "SubAdmin not found"});
    }

    // Fetch the subadmins created by this admin
    const districtadmins = await DistrictAdmin.find({ createdBy: subAdminId });

    // Create response object with admin name and subadmins
    const response = {
      subAdminName: subAdmin.name,
      districtadmins: districtadmins
    };

    res.status(200).json(response);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Server Error"});
  }
};

// New
export const resetDistrictAdminLogin = async (req, res) => {
  try {
      const { districtAdminId } = req.params;

      // Check if districtAdminId is provided
      if (!districtAdminId) {
          return res.status(400).json({
              success: false,
              message: "DistrictAdmin ID is required"
          });
      }

      // Find and update the DistrictAdmin's login status
      const updatedDistrictAdmin = await DistrictAdmin.findOneAndUpdate(
          { districtAdminId: districtAdminId },
          { isLoggedIn: false },
          { new: true }
      );

      // If DistrictAdmin not found
      if (!updatedDistrictAdmin) {
          return res.status(404).json({
              success: false,
              message: "DistrictAdmin not found"
          });
      }

      return res.status(200).json({
          success: true,
          message: "DistrictAdmin login status reset successfully"
      });

  } catch (error) {
      return res.status(500).json({
          success: false,
          message: "Error in resetting DistrictAdmin login status",
          error: error.message
      });
  }
}