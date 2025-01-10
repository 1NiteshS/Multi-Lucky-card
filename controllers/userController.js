import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import UserCount from "../models/UserCount.js";
import Game from '../models/gameModel.js';
import SelectedCard from '../models/selectedCardModel.js';
import AdminGameResult from '../models/AdminGameResult.js';
import { getIO } from "../socket/sockectServer.js";

// New
export const create = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Assuming logged-in Admin's ID is available in `req.admin.adminId`
        const districtAdminId = req.admin.adminId;

        // Check if SubAdmin already exists with this email
        // const existingSubAdmin = await SubAdmin.findOne({ email });

        // if (existingSubAdmin) {
        //   return res.status(400).send({ error: "Email already in use" });
        // }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 8);

        // Create new user
        const userId = uuidv4();
        const user = new User({
            name,
            email,
            password: hashedPassword,
            userId,
            createdBy: districtAdminId, 
        });

        // Save user to database
        await user.save();

        // Send success response
        res.status(201).send({
        message: "User created successfully",
        user: {
            name: user.name,
            email: user.email,
            createdBy: user.createdBy,
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

        // Find admin
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if the user is already logged in from another device type
        if (user.isLoggedIn) {
            return res.status(400).json({
                success: false,
                message: `You are already logged in. Please log out  before logging in.`,
            });
        }

        // Check password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
        return res.status(400).json({
            success: false,
            message: "Invalid credentials",
        });
        }

        // Update admin login status and device
        // admin.isLoggedIn = true;
        await user.save();

        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find or create today's user count record
        let userCount = await UserCount.findOne({
        date: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        });

        // If no record exists for today, create one
        if (!userCount) {
        userCount = new UserCount({
            date: today,
            totalLogins: 0,
            uniqueUsers: [],
            loggedInUsers: 0,
        });
        }

        // Update counts
        userCount.totalLogins += 1;
        userCount.loggedInUsers += 1;

        // Add unique user if not already exists
        if (!userCount.uniqueUsers.some((id) => id.equals(user._id))) {
        userCount.uniqueUsers.push(user._id);
        }

        await userCount.save();

        // Generate token
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

        // Emit socket event with updated counts
        const io = getIO();
        io.emit("userCountUpdate", {
        loggedInUsers: userCount.loggedInUsers,
        totalLogins: userCount.totalLogins,
        uniqueUsers: userCount.uniqueUsers.length,
        });

        res.status(200).json({
            success: true,
            token,
            userId: user.userId,
            loggedInUsers: userCount.loggedInUsers,
            totalLogins: userCount.totalLogins,
            uniqueUsers: userCount.uniqueUsers.length,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
        success: false,
        message: "Login failed",
        error: error.message,
        });
    }
};

// New
export const logout = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
        return res.status(400).json({
            success: false,
            message: "User not found",
        });
        }

        user.isLoggedIn = false;
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

export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const authenticatedUser =  req.user;


        // Verify user type and authentication
        if (!authenticatedUser) {
            return res.status(401).json({
                success: false,
                error: "Authentication required"
            });
        } 

        // Select appropriate model and fields based on type

        let user = await User.findOne({ userId }).select(
                "name email userId wallet isVerified commission createdAt createdBy"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: `User not found`
            });
        }

        // Check if user is requesting their own profile
        const userIdField = 'userId';
        if (user[userIdField] !== authenticatedUser[userIdField]) {
            return res.status(403).json({
                success: false,
                error: "You can only view your own profile"
            });
        }

        // Prepare response based on user type
        const baseResponse = {
            name: user.name,
            email: user.email,
            [userIdField]: user[userIdField],
            wallet: user.wallet,
            device: user.device,
            isVerified: user.isVerified,
            joinedDate: user.createdAt
        };

        // Add subAdmin specific fields if applicable
        const responseData = 'user'
        ? {
            ...baseResponse,
            commission: user.commission,
            createdBy: user.createdBy,
            device: user.device
            }
        : baseResponse;

        res.status(200).json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error(`Error fetching ${req.params.type} profile:`, error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// New
export const getUserGameTotalInfo = async (req, res) => {
    try {
        const { userId } = req.params;
        const { from, to } = req.query;

        // Fetch the necessary data from the database for sub-admin
        const { games, selectedCards, user, adminGameResults } = await getUserGameData(userId, from, to);

        // Calculate the required metrics
        const {
            totalBetAmount,
            totalWinAmount,
            endAmount,
            commission,
            totalClaimedAmount,
            unclaimedAmount,
            NTP,
        } = await calculateUserGameTotals(
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
        console.error("Error retrieving sub-admin game total info:", error);
        return res.status(500).json({
        success: false,
        message: "Error retrieving sub-admin game total info",
        error: error.message,
        });
    }
};

// New
async function getUserGameData(userId, from, to) {
    const user = await User.findOne({ userId });
    if (!user) {
        throw new Error("User not found");
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
        "Bets.adminID": user.adminId,
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
async function calculateUserGameTotals(games, user, adminGameResults) {
    let totalBetAmount = 0;
    let totalWinAmount = 0;
    let totalClaimedAmount = 0;

    // Calculate total bet amount
    for (const game of games) {
        const userBets = game.Bets.filter(
        (bet) => bet.adminID === user.adminId
        );
        for (const bet of userBets) {
        totalBetAmount += bet.card.reduce(
            (total, card) => total + card.Amount,
            0
        );
        }
    }

    // Calculate total win amount from AdminGameResult
    for (const result of adminGameResults) {
        const winnerEntry = result.winners.find(
        (winner) => winner.adminId === user.adminId
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
export const resetUserPassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;

        // Validate inputs
        if (!userId || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "User ID and new password are required"
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Find and update SubAdmin's password
        const updatedUser = await User.findOneAndUpdate(
            { userId },
            { 
                password: hashedPassword,
                isVerified: true
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
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