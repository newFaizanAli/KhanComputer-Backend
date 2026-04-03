
const express = require("express");
const cors = require('cors');
const { CONFIG } = require("./constant");
const app = express();


app.use(
    cors({
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api", require("./routes"));


app.use("/check", (req, res) => {
    res.json({ message: " API is working " });
});


const port = CONFIG.PORT;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

