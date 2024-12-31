import mongoose from 'mongoose';

const transactionHistorySchema = new mongoose.Schema({
    subAdminId: {
        type: String,
        required: true,
        index: true
    },
    districtAdminId: {
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
    subAdminBalanceBefore: {
        type: Number,
        required: true
    },
    subAdminBalanceAfter: {
        type: Number,
        required: true
    },
    districtAdminBalanceBefore: {
        type: Number,
        required: true
    },
    districtAdminBalanceAfter: {
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
transactionHistorySchema.index({ subAdminId: 1, createdAt: -1 });
transactionHistorySchema.index({ districtAdminId: 1, createdAt: -1 });

const TransactionHistoryOne = mongoose.model('TransactionHistoryOne', transactionHistorySchema);
export default TransactionHistoryOne;