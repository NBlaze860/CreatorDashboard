import express from 'express';
import User from '../models/User.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { username, bio, avatarUrl } = req.body;
    const user = await User.findById(req.user._id);
    
    // Check if username is taken by another user
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }
    
    // Update fields
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    
    // Check if profile is now complete and award credits if it wasn't before
    if (!user.profileCompleted && bio && avatarUrl) {
      user.profileCompleted = true;
      user.credits.total += 20;
      user.credits.history.push({
        amount: 20,
        reason: 'Profile completion bonus'
      });
    }
    
    await user.save();
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        role: user.role,
        credits: user.credits.total,
        profileCompleted: user.profileCompleted
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user saved feeds
router.get('/saved-feeds', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedFeeds');
    res.json(user.savedFeeds);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user activity (admin can view any user's activity)
router.get('/:userId/activity', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if admin or user is requesting their own activity
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      creditHistory: user.credits.history,
      lastLogin: user.lastLogin,
      profileCompleted: user.profileCompleted
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;