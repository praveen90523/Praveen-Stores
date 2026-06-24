const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://praveend1126_db_user:b9o7696D4mxREVWi@ac-krwmqi8-shard-00-00.wonvcox.mongodb.net:27017,ac-krwmqi8-shard-00-01.wonvcox.mongodb.net:27017,ac-krwmqi8-shard-00-02.wonvcox.mongodb.net:27017/ecommerce?ssl=true&replicaSet=atlas-8qtrx3-shard-0&authSource=admin&retryWrites=true&w=majority");
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-create default admin if not present
    const adminEmail = "admin@praveen.store";
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("Admin@123", 10);
      await User.create({
        name: "Admin User",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log(`Default Admin Account Created (${adminEmail})`);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;