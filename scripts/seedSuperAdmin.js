// scripts/seedSuperAdmin.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import SuperAdmin from '../models/SuperAdmin.js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const superAdminUsername = 'superadmin';
    const superAdminPassword = 'superadmin123'; // You should change this to a strong password

    const existingSuperAdmin = await SuperAdmin.findOne({ username: superAdminUsername });

    if (existingSuperAdmin) {
      console.log('Super Admin already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    const superAdminId = uuidv4();
    const superAdmin = new SuperAdmin({
      username: superAdminUsername,
      password: hashedPassword,
      superAdminId,
    });

    await superAdmin.save();

    console.log('Super Admin created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Super Admin:', error);
    process.exit(1);
  }
};

seedSuperAdmin();