import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Twitter, ExternalLink, Bookmark, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../utils/api';
import { format } from 'date-fns';

interface SavedFeed {
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
  timestamp: string;
}

const SavedContent: React.FC = () => {
  // Fetch saved feeds
  const { data: savedFeeds, isLoading, isError, refetch } = useQuery<SavedFeed[]>(
    'userSavedFeeds',
    async () => {
      const response = await api.get('/users/saved-feeds');
      return response.data;
    }
  );
  
  // Handle unsave
  const handleUnsave = async (feedId: string) => {
    try {
      await api.post(`/feeds/${feedId}/unsave`);
      toast.success('Removed from saved items');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove item');
    }
  };
  
  // Handle share
  const handleShare = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };
  
  return (
    <Layout title="Saved Content">
      <div className="space-y-6">
        {/* Header with count */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            {savedFeeds && savedFeeds.length > 0
              ? `You have ${savedFeeds.length} saved item${savedFeeds.length !== 1 ? 's' : ''}`
              : 'No saved content yet'}
          </p>
          <Link 
            to="/feed"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Discover more content
          </Link>
        </div>
        
        {/* Saved content list */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading saved content...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-10">
              <p className="text-red-500">Error loading saved content. Please try again.</p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : savedFeeds && savedFeeds.length > 0 ? (
            savedFeeds.map((feed) => (
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
                      Saved on {format(new Date(feed.timestamp), 'MMM d, yyyy')}
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
                  
                  {/* Feed Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <a 
                      href={feed.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-x-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View original</span>
                    </a>
                    
                    <div className="flex gap-x-2">
                      <button
                        onClick={() => handleUnsave(feed._id)}
                        className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                        title="Remove from saved"
                      >
                        <Bookmark className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => handleShare(feed.url)}
                        className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100"
                        title="Share"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-200">
              <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved content yet</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Save interesting content from the feed to access it later. Your saved items will appear here.
              </p>
              <Link
                to="/feed"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Browse the feed
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SavedContent;