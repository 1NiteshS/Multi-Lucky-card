import DistrictAdmin from "../models/DistrictAdmin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import UserCount from "../models/UserCount.js";
import Game from '../models/gameModel.js';
import SelectedCard from '../models/selectedCardModel.js';
import AdminGameResult from '../models/AdminGameResult.js';
import User from '../models/User.js';
import TransactionHistoryTwo from "../models/TransactionHistoryTwo.js";

// New
export const create = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Assuming logged-in Admin's ID is available in `req.admin.adminId`
        const subAdminId = req.subAdmin.subAdminId;

        // Check if SubAdmin already exists with this email
        // const existingSubAdmin = await SubAdmin.findOne({ email });

        // if (existingSubAdmin) {
        //   return res.status(400).send({ error: "Email already in use" });
        // }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 8);

        // Create new SubAdmin
        const districtAdminId = uuidv4();
        const districtAdmin = new DistrictAdmin({
        name,
        email,
        password: hashedPassword,
        districtAdminId,
        createdBy: subAdminId, 
        });

        // Save DistrictAdmin to database
        await districtAdmin.save();

        // Send success response
        res.status(201).send({
        message: "DistrictAdmin created successfully",
        districtAdmin: {
            name: districtAdmin.name,
            email: districtAdmin.email,
            createdBy: districtAdmin.createdBy,
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

        const admin = await DistrictAdmin.findOne({ email });

        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(401).send({ error: "Invalid login credentials" });
        }

        const token = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET);
        
        res.send({ 
            token, 
            adminId: admin.districtAdminId,
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
        const admin = await DistrictAdmin.findById(req.admin._id);

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
export const getDistrictAdminGameTotalInfo = async (req, res) => {
    try {
        const { districtAdminId } = req.params;
        const { from, to } = req.query;

        // Fetch the necessary data from the database for sub-admin
        const { games, selectedCards, districtAdmin, adminGameResults } =
        await getDistrictAdminGameData(districtAdminId, from, to);

        // Calculate the required metrics
        const {
        totalBetAmount,
        totalWinAmount,
        endAmount,
        commission,
        totalClaimedAmount,
        unclaimedAmount,
        NTP,
        } = await calculateDistrictAdminGameTotals(
        games,
        selectedCards,
        districtAdmin,
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
        console.error("Error retrieving District-Admin game total info:", error);
        return res.status(500).json({
        success: false,
        message: "Error retrieving District-Admin game total info",
        error: error.message,
        });
    }
};

// New
async function getDistrictAdminGameData(districtAdminId, from, to) {
    const districtAdmin = await DistrictAdmin.findOne({ districtAdminId });
    if (!districtAdmin) {
        throw new Error("District-Admin not found");
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
        "Bets.adminID": districtAdmin.adminId,
    });

    const selectedCards = await SelectedCard.find({
        ...dateFilter,
        adminId: districtAdmin.adminId,
    });

    const adminGameResults = await AdminGameResult.find({
        ...dateFilter,
        "winners.adminId": districtAdmin.adminId,
    });

    return {
        games,
        selectedCards,
        districtAdmin,
        adminGameResults,
    };
}

// New
// Helper function to calculate sub-admin game totals
async function calculateDistrictAdminGameTotals(games, districtAdmin, adminGameResults) {
    let totalBetAmount = 0;
    let totalWinAmount = 0;
    let totalClaimedAmount = 0;

    // Ensure adminGameResults is an array
    adminGameResults = Array.isArray(adminGameResults) ? adminGameResults : [];

    // Calculate total bet amount
    for (const game of games) {
        const districtAdminBets = game.Bets.filter(
            (bet) => bet.adminID === districtAdmin.adminId
        );
        for (const bet of districtAdminBets) {
            totalBetAmount += bet.card.reduce(
                (total, card) => total + card.Amount,
                0
            );
        }
    }

    // Calculate total win amount from AdminGameResult
    for (const result of adminGameResults) {
        const winnerEntry = result.winners.find(
            (winner) => winner.adminId === districtAdmin.adminId
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
export const resetDistrictPassword = async (req, res) => {
    try {
        const { districtAdminId } = req.params;
        const { newPassword } = req.body;

        // Validate inputs
        if (!districtAdminId || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "DistrictAdmin ID and new password are required"
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Find and update SubAdmin's password
        const updatedDistrictAdmin = await DistrictAdmin.findOneAndUpdate(
            { districtAdminId },
            { 
                password: hashedPassword,
                isVerified: true
            },
            { new: true }
        );

        if (!updatedDistrictAdmin) {
            return res.status(404).json({
                success: false,
                message: "DistrictAdmin not found"
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
    const { districtAdminId, userId, amount } = req.body;

    // Input validation
    if (!districtAdminId || !userId || !amount) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (amount <= 0) {
        return res.status(400).json({ message: "Amount should be greater than 0" });
    }

    try {
        // Fetch the admin
        const districtAdmin = await DistrictAdmin.findOne({ districtAdminId });
        if (!districtAdmin) {
            return res.status(404).json({ message: "DistrictAdmin not found" });
        }

        // Check if admin has enough balance
        if (districtAdmin.wallet < amount) {
            return res.status(400).json({ message: "Insufficient balance in Admin's wallet" });
        }

        // Fetch the sub-admin
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Store initial balances
        const districtAdminBalanceBefore = districtAdmin.wallet;
        const userBalanceBefore = user.wallet;

        // Update wallets
        districtAdmin.wallet -= amount;
        user.wallet += amount;

        // Save changes
        await districtAdmin.save();
        await user.save();

        // Create transaction history
        const transaction = new TransactionHistoryTwo({
            districtAdminId,
            userId,
            amount,
            transactionType: 'TRANSFER',
            status: 'SUCCESS',
            districtAdminBalanceBefore,
            districtAdminBalanceAfter: districtAdmin.wallet,
            userBalanceBefore,
            userBalanceAfter: user.wallet
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
            districtAdminWallet: districtAdmin.wallet,
            userWallet: user.wallet,
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
        const districtAdminId = req.admin.districtAdminId;

        // Simply fetch all transactions for the admin, sorted by date
        const transactions = await TransactionHistoryTwo.find({ districtAdminId }).sort({ createdAt: -1 });

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
    const { districtAdminId, userId, commission } = req.body;

    // Input validation
    if (!districtAdminId || !districtAdminId || commission === undefined) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (commission < 0 || commission > 100) {
        return res.status(400).json({ message: "Commission should be between 0 and 100 percent" });
    }

    try {
        // Fetch the admin
        const districtAdmin = await DistrictAdmin.findOne({ districtAdminId });
        if (!districtAdmin) {
            return res.status(404).json({ message: "DistrictAdmin not found" });
        }

        // Fetch the sub-admin
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the commission
        user.commission = commission;

        // Save changes
        await user.save();

        res.status(200).json({
            message: "Commission set successfully",
            userId: user.userId,
            commission: user.commission,
        });
    } catch (error) {
        console.error("Error while setting commission:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

  // New
export const getUserByDistrictAdmin = async (req, res) => {
    try {
        const { districtAdminId } = req.params;
    
        //check if the admin exists
        const districtAdmin = await DistrictAdmin.findOne({ districtAdminId });
        if (!districtAdmin) {
            return res.status(404).json({message: "DistrictAdmin not found"});
        }
    
        // Fetch the User created by this DistrictAdmin
        const user = await User.find({ createdBy: districtAdminId });
    
        // Create response object with admin name and subadmins
        const response = {
            districtAdminName: districtAdmin.name,
            users: user
        };

        res.status(200).json(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
};

  // New
export const resetUserLogin = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if districtAdminId is provided
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Find and update the DistrictAdmin's login status
        const updatedUser = await User.findOneAndUpdate(
            { userId: userId },
            { isLoggedIn: false },
            { new: true }
        );

        // If DistrictAdmin not found
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User login status reset successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in resetting User login status",
            error: error.message
        });
    }
}