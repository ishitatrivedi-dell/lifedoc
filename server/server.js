const express = require("express");
const cors = require("cors")
const dotenv = require("dotenv");
const app = express();
dotenv.config()
app.use(express.json());

// Unprotected routes here

app.use(cors())

// Protected routes here

const PORT = process.env.SERVER_PORT || 3001;


app.listen(PORT, () => {
    console.log(`The server is running on http://localhost:${PORT}`);
})