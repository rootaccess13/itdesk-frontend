import React, { useState, useEffect } from "react";
import SidebarComponent from "../utils/SidebarComponent";
import { FaBullhorn, FaTrash } from "react-icons/fa";
import { Label, TextInput, Textarea, Button, Spinner, Modal, Card, FileInput, Checkbox, Badge } from "flowbite-react";
import { HiOutlineCalendar } from "react-icons/hi";

const Announcement = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [banner, setBanner] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [fetchingAnnouncements, setFetchingAnnouncements] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setFetchingAnnouncements(true);
      const response = await fetch('https://itdesk-backend.vercel.app/api/announcements');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setFetchingAnnouncements(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (banner) formData.append('banner', banner);
    formData.append('is_public', isPublic);
    formData.append('is_active', isActive);

    try {
      const response = await fetch('https://itdesk-backend.vercel.app/api/announcements/create', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage("Announcement created successfully");
        resetForm();
        fetchAnnouncements();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Failed to create announcement");
      }
    } catch (error) {
      setErrorMessage("Error creating announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const response = await fetch(`https://itdesk-backend.vercel.app/api/announcements/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccessMessage("Announcement deleted successfully");
        setAnnouncements(announcements.filter(ann => ann._id !== id));
      } else {
        setErrorMessage("Failed to delete announcement");
      }
    } catch (error) {
      setErrorMessage("Error deleting announcement");
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setBanner(null);
    setIsPublic(true);
    setIsActive(true);
    setModalOpen(false);
  };

  const handleFileChange = (e) => {
    setBanner(e.target.files[0]);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarComponent />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="flex items-center gap-2 text-3xl font-semibold text-gray-800">
              <FaBullhorn className="text-blue-600" /> Announcements
            </h1>
            <Button 
              onClick={() => setModalOpen(true)} 
              gradientDuoTone="greenToBlue"
              className="font-medium"
            >
              Create New Announcement
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
            {fetchingAnnouncements ? (
              <div className="col-span-full text-center py-8">
                <Spinner size="xl" />
                <p className="mt-2 text-gray-600">Loading announcements...</p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-600">
                No announcements found
              </div>
            ) : (
              announcements.map((announcement) => (
                <Card 
                  key={announcement._id} 
                  className="shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  {announcement.banner && (
                    <img
                      src={announcement.banner}
                      alt={announcement.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-xl font-semibold text-gray-900">
                        {announcement.title}
                      </h5>
                      <Button
                        color="failure"
                        size="xs"
                        onClick={() => handleDeleteAnnouncement(announcement._id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                    <p className="text-gray-600 mb-3">{announcement.content}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <HiOutlineCalendar />
                      <span>
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Badge color={announcement.is_public ? "success" : "warning"}>
                        {announcement.is_public ? "Public" : "Private"}
                      </Badge>
                      <Badge color={announcement.is_active ? "info" : "gray"}>
                        {announcement.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Create Announcement Modal */}
          <Modal show={modalOpen} onClose={resetForm} size="xl">
            <Modal.Header className="bg-gradient-to-r from-blue-500 to-blue-600">
              <span className="text-white">Create New Announcement</span>
            </Modal.Header>
            <Modal.Body className="space-y-6">
              <div>
                <Label htmlFor="title" value="Title" className="text-gray-700" />
                <TextInput
                  id="title"
                  placeholder="Enter announcement title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="content" value="Content" className="text-gray-700" />
                <Textarea
                  id="content"
                  placeholder="Write your announcement here..."
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="banner" value="Banner Image" className="text-gray-700" />
                <FileInput
                  id="banner"
                  onChange={handleFileChange}
                  className="mt-1"
                  helperText="Upload an image banner (optional)"
                />
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_public"
                    checked={isPublic}
                    onChange={() => setIsPublic(!isPublic)}
                  />
                  <Label htmlFor="is_public" className="text-gray-700">Public</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_active"
                    checked={isActive}
                    onChange={() => setIsActive(!isActive)}
                  />
                  <Label htmlFor="is_active" className="text-gray-700">Active</Label>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                onClick={handleCreateAnnouncement}
                disabled={loading}
                gradientDuoTone="greenToBlue"
              >
                {loading ? (
                  <Spinner size="sm" className="mr-2" />
                ) : null}
                Create Announcement
              </Button>
              <Button color="gray" onClick={resetForm}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Announcement;
