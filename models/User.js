import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        name: { type: String },
        email: { type: String },
        password: { type: String, required: true },
        userId: { type: String, required: true, unique: true },
        type: { type: String, default: "user" },
        isVerified: { type: Boolean, default: false },
        otp: { type: String },
        otpExpiry: { type: Date },
        wallet: { type: Number, default: 0 },
        isBlocked: { type: Boolean, default: false },
        ked: { type: Boolean, default: false }, 
        // device: { type: String, default: "Phone"},
        isLoggedIn: { type: Boolean, default: false },
        commission: {type: Number, default: 0},
        // createdBy: { type: String, ref: 'DistrictAdmin' }, 
        createdBy: { 
            type: String, 
            required: true,
            refPath: 'createdByModel' // This tells Mongoose to refer to the model specified in 'createdByModel'
        },
        
        // Model for the 'createdBy' field (either DistrictAdmin or SuperAdmin)
        createdByModel: { 
            type: String, 
            required: true, 
            enum: ['DistrictAdmin', 'SuperAdmin'] // This ensures that only 'DistrictAdmin' or 'SuperAdmin' can be used
        }
    },
    { timestamps: true }
);

export default mongoose.model("User", UserSchema);