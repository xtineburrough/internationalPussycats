require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors()); // Allows your HTML file to talk to this server
app.use(express.json()); // Allows server to read JSON data

const Filter = require('bad-words');


const filter = new Filter();

// Middleware


// 1. Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("Could not connect to MongoDB:", err));

// 2. Define the Schema (The structure of your data)
const MemberSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  nickname: String,
  city: String,
  instrument: String,
  dateJoined: { type: Date, default: Date.now }
});

const Member = mongoose.model('Member', MemberSchema);

// 3. API Route: Save a new member (POST)
app.post('/api/members', async (req, res) => {
  try {
    const { firstname, lastname, nickname, city, instrument } = req.body;

    // Check for bad words in any of the fields
    if (filter.isProfane(firstname) || 
        filter.isProfane(lastname) || 
        filter.isProfane(nickname) || 
        filter.isProfane(city) || 
        filter.isProfane(instrument)) {
      
      return res.status(400).json({ error: "Profanity detected. Keep it clean, pussycat!" });
    }

    // If clean, create the member
    const newMember = new Member(req.body);
    await newMember.save();
    res.status(201).json(newMember);


  } catch (error) {
    res.status(500).json({ error: 'Failed to save member' });
  }
});

// 4. API Route: Get all members (GET)
app.get('/api/members', async (req, res) => {
  try {
    const members = await Member.find().sort({ dateJoined: -1 }); // Newest first
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
