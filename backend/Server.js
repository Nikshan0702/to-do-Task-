const express = require("express");
const cors = require("cors");
const task = require("./routes/taskRoutes");
const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Mount the routes
app.use("/api/task", task);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
