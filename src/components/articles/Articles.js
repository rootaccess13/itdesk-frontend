import React, { useState, useContext, useEffect } from "react";
import { Modal, Button, Label, TextInput, Textarea, FileInput, Card, Badge, Spinner } from "flowbite-react";
import { Link } from "react-router-dom";
import { FaTrash, FaPen } from "react-icons/fa";
import { HiOutlineCalendar } from "react-icons/hi";
import SidebarComponent from "../utils/SidebarComponent";
import AuthContext from "../../context/AuthContext";

const Articles = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://itdesk-backend.vercel.app/api/articles");
      if (response.ok) {
        const articlesData = await response.json();
        setArticles(articlesData);
      } else {
        setErrorMessage("Failed to fetch articles");
      }
    } catch (err) {
      setErrorMessage("Error fetching articles: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setBackgroundImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("content", content);
    formData.append("created_by", user._id);
    if (backgroundImage) {
      formData.append("background_image", backgroundImage);
    }

    try {
      const response = await fetch("https://itdesk-backend.vercel.app/api/articles/create", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const newArticle = await response.json();
        setSuccessMessage("Article created successfully");
        setArticles([...articles, newArticle]);
        resetForm();
      } else {
        setErrorMessage("Error creating article: " + response.statusText);
      }
    } catch (err) {
      setErrorMessage("Error creating article: " + err.message);
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;

    try {
      const response = await fetch(`https://itdesk-backend.vercel.app/api/articles/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSuccessMessage("Article deleted successfully");
        setArticles(articles.filter((article) => article._id !== id));
      } else {
        setErrorMessage("Failed to delete article");
      }
    } catch (err) {
      setErrorMessage("Error deleting article: " + err.message);
    }
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setContent("");
    setBackgroundImage(null);
    setModalIsOpen(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarComponent />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-2">
              <FaPen className="text-blue-600" /> Articles
            </h1>
            <Button
              onClick={() => setModalIsOpen(true)}
              gradientDuoTone="greenToBlue"
              className="font-medium"
            >
              Create New Article
            </Button>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <Spinner size="xl" />
                <p className="mt-2 text-gray-600">Loading articles...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-600">
                No articles found
              </div>
            ) : (
              articles.map((article) => (
                <Card
                  key={article._id}
                  className="shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  {article.background_image && (
                    <img
                      src={article.background_image}
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <Link to={`/articles/${article._id}`} className="block">
                        <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          {article.title}
                        </h2>
                      </Link>
                      <Button
                        color="failure"
                        size="xs"
                        onClick={() => handleDeleteArticle(article._id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                    <Badge color="info" className="w-fit mb-2">
                      {article.category}
                    </Badge>
                    <p className="text-gray-600 line-clamp-2 mb-3">{article.content}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <HiOutlineCalendar />
                      <span>{formatDate(article.dateCreated)}</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Create Article Modal */}
          <Modal show={modalIsOpen} onClose={resetForm} size="xl">
            <Modal.Header className="bg-gradient-to-r from-blue-500 to-blue-600">
              <span className="text-white">Create New Article</span>
            </Modal.Header>
            <Modal.Body className="space-y-6">
              <form onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="title" value="Title" className="text-gray-700" />
                  <TextInput
                    id="title"
                    placeholder="Enter article title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div className="mt-4">
                  <Label htmlFor="category" value="Category" className="text-gray-700" />
                  <TextInput
                    id="category"
                    placeholder="Enter category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div className="mt-4">
                  <Label htmlFor="content" value="Content" className="text-gray-700" />
                  <Textarea
                    id="content"
                    placeholder="Write your article content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={6}
                    className="mt-1"
                  />
                </div>
                <div className="mt-4">
                  <Label htmlFor="backgroundImage" value="Background Image" className="text-gray-700" />
                  <FileInput
                    id="backgroundImage"
                    onChange={handleFileChange}
                    className="mt-1"
                    helperText="Upload an image (optional)"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button type="submit" gradientDuoTone="greenToBlue">
                    Create Article
                  </Button>
                  <Button color="gray" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Articles;
