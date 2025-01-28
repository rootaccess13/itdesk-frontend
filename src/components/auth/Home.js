import React, { useState, useEffect, useCallback } from 'react';
import { Card, TextInput, Badge } from "flowbite-react";
import { HiSearch } from "react-icons/hi";
import { Link } from "react-router-dom";
import './style.css';

const Home = () => {
    const [articles, setArticles] = useState([]);
    const [groupedArticles, setGroupedArticles] = useState({});
    const [searchQuery, setSearchQuery] = useState("");

    const fetchArticles = useCallback(async () => {
        try {
            const response = await fetch("https://itdesk-backend.vercel.app/api/articles");
            if (response.ok) {
                const data = await response.json();
                setArticles(data);
                groupArticlesByCategory(data);
            } else {
                console.error('Error fetching articles:', response.statusText);
            }
        } catch (err) {
            console.error('Error fetching articles:', err.message);
        }
    }, []);
    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const groupArticlesByCategory = (articles) => {
        const grouped = articles.reduce((acc, article) => {
            const category = article.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(article);
            return acc;
        }, {});
        setGroupedArticles(grouped);
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        const filteredArticles = articles.filter((article) =>
            article.title.toLowerCase().includes(e.target.value.toLowerCase()) ||
            article.category.toLowerCase().includes(e.target.value.toLowerCase()) ||
            article.content.toLowerCase().includes(e.target.value.toLowerCase())
        );
        groupArticlesByCategory(filteredArticles);
    };

    return (
        <div className="flex h-screen">
            <div className="container mx-auto p-4 mb-4">
                <div className="max-w-lg mx-auto mb-4">
                    <TextInput
                        id="search"
                        type="text"
                        icon={HiSearch}
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="mb-4"
                    />
                </div>
                {Object.keys(groupedArticles).map((category) => (
                    <div key={category} className="mb-4">
                        <div className="flex justify-between items-center rounded-md bg-gray-100 p-2 mb-2">
                            <h2 className="text-xl font-bold">{category} category</h2>
                            <Badge color="info" className='w-fit text-md'>{groupedArticles[category].length}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-2">
                            {groupedArticles[category].map((article) => (
                                <Link to={`/articles/${article._id}`} className="block" key={article._id}>
                                    <Card className="max-w-sm gap-0 m-0">
                                        {article.background_image && (
                                            <img
                                                src={`https://itdesk-backend.vercel.app/${article.background_image}`}
                                                alt={article.title}
                                                className="w-full h-48 object-cover rounded-t-md"
                                            />
                                        )}
                                        <div className="p-4">
                                            <h2 className="text-xl font-bold truncate">{article.title}</h2>
                                            <Badge color="info" className='w-fit'>{article.category}</Badge>
                                            <p className="mt-2 truncate">{article.content}</p>
                                            <p className="text-sm text-gray-500 mt-2">Date Created: {new Date(article.dateCreated).toLocaleDateString('en-GB')}</p>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
