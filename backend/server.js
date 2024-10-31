const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data.json");

app.use(bodyParser.json());
app.use(cors());

// Ensure the data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [] }, null, 2));
}

// Helper function to validate login
const isValidLogin = (login) => {
  return login && login.trim().length > 0;
};

// Helper function to validate amount
const isValidAmount = (amount) => {
  return !isNaN(amount) && amount > 0;
};

// Get data
app.get("/data", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading data file");
    }
    res.send(JSON.parse(data));
  });
});

// Save data
app.post("/data", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading data file");
    }
    const jsonData = JSON.parse(data);
    const updatedUsers = req.body.users;

    // Update the users array
    jsonData.users = updatedUsers;

    fs.writeFile(
      DATA_FILE,
      JSON.stringify(jsonData, null, 2),
      "utf8",
      (err) => {
        if (err) {
          return res.status(500).send("Error writing data file");
        }
        res.json({ message: "Data saved successfully" });
      }
    );
  });
});

// Add transaction
app.post("/add-transaction", (req, res) => {
  const { login, transaction } = req.body;

  if (!isValidAmount(transaction.amount)) {
    return res.status(400).send("Invalid amount");
  }

  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading data file");
    }
    const jsonData = JSON.parse(data);

    const user = jsonData.users.find((u) => u.login === login);
    if (user) {
      user.transactions.push(transaction);
      fs.writeFile(
        DATA_FILE,
        JSON.stringify(jsonData, null, 2),
        "utf8",
        (err) => {
          if (err) {
            return res.status(500).send("Error writing data file");
          }
          res.json({ message: "Transaction added successfully" });
        }
      );
    } else {
      res.status(404).send("User not found");
    }
  });
});

// Delete transaction
app.post("/delete-transaction", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading data file");
    }
    const jsonData = JSON.parse(data);
    const { login, transaction } = req.body;

    const user = jsonData.users.find((u) => u.login === login);
    if (user) {
      user.transactions = user.transactions.filter(
        (t) =>
          t.date !== transaction.date ||
          t.amount !== transaction.amount ||
          t.description !== transaction.description
      );
      fs.writeFile(
        DATA_FILE,
        JSON.stringify(jsonData, null, 2),
        "utf8",
        (err) => {
          if (err) {
            return res.status(500).send("Error writing data file");
          }
          res.json({ message: "Transaction deleted successfully" });
        }
      );
    } else {
      res.status(404).send("User not found");
    }
  });
});

// Register user
app.post("/register", (req, res) => {
  const { login, password } = req.body;
  if (!isValidLogin(login)) {
    return res.status(400).send("Invalid login");
  }

  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading data file");
    }
    const jsonData = JSON.parse(data);
    if (jsonData.users.find((u) => u.login === login)) {
      return res.status(400).send("User already exists");
    }

    jsonData.users.push({ login, password, transactions: [] });
    fs.writeFile(
      DATA_FILE,
      JSON.stringify(jsonData, null, 2),
      "utf8",
      (err) => {
        if (err) {
          return res.status(500).send("Error writing data file");
        }
        res.json({ message: "User registered successfully" });
      }
    );
  });
});

// Login user
app.post("/login", (req, res) => {
  const { login, password } = req.body;
  if (!isValidLogin(login)) {
    return res.status(400).send("Invalid login");
  }

  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading data file");
    }
    const jsonData = JSON.parse(data);
    const user = jsonData.users.find(
      (u) => u.login === login && u.password === password
    );
    if (user) {
      res.json({ message: "Login successful", user });
    } else {
      res.status(400).send("Invalid login or password");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
