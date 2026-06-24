require("dotenv").config();
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI || "mongodb://praveend1126_db_user:b9o7696D4mxREVWi@ac-krwmqi8-shard-00-00.wonvcox.mongodb.net:27017,ac-krwmqi8-shard-00-01.wonvcox.mongodb.net:27017,ac-krwmqi8-shard-00-02.wonvcox.mongodb.net:27017/ecommerce?ssl=true&replicaSet=atlas-8qtrx3-shard-0&authSource=admin&retryWrites=true&w=majority", { family: 4 })
  .then(() => console.log("Connected"))
  .catch(err => console.error(err));