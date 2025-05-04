import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Share2, Bookmark, BookmarkCheck, Flag, RefreshCw, Twitter, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../utils/api';
import { format } from 'date-fns';

interface FeedItem {
  _id: string;
  source: string;
  content: string;
  author: {
    name: string;
    id: string;
    profileUrl?: string;
  };
  mediaUrl?: string;
  url: string;
  likes: number;
  shares: number;
  comments: number;
  timestamp: string;
  savedBy: string[];
}

interface FeedResponse {
  feeds: FeedItem[];
  totalPages: number;
  currentPage: number;
  totalFeeds: number;
}

const Feed: React.FC = () => {
  const [page, setPage] = useState(1);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportingFeedId, setReportingFeedId] = useState<string | null>(null);
  
  // Fetch feed data
  const { data, isLoading, isError, refetch } = useQuery<FeedResponse>(
    ['feeds', page],
    async () => {
      const response = await api.get(`/feeds?page=${page}&limit=10`);
      return response.data;
    },
    {
      keepPreviousData: true,
      onSuccess: (data) => {
        // Extract saved feed IDs
        const saved = data.feeds
          .filter(feed => feed.savedBy && feed.savedBy.length > 0)
          .map(feed => feed._id);
        
        setSavedIds(prev => [...new Set([...prev, ...saved])]);
      }
    }
  );
  
  // Handle save/unsave feed
  const handleSaveToggle = async (feedId: string) => {
    try {
      if (savedIds.includes(feedId)) {
        await api.post(`/feeds/${feedId}/unsave`);
        setSavedIds(prev => prev.filter(id => id !== feedId));
        toast.success('Removed from saved items');
      } else {
        await api.post(`/feeds/${feedId}/save`);
        setSavedIds(prev => [...prev, feedId]);
        await api.post('/credits/award', { action: 'save', feedId });
        toast.success('Saved to your collection (+2 credits)');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save feed');
    }
  };
  
  // Handle share
  const handleShare = async (feedId: string, url: string) => {
    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard (+3 credits)');
      
      // Award credits
      await api.post('/credits/award', { action: 'share', feedId });
    } catch (error) {
      toast.error('Failed to share');
    }
  };
  
  // Handle report
  const openReportModal = (feedId: string) => {
    setReportingFeedId(feedId);
    setReportReason('');
    setReportModalOpen(true);
  };
  
  const submitReport = async () => {
    if (!reportingFeedId || !reportReason) return;
    
    try {
      await api.post(`/feeds/${reportingFeedId}/report`, { reason: reportReason });
      await api.post('/credits/award', { action: 'report', feedId: reportingFeedId });
      toast.success('Content reported successfully (+1 credit)');
      setReportModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to report content');
    }
  };
  
  return (
    <Layout title="Content Feed">
      <div className="space-y-6">
        {/* Header with refresh button */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            Discover content from Twitter and Reddit
          </p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-x-1 text-blue-600 hover:text-blue-800"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
        
        {/* Feed content */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading feed content...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-10">
              <p className="text-red-500">Error loading feed. Please try again.</p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : data?.feeds && data.feeds.length > 0 ? (
            <>
              {data.feeds.map((feed) => (
                <div key={feed._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5">
                    {/* Feed Header with Source and Author */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-x-2">
                        <span className={`p-1 rounded flex items-center gap-x-1 ${feed.source === 'twitter' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                          {feed.source === 'twitter' ? (
                            <>
                              <Twitter className="h-4 w-4" />
                              <span className="text-xs font-medium">Twitter</span>
                            </>
                          ) : (
                            <>
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                              </svg>
                              <span className="text-xs font-medium">Reddit</span>
                            </>
                          )}
                        </span>
                        <span className="text-sm text-gray-600">
                          {feed.author.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(feed.timestamp), 'MMM d, yyyy')}
                      </span>
                    </div>
                    
                    {/* Feed Content */}
                    <div className="mb-4">
                      <p className="text-gray-800 whitespace-pre-line">
                        {feed.content.length > 300 
                          ? `${feed.content.substring(0, 300)}...` 
                          : feed.content}
                      </p>
                      
                      {feed.mediaUrl && (
                        <img 
                          src={feed.mediaUrl} 
                          alt="Media content" 
                          className="mt-3 rounded-lg max-h-64 object-cover"
                        />
                      )}
                    </div>
                    
                    {/* Feed Stats */}
                    <div className="flex items-center gap-x-4 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-x-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{feed.likes}</span>
                      </div>
                      <div className="flex items-center gap-x-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{feed.comments}</span>
                      </div>
                      <div className="flex items-center gap-x-1">
                        <BarChart2 className="h-4 w-4" />
                        <span>{feed.shares || 0}</span>
                      </div>
                    </div>
                    
                    {/* Feed Actions */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <a 
                        href={feed.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View original
                      </a>
                      
                      <div className="flex gap-x-2">
                        <button
                          onClick={() => handleSaveToggle(feed._id)}
                          className={`p-2 rounded-full ${
                            savedIds.includes(feed._id)
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                          title={savedIds.includes(feed._id) ? 'Unsave' : 'Save'}
                        >
                          {savedIds.includes(feed._id) ? (
                            <BookmarkCheck className="h-5 w-5" />
                          ) : (
                            <Bookmark className="h-5 w-5" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleShare(feed._id, feed.url)}
                          className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100"
                          title="Share"
                        >
                          <Share2 className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => openReportModal(feed._id)}
                          className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100"
                          title="Report"
                        >
                          <Flag className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                      disabled={page === data.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600">No feed content available</p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report Content</h3>
            <p className="text-gray-600 mb-4">
              Please let us know why you're reporting this content:
            </p>
            
            <div className="mb-4">
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a reason</option>
                <option value="Misinformation">Misinformation</option>
                <option value="Hate speech">Hate speech</option>
                <option value="Violates terms">Violates terms</option>
                <option value="Spam">Spam</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                disabled={!reportReason}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Feed;