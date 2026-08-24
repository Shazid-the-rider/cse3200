require("dotenv").config();
const connectDB = require('./config/connectDB')
const uploadProductRoute = require('./routes/admin/uploadProductRoute')
const getAllProductRoute = require('./routes/user/getAllProductRoute')
const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000;
connectDB()


app.use("/", uploadProductRoute)
app.use("/", getAllProductRoute)

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});