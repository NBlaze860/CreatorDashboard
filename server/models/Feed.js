import mongoose from 'mongoose';

const FeedSchema = new mongoose.Schema({
  sourceId: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true,
    enum: ['twitter', 'reddit', 'linkedin']
  },
  content: {
    type: String,
    required: true
  },
  author: {
    name: String,
    id: String,
    profileUrl: String
  },
  mediaUrl: String,
  url: String,
  likes: Number,
  shares: Number,
  comments: Number,
  timestamp: Date,
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reportedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Feed = mongoose.model('Feed', FeedSchema);

export default Feed;