import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaHeart } from 'react-icons/fa';

const ArticleDetails = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [reply, setReply] = useState('');
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
        setError(error);
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
        { headers: { Authorization: `${localStorage.getItem('token')}` } }
      );
      setArticle(response.data);
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleReplySubmit = async (commentId) => {
    try {
      const response = await axios.post(
        `https://itdesk-backend.vercel.app/api/articles/${id}/comments/${commentId}/replies`,
        { content: reply },
        { headers: { Authorization: `${localStorage.getItem('token')}` } }
      );
      setArticle(response.data);
      setReply('');
      setActiveCommentId(null);
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleLike = async () => {
    try {
      const response = await axios.post(
        `https://itdesk-backend.vercel.app/api/articles/${id}/likes`,
        {},
        { headers: { Authorization: `${localStorage.getItem('token')}` } }
      );
      setArticle(response.data);
      setLikes(response.data.likes.length);
    } catch (error) {
      console.error('Error adding like:', error);
    }
  };

  const handleLoadMoreComments = () => {
    setVisibleComments((prevVisibleComments) => prevVisibleComments + 5);
  };

  if (loading) return <div className='flex justify-center'>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className='p-2 rounded-lg'>
        {article.background_image && (
          <img
            src={`${article.background_image}`}
            alt={article.title}
            className="w-full h-64 object-cover mb-4 rounded-md"
          />
        )}
        <div className='bg-gray-100 p-4 rounded-lg'>
          <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
          <p className="text-gray-600 mb-4">Date Created: {new Date(article.dateCreated).toLocaleDateString()}</p>
          <div className="mb-4">
            <span className="badge badge-info w-fit bg-yellow-200 p-1 rounded-sm">{article.category}</span>
          </div>
          <p>{article.content}</p>
        </div>
      </div>
      <div className="mt-4">
        <button onClick={handleLike} className="flex items-center btn btn-primary">
          <FaHeart className="mr-2" />({likes})
        </button>
      </div>
      <form onSubmit={handleCommentSubmit} className="mt-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Add a comment"
          required
        />
        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Submit</button>
      </form>
      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-2">Comments</h2>
        {article.comments.slice(0, visibleComments).map((comment) => (
          <div key={comment._id} className="mb-2 p-2 border rounded">
            <div className="flex items-center justify-between">
              <p className="text-blue-800 underline font-semibold text-sm mb-4">{comment.user.username}</p>
              <p className="text-gray-500 font-semibold text-xs">{new Date(comment.createdAt).toLocaleDateString()}</p>
            </div>
            <p className="text-gray-800 text-md mb-4 p-2 rounded-sm bg-gray-50">{comment.content}</p>
            <button
              onClick={() => setActiveCommentId(comment._id)}
              className="text-blue-500 underline text-sm hover:text-blue-700 focus:outline-none"
            >
              Reply
            </button>
            {activeCommentId === comment._id && (
              <form onSubmit={() => handleReplySubmit(comment._id)} className="mt-2">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Add a reply"
                  required
                />
                <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Reply</button>
              </form>
            )}
            {comment.replies.map((reply) => (
              <div key={reply._id} className="ml-4 mt-2 p-2 border rounded bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-blue-800 underline font-semibold text-sm mb-2">{reply.user.username}</p>
                  <p className="text-gray-500 font-semibold text-xs">{new Date(reply.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-gray-800 text-md">{reply.content}</p>
              </div>
            ))}
          </div>
        ))}
        {visibleComments < article.comments.length && (
          <button onClick={handleLoadMoreComments} className="btn btn-secondary mt-2">
            Load more comments
          </button>
        )}
      </div>
    </div>
  );
};

export default ArticleDetails;
