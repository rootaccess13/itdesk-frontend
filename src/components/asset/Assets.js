import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link from React Router
import { Card, Modal, Button, TextInput } from "flowbite-react"; // Import Flowbite components
import SidebarComponent from "../utils/SidebarComponent";
import { CiCalendarDate } from "react-icons/ci";

const Assets = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newFolderCategory, setNewFolderCategory] = useState("");

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch(
          "https://itdesk-backend.vercel.app/api/assets/folder/list"
        );
        if (response.ok) {
          const data = await response.json();
          setFolders(data);
        } else {
          console.error("Failed to fetch folders:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching asset folders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
  }, []);

  const handleCreateFolder = async () => {
    try {
      const response = await fetch(
        "https://itdesk-backend.vercel.app/api/assets/folder/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: newFolderCategory }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFolders([...folders, data]); // Add new folder to the state
        setModalOpen(false); // Close the modal
        setNewFolderCategory(""); // Clear the input
      } else {
        console.error("Failed to create folder:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    try {
      const response = await fetch(
        `https://itdesk-backend.vercel.app/api/assets/${assetId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Refresh the folder list after successful deletion
        const foldersResponse = await fetch(
          "https://itdesk-backend.vercel.app/api/assets/folder/list"
        );
        if (foldersResponse.ok) {
          const data = await foldersResponse.json();
          setFolders(data);
        }
      }
    } catch (error) {
      console.error("Error deleting asset:", error);
    }
  };
  return (
    <div className="flex h-screen">
      <SidebarComponent />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Asset Folders</h1>
        <div className="w-full flex justify-between items-center mb-4 bg-gray-100 p-2">
          <button
            onClick={() => setModalOpen(true)}
            type="button"
            className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          >
            Create Folder
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {folders.map((folder) => (
              <Link to={`/folder/${folder._id}`} key={folder._id}>
                <Card className="p-0 shadow-md rounded-lg gap-0 border border-gray-400 cursor-pointer border-b-4">
                  <div className="flex justify-between rounded-lg items-center bg-gray-100 p-2">
                    <h2 className="text-xl font-semibold">
                      {folder.category} folder
                    </h2>
                    <span className="text-gray-600">
                      Contents: {folder.assets.length}
                    </span>
                  </div>
                  <p className="flex items-center text-sm text-gray-600 gap-1">
                    <CiCalendarDate size={24} />
                    Created on:{" "}
                    {new Date(folder.dateCreated).toLocaleDateString()}
                  </p>
                  <ul>
                    {folder.assets.map((asset) => (
                      <li
                        key={asset._id}
                        className="text-gray-800 mb-1 flex justify-between items-center"
                      >
                        {asset.assetName}
                        <button
                          onClick={() => handleDeleteAsset(asset._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete asset"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Modal for Creating Folder */}
        <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
          <Modal.Header>Create New Folder</Modal.Header>
          <Modal.Body>
            <TextInput
              id="folderCategory"
              placeholder="Enter folder category"
              value={newFolderCategory}
              onChange={(e) => setNewFolderCategory(e.target.value)}
              required
            />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleCreateFolder} color="success">
              Create Folder
            </Button>
            <Button onClick={() => setModalOpen(false)} color="gray">
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Assets;
