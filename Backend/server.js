require("dotenv").config();
const connectDB = require('./config/connectDB')
const uploadProductRoute = require('./routes/admin/uploadProductRoute')
const getAllProductRoute = require('./routes/user/getAllProductRoute')
const path = require("path");
const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const fs = require("fs");
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000;
connectDB()

const productsDir = path.resolve(
  process.cwd(),
  "uploads",
  "products"
);

console.log("STATIC DIRECTORY:", productsDir);
console.log("DIRECTORY EXISTS:", fs.existsSync(productsDir));


app.use(
  "/uploads/products",
  express.static(productsDir)
);

/*app.use(
  "/uploads/products",
  express.static(
 
    path.join(process.cwd(), "uploads", "products")
  )
);*/
/*
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);*/


app.use("/api/admin", uploadProductRoute);
app.use("/", uploadProductRoute)
app.use("/", getAllProductRoute)

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});