import React, { useState, useContext, useEffect } from "react";
import { Modal, Button, Label, TextInput, Textarea, FileInput, Card, Badge } from "flowbite-react";
import { Link } from "react-router-dom";
import SidebarComponent from "../utils/SidebarComponent";
import AuthContext from '../../context/AuthContext';

const Articles = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [content, setContent] = useState("");
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [articles, setArticles] = useState([]);

    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/articles");
                if (response.ok) {
                    const articlesData = await response.json();
                    setArticles(articlesData);
                } else {
                    console.error("Error fetching articles:", response.statusText);
                }
            } catch (err) {
                console.error("Error fetching articles:", err.message);
            }
        };

        fetchArticles();
    }, []);

    const openModal = () => setModalIsOpen(true);
    const closeModal = () => setModalIsOpen(false);

    const handleFileChange = (e) => {
        setBackgroundImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('content', content);
        formData.append('created_by', user._id);
        if (backgroundImage) {
            formData.append('background_image', backgroundImage);
        }

        try {
            const response = await fetch("http://localhost:5001/api/articles/create", {
                method: "POST",
                body: formData,
            });
            if (response.ok) {
                const newArticle = await response.json();
                console.log("Article created:", newArticle);
                setArticles([...articles, newArticle]);
                closeModal();
            } else {
                console.error("Error creating article:", response.statusText);
            }
        } catch (err) {
            console.error("Error creating article:", err.message);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };

    return (
        <div>
            <div className="flex h-screen">
                <SidebarComponent />
                <div className="container mx-auto p-4">
                    <h1 className="flex flex-row gap-2 items-center text-2xl font-bold mb-4">Articles</h1>
                    <div className="w-full flex justify-between items-center mb-4 bg-gray-100 p-2">
                        <Button onClick={openModal}>
                            Create Article
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {articles.map((article) => (
                            <Link to={`/articles/${article._id}`} className="block">
                                <Card key={article._id} className="article-card max-w-sm">
                                    {article.background_image && (
                                        <img
                                            src={`${article.background_image}`}
                                            alt={article.title}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <div className="p-4">
                                        <h2 className="text-xl font-bold truncate">{article.title}</h2>
                                        <Badge color="info" className="w-fit">{article.category}</Badge>
                                        <p className="text-sm text-gray-500 mt-2">Date Created: {formatDate(article.dateCreated)}</p>
                                        <p className="mt-2 truncate">{article.content}</p>
                                    </div>
                                </Card>
                            </Link>
                            
                        ))}
                    </div>
                    <Modal show={modalIsOpen} onClose={closeModal}>
                        <Modal.Header>
                            Create Article
                        </Modal.Header>
                        <Modal.Body>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <Label htmlFor="title" value="Title" />
                                    <TextInput
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <Label htmlFor="category" value="Category" />
                                    <TextInput
                                        id="category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <Label htmlFor="content" value="Content" />
                                    <Textarea
                                        id="content"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <Label htmlFor="backgroundImage" value="Background Image" />
                                    <FileInput
                                        id="backgroundImage"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit">
                                        Submit
                                    </Button>
                                    <Button onClick={closeModal} className="ml-2" color="gray">
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
