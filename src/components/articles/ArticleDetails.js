import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaHeart } from "react-icons/fa";
import { HiOutlineCalendar } from "react-icons/hi";
import { Button, Card, Spinner, Textarea, Badge } from "flowbite-react";

const ArticleDetails = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [reply, setReply] = useState("");
  const [likes, setLikes] = useState(0);
  const [visibleComments, setVisibleComments] = useState(3);
  const [activeCommentId, setActiveCommentId] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(`https://itdesk-backend.vercel.app/api/articles/${id}`);
        setArticle(response.data);
        setLikes(response.data.likes.length);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `https://itdesk-backend.vercel.app/api/articles/${id}/comments`,
        { content: comment },
        { headers: { Authorization: `${localStorage.getItem("token")}` } }
      );
      setArticle(response.data);
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleReplySubmit = async (commentId) => {
    try {
      const response = await axios.post(
        `https://itdesk-backend.vercel.app/api/articles/${id}/comments/${commentId}/replies`,
        { content: reply },
        { headers: { Authorization: `${localStorage.getItem("token")}` } }
      );
      setArticle(response.data);
      setReply("");
      setActiveCommentId(null);
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const handleLike = async () => {
    try {
      const response = await axios.post(
        `https://itdesk-backend.vercel.app/api/articles/${id}/likes`,
        {},
        { headers: { Authorization: `${localStorage.getItem("token")}` } }
      );
      setArticle(response.data);
      setLikes(response.data.likes.length);
    } catch (error) {
      console.error("Error adding like:", error);
    }
  };

  const handleLoadMoreComments = () => {
    setVisibleComments((prev) => prev + 5);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
        <span className="ml-3 text-gray-600">Loading article...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-red-600">
        Oops! Something went wrong: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Article Header */}
        <Card className="shadow-lg overflow-hidden">
          {article.background_image && (
            <img
              src={article.background_image}
              alt={article.title}
              className="w-full h-64 sm:h-80 object-cover rounded-t-lg animate-fade-in"
            />
          )}
          <div className="p-6 bg-white">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 animate-slide-up">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <HiOutlineCalendar />
                <span>{formatDate(article.dateCreated)}</span>
              </div>
              <Badge color="warning" className="animate-bounce-in">
                {article.category}
              </Badge>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">{article.content}</p>
          </div>
        </Card>

        {/* Like Section */}
        <div className="mt-6 flex justify-start">
          <Button
            onClick={handleLike}
            gradientDuoTone="pinkToOrange"
            className="flex items-center transition-transform hover:scale-105"
          >
            <FaHeart className="mr-2" />
            <span>Likes ({likes})</span>
          </Button>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Comments</h2>

          {/* Add Comment */}
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="mb-3 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <Button type="submit" gradientDuoTone="cyanToBlue">
              Post Comment
            </Button>
          </form>

          {/* Comments List */}
          {article.comments.length === 0 ? (
            <p className="text-gray-500 italic">Be the first to comment!</p>
          ) : (
            article.comments.slice(0, visibleComments).map((comment) => (
              <Card key={comment._id} className="mb-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-600 font-semibold">{comment.user.username}</span>
                    <span className="text-gray-500 text-sm">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                  <Button
                    color="light"
                    size="sm"
                    className="mt-2"
                    onClick={() => setActiveCommentId(activeCommentId === comment._id ? null : comment._id)}
                  >
                    Reply
                  </Button>

                  {/* Reply Form */}
                  {activeCommentId === comment._id && (
                    <form onSubmit={() => handleReplySubmit(comment._id)} className="mt-3">
                      <Textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Write a reply..."
                        rows={2}
                        className="mb-2"
                        required
                      />
                      <Button type="submit" size="sm" gradientDuoTone="cyanToBlue">
                        Submit Reply
                      </Button>
                    </form>
                  )}

                  {/* Replies */}
                  {comment.replies.map((reply) => (
                    <div key={reply._id} className="ml-6 mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-blue-600 font-semibold">{reply.user.username}</span>
                        <span className="text-gray-500 text-sm">{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="text-gray-700">{reply.content}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          )}

          {/* Load More Comments */}
          {visibleComments < article.comments.length && (
            <Button
              onClick={handleLoadMoreComments}
              color="gray"
              className="mt-4 mx-auto block hover:bg-gray-200 transition-colors"
            >
              Load More Comments
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple CSS animations (add to your CSS file or use Tailwind with a plugin)
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes bounceIn {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(1); }
  }
  .animate-fade-in { animation: fadeIn 0.8s ease-in; }
  .animate-slide-up { animation: slideUp 0.6s ease-out; }
  .animate-bounce-in { animation: bounceIn 0.5s ease-in-out; }
`;

export default ArticleDetails;
