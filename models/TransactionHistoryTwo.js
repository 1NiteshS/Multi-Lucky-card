import mongoose from 'mongoose';

const transactionHistorySchema = new mongoose.Schema({
    districtAdminId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    transactionType: {
        type: String,
        enum: ['TRANSFER'],
        default: 'TRANSFER'
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILED'],
        default: 'SUCCESS'
    },
    districtAdminBalanceBefore: {
        type: Number,
        required: true
    },
    districtAdminBalanceAfter: {
        type: Number,
        required: true
    },
    userBalanceBefore: {
        type: Number,
        required: true
    },
    userBalanceAfter: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for better query performance
transactionHistorySchema.index({ createdAt: -1 });
transactionHistorySchema.index({ districtAdminId: 1, createdAt: -1 });
transactionHistorySchema.index({ userId: 1, createdAt: -1 });

const TransactionHistoryTwo = mongoose.model('TransactionHistoryTwo', transactionHistorySchema);
export default TransactionHistoryTwo;