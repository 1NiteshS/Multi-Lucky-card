import mongoose from 'mongoose';

const DistrictAdminSchema = new mongoose.Schema(
    {
        name: { type: String },
        email: { type: String },
        password: { type: String, required: true },
        districtAdminId: { type: String, required: true, unique: true },
        type: { type: String, default: "districtAdmin"},
        isVerified: { type: Boolean, default: false },
        otp: { type: String },
        otpExpiry: { type: Date },
        wallet: { type: Number, default: 0 },
        isBlocked: { type: Boolean, default: false },
        ked: { type: Boolean, default: false }, 
        // device: { type: String, default: "Phone"},
        isLoggedIn: { type: Boolean, default: false },
        commission: {type: Number, default: 0},
        createdBy: { type: String, ref: 'SubAdmin' },
    },
    { timestamps: true }
);

export default mongoose.model("DistrictAdmin", DistrictAdminSchema);