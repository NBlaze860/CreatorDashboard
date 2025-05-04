import express from 'express';
import axios from 'axios';
import Feed from '../models/Feed.js';
import User from '../models/User.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Fetch and store Twitter posts
const fetchTwitterPosts = async () => {
  try {
    const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
      params: {
        query: 'creator economy',
        max_results: 10,
        'tweet.fields': 'created_at,public_metrics,author_id'
      },
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
      }
    });
    
    const tweets = response.data.data || [];
    
    // Process and save tweets
    for (const tweet of tweets) {
      // Check if tweet already exists
      const existingFeed = await Feed.findOne({ sourceId: tweet.id, source: 'twitter' });
      if (existingFeed) continue;
      
      // Create new feed
      const newFeed = new Feed({
        sourceId: tweet.id,
        source: 'twitter',
        content: tweet.text,
        author: {
          id: tweet.author_id,
          name: `Twitter User ${tweet.author_id.slice(-4)}` // Placeholder
        },
        url: `https://twitter.com/i/web/status/${tweet.id}`,
        likes: tweet.public_metrics?.like_count || 0,
        shares: tweet.public_metrics?.retweet_count || 0,
        comments: tweet.public_metrics?.reply_count || 0,
        timestamp: new Date(tweet.created_at)
      });
      
      await newFeed.save();
    }
    
    return tweets.length;
  } catch (error) {
    console.error('Twitter API error:', error.response?.data || error.message);
    return 0;
  }
};

// Fetch and store Reddit posts
const fetchRedditPosts = async () => {
  try {
    // Get OAuth token
    const tokenResponse = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')}`
        }
      }
    );
    
    const token = tokenResponse.data.access_token;
    
    // Fetch posts
    const response = await axios.get('https://oauth.reddit.com/r/CreatorEconomy/hot', {
      params: {
        limit: 10
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'CreatorDashboard/1.0'
      }
    });
    
    const posts = response.data.data.children || [];
    
    // Process and save posts
    for (const post of posts) {
      const postData = post.data;
      
      // Check if post already exists
      const existingFeed = await Feed.findOne({ sourceId: postData.id, source: 'reddit' });
      if (existingFeed) continue;
      
      // Create new feed
      const newFeed = new Feed({
        sourceId: postData.id,
        source: 'reddit',
        content: postData.title + (postData.selftext ? `\n\n${postData.selftext}` : ''),
        author: {
          id: postData.author,
          name: postData.author,
          profileUrl: `https://www.reddit.com/user/${postData.author}`
        },
        mediaUrl: postData.thumbnail && postData.thumbnail !== 'self' ? postData.thumbnail : null,
        url: `https://www.reddit.com${postData.permalink}`,
        likes: postData.ups,
        comments: postData.num_comments,
        timestamp: new Date(postData.created_utc * 1000)
      });
      
      await newFeed.save();
    }
    
    return posts.length;
  } catch (error) {
    console.error('Reddit API error:', error.response?.data || error.message);
    return 0;
  }
};

// Get feed posts
router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Refresh feeds if needed (not on every request to avoid API rate limits)
    if (page === 1) {
      try {
        // Check last feed timestamp
        const lastFeed = await Feed.findOne().sort({ createdAt: -1 });
        const now = new Date();
        const refreshNeeded = !lastFeed || 
          (now.getTime() - lastFeed.createdAt.getTime()) > 60 * 60 * 1000; // 1 hour
        
        if (refreshNeeded) {
          // Fetch new content in parallel
          await Promise.all([
            fetchTwitterPosts(),
            fetchRedditPosts()
          ]);
        }
      } catch (error) {
        console.error('Feed refresh error:', error);
        // Continue with existing feeds if refresh fails
      }
    }
    
    // Get feeds with pagination
    const feeds = await Feed.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Feed.countDocuments();
    
    res.json({
      feeds,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalFeeds: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save a feed post
router.post('/:feedId/save', authenticate, async (req, res) => {
  try {
    const { feedId } = req.params;
    const feed = await Feed.findById(feedId);
    
    if (!feed) {
      return res.status(404).json({ message: 'Feed not found' });
    }
    
    const user = await User.findById(req.user._id);
    
    // Check if already saved
    if (user.savedFeeds.includes(feedId)) {
      return res.status(400).json({ message: 'Feed already saved' });
    }
    
    // Add to saved feeds
    user.savedFeeds.push(feedId);
    feed.savedBy.push(user._id);
    
    await Promise.all([user.save(), feed.save()]);
    
    res.json({ message: 'Feed saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unsave a feed post
router.post('/:feedId/unsave', authenticate, async (req, res) => {
  try {
    const { feedId } = req.params;
    const user = await User.findById(req.user._id);
    
    // Remove from saved feeds
    user.savedFeeds = user.savedFeeds.filter(id => id.toString() !== feedId);
    await user.save();
    
    // Remove user from feed's savedBy
    await Feed.findByIdAndUpdate(feedId, {
      $pull: { savedBy: user._id }
    });
    
    res.json({ message: 'Feed removed from saved' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Report a feed post
router.post('/:feedId/report', authenticate, async (req, res) => {
  try {
    const { feedId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Reason for report is required' });
    }
    
    const feed = await Feed.findById(feedId);
    
    if (!feed) {
      return res.status(404).json({ message: 'Feed not found' });
    }
    
    // Check if already reported by this user
    const alreadyReported = feed.reportedBy.some(
      report => report.user.toString() === req.user._id.toString()
    );
    
    if (alreadyReported) {
      return res.status(400).json({ message: 'Already reported by you' });
    }
    
    // Add report
    feed.reportedBy.push({
      user: req.user._id,
      reason
    });
    
    await feed.save();
    
    res.json({ message: 'Feed reported successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get reported feeds (admin only)
router.get('/reported', authenticate, isAdmin, async (req, res) => {
  try {
    const reportedFeeds = await Feed.find({ 'reportedBy.0': { $exists: true } })
      .populate('reportedBy.user', 'username email');
    
    res.json(reportedFeeds);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;