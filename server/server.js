require("dotenv").config();

console.log("MONGO_URI value:", process.env.MONGO_URI);



const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
