require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");

const seedData = async () => {
  try {
    // 1. Connect database
    const mongoURI = process.env.MONGO_URI || "mongodb://praveend1126_db_user:b9o7696D4mxREVWi@ac-krwmqi8-shard-00-00.wonvcox.mongodb.net:27017,ac-krwmqi8-shard-00-01.wonvcox.mongodb.net:27017,ac-krwmqi8-shard-00-02.wonvcox.mongodb.net:27017/ecommerce?ssl=true&replicaSet=atlas-8qtrx3-shard-0&authSource=admin&retryWrites=true&w=majority";
    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected");

    // 2. Clear old collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // 3. Create Default Admin
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@praveen.store",
      password: hashedPassword,
      role: "admin",
      phone: "+91 99999 88888",
      avatar: "https://i.pinimg.com/1200x/7b/f8/88/7bf8886ae511e5fd6bc642592f8b88fa.jpg",
    });
    console.log("Admin Account Created");

    // 4. Read products from products.json
    const productsFilePath = path.join(__dirname, "../products.json");

    if (!fs.existsSync(productsFilePath)) {
      throw new Error(`products.json not found at ${productsFilePath}`);
    }

    const rawProducts = JSON.parse(fs.readFileSync(productsFilePath, "utf8"));

    // 5. Extract unique categories and seed them
    const uniqueCategoryNames = [...new Set(rawProducts.map(p => p.category).filter(Boolean))];
    const categoriesData = uniqueCategoryNames.map(name => ({
      name,
      slug: name.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-").replace(/[^a-z0-9-]+/g, "")
    }));

    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`Categories Created: ${createdCategories.length}`);

    // Helper map to look up Category ID by Name
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // 6. Map and seed products
    const productsData = rawProducts.map((p) => ({
      name: p.name,
      description: p.description || `${p.name} - premium item from Praveen Stores.`,
      price: p.price,
      originalPrice: p.originalPrice || 0,
      brand: p.brand || "",
      category: categoryMap[p.category] || null,
      stock: p.stock !== undefined ? p.stock : 50,
      rating: p.rating !== undefined ? p.rating : 4.5,
      numOfReviews: 0,
      images: [{ url: p.image || "https://i.pinimg.com/1200x/be/3c/58/be3c58f1bbd182e1e632f73bc4ba20db.jpg" }],
      user: adminUser._id,
      reviews: []
    }));

    await Product.insertMany(productsData);
    console.log(`Products Imported: ${productsData.length}`);

    console.log("Seeding Completed Successfully");
    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
