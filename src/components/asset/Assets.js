import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Modal, Button, TextInput } from "flowbite-react";
import SidebarComponent from "../utils/SidebarComponent";
import { 
  HiOutlineFolder, 
  HiOutlinePlus, 
  HiOutlineTrash, 
  HiOutlineCalendar 
} from "react-icons/hi";

const Assets = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newFolderCategory, setNewFolderCategory] = useState("");

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch(
          "https://itdesk-backend.vercel.app/api/assets/folder/list",
          {
            headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` } // Add auth header if required by your backend
          }
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
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}` // Add auth header if required
          },
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

  const handleDeleteFolder = async (folderId) => {
    try {
      const response = await fetch(
        `https://itdesk-backend.vercel.app/api/assets/folder/${folderId}`,
        {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` } // Add auth header if required
        }
      );

      if (response.ok) {
        // Refresh the folder list after successful deletion
        const foldersResponse = await fetch(
          "https://itdesk-backend.vercel.app/api/assets/folder/list",
          {
            headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` } // Add auth header if required
          }
        );
        if (foldersResponse.ok) {
          const data = await foldersResponse.json();
          setFolders(data);
        }
      } else {
        console.error("Failed to delete folder:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarComponent />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6 bg-gray-100 p-4 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-800">Asset Folders</h1>
          <Button
            onClick={() => setModalOpen(true)}
            color="blue"
            icon={HiOutlinePlus}
            className="hover:bg-blue-600 transition-colors"
          >
            Create Folder
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div role="status">
              <svg
                aria-hidden="true"
                className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {folders.map((folder) => (
              <div key={folder._id} className="relative">
                <Link to={`/folder/${folder._id}`}>
                  <Card className="p-4 shadow-md rounded-lg border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HiOutlineFolder className="text-blue-500 w-6 h-6" />
                          <h2 className="text-lg font-semibold text-gray-900 truncate">
                            {folder.category} Folder
                          </h2>
                        </div>
                        <span className="text-sm text-gray-600">
                          {folder.assets.length} {folder.assets.length === 1 ? 'Item' : 'Items'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <HiOutlineCalendar className="text-gray-500 w-5 h-5" />
                        <span>
                          Created on: {new Date(folder.dateCreated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
                <Button
                  onClick={() => handleDeleteFolder(folder._id)}
                  color="failure"
                  size="xs"
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-600 transition-colors"
                  title="Delete Folder"
                >
                  <HiOutlineTrash className="w-5 h-5 text-white" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Creating Folder */}
        <Modal show={modalOpen} onClose={() => setModalOpen(false)} size="md">
          <Modal.Header className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Create New Folder</h3>
          </Modal.Header>
          <Modal.Body className="p-4">
            <TextInput
              id="folderCategory"
              placeholder="Enter folder category"
              value={newFolderCategory}
              onChange={(e) => setNewFolderCategory(e.target.value)}
              required
              className="w-full"
            />
          </Modal.Body>
          <Modal.Footer className="p-4 bg-gray-50 border-t border-gray-200">
            <Button onClick={handleCreateFolder} color="blue">
              <HiOutlinePlus className="mr-2 w-5 h-5" />
              Create Folder
            </Button>
            <Button onClick={() => setModalOpen(false)} color="gray" className="ml-2">
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Assets;
