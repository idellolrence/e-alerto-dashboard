import Feedback from "../models/feedbackModel.js";

export const listAllFeedback = async (req, res) => {
  try {
    const all = await Feedback.find().sort({ timestamp: -1 }).lean();
    return res.json({ success: true, feedbacks: all });
  } catch (err) {
    console.error("Error fetching feedback:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
