const express = require("express");
const { chatbotChat } = require("../controllers/chatbotController");

const router = express.Router();

// POST /api/chatbot/chat - Send message to chatbot
router.post("/chat", chatbotChat);

module.exports = router;

