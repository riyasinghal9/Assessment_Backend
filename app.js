const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

mongoose.connect("mongodb://localhost:27017/riya", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: { type: String, unique: true, required: true },
  marks: Number,
});

const answerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the User model
  // question: String,
  // answer: String,
});

const User = mongoose.model("User", userSchema);
// const Answer = mongoose.model("Answer", answerSchema);

app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json());

// Endpoint to submit user details
app.post("/users", async (req, res) => {
  try {
    console.log(req.body);
    const { name, email, phone, marks } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: "Phone number already exists" });
    }

    const newUser = new User({ name, email, phone, marks });
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to submit answers
// app.post("/answers", async (req, res) => {
//   try {
//     const { userId, question, answer } = req.body;

//     // Check if the user exists
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const newAnswer = new Answer({
//       user: userId,
//       question,
//       answer,
//     });

//     const savedAnswer = await newAnswer.save();
//     res.json(savedAnswer);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.get("/users/:phone", async (req, res) => {
//   try {
//     const { phone } = req.params;

//     const user = await User.findOne({ phone });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
// app.get("/getUsers", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const perPage = parseInt(req.query.perPage) || 10;

//     const startIndex = (page - 1) * perPage;

//     const users = await User.find().skip(startIndex).limit(perPage);

//     if (!users || users.length === 0) {
//       return res.status(404).json({ error: "No users found" });
//     }

//     res.json({
//       users,
//       currentPage: page,
//       totalPages: Math.ceil((await User.countDocuments()) / perPage),
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.get("/getUsers", async (req, res) => {
//   try {
//     const users = await User.find();

//     if (!users) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
app.get("/getUsers", async (req, res) => {
  try {
    const searchQuery = req.query.search || "";
    const users = await User.find({
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { phone: { $regex: searchQuery, $options: "i" } },
      ],
    });

    if (users.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
// app.get("/getUsers", async (req, res) => {
//   try {
//     const searchQuery = req.query.search || "";
//     const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
//     const perPage = parseInt(req.query.perPage) || 10; // Default to 10 items per page

//     const startIndex = (page - 1) * perPage;

//     const users = await User.find({
//       $or: [
//         { name: { $regex: searchQuery, $options: "i" } },
//         { phone: { $regex: searchQuery, $options: "i" } },
//       ],
//     })
//       .skip(startIndex)
//       .limit(perPage);

//     if (users.length === 0) {
//       return res.status(404).json({ error: "No users found" });
//     }

//     res.json({
//       users,
//       currentPage: page,
//       totalPages: Math.ceil((await User.countDocuments()) / perPage),
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
