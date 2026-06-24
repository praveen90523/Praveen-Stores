const express = require("express");
const router = express.Router();
const { getAIChatResponse } = require("../services/aiService");

// @desc    Get AI Chat completion from Marina
// @route   POST /api/ai/chat
// @access  Public
router.post("/chat", async (req, res) => {
  try {
    const { messages, query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    const chatResponse = await getAIChatResponse(messages || [], query);

    res.status(200).json(chatResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get AI response",
    });
  }
});

module.exports = router;
