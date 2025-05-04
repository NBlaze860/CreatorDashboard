import express from 'express';
import User from '../models/User.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get user credits
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      total: user.credits.total,
      history: user.credits.history
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add credits to user (admin only)
router.post('/add', authenticate, isAdmin, async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;
    
    if (!userId || !amount || !reason) {
      return res.status(400).json({ message: 'userId, amount, and reason are required' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.credits.total += Number(amount);
    user.credits.history.push({
      amount: Number(amount),
      reason
    });
    
    await user.save();
    
    res.json({
      userId,
      credits: user.credits.total,
      message: 'Credits added successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Award credits for interaction
router.post('/award', authenticate, async (req, res) => {
  try {
    const { action, feedId } = req.body;
    const user = await User.findById(req.user._id);
    
    let creditsAwarded = 0;
    let reason = '';
    
    // Award credits based on action
    switch (action) {
      case 'save':
        creditsAwarded = 2;
        reason = `Saved content (ID: ${feedId})`;
        break;
      case 'share':
        creditsAwarded = 3;
        reason = `Shared content (ID: ${feedId})`;
        break;
      case 'report':
        creditsAwarded = 1;
        reason = `Reported inappropriate content (ID: ${feedId})`;
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }
    
    // Update user credits
    user.credits.total += creditsAwarded;
    user.credits.history.push({
      amount: creditsAwarded,
      reason
    });
    
    await user.save();
    
    res.json({
      creditsAwarded,
      newTotal: user.credits.total,
      message: `${creditsAwarded} credits awarded for ${action}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;