import React, { useState, useEffect } from "react";
import SidebarComponent from "../utils/SidebarComponent";
import { FaBullhorn } from "react-icons/fa";
import { Label, TextInput, Textarea, Button, Spinner, Modal, Card, FileInput, Checkbox } from "flowbite-react";


const Announcement = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [banner, setBanner] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [fetchingAnnouncements, setFetchingAnnouncements] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('https://itdesk-backend.vercel.app/api/announcements');
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data);
        } else {
          console.error('Failed to fetch announcements:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setFetchingAnnouncements(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async () => {
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (banner) {
      formData.append('banner', banner);
    }
    formData.append('is_public', isPublic);
    formData.append('is_active', isActive);
    try {
      const response = await fetch('https://itdesk-backend.vercel.app/api/announcements/create', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message);
        setTitle("");
        setContent("");
        setBanner(null);
        setIsPublic(true);
        setIsActive(false);
        setModalOpen(false);
        setAnnouncements((prevAnnouncements) => [...prevAnnouncements, data]); // Update announcements list
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message);
      }
    } catch (error) {
      setErrorMessage("Error creating announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setBanner(e.target.files[0]);
  };

  return (
    <div className="flex h-screen">
      <SidebarComponent />
      <div className="container mx-8 p-4">
        <h1 className="flex flex-row gap-2 items-center text-2xl font-bold mb-4">
          <FaBullhorn /> Announcements
        </h1>
        <div className="flex justify-end mb-4">
          <Button onClick={() => setModalOpen(true)} color="success">Create Announcement</Button>
        </div>
        {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {fetchingAnnouncements ? (
          <p>Loading announcements...</p>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement._id} className="mb-4 max-w-sm">
                {announcement.banner ? (
                    <img
                    src={`${announcement.banner}`}
                    alt={announcement.title}
                    className="w-full h-48 object-cover"
                    />
                ) : (
                    <img
                    src="https://itdesk-backend.vercel.app/uploads/banners/1722262677123_Screen Shot 2024-07-26 at 15.01.52 PM.png"
                    alt="Placeholder"
                    className="w-full h-48 object-cover"
                    />
                )}
                <h5 className="text-xl font-bold tracking-tight text-gray-900">{announcement.title}</h5>
                <p className="font-normal text-gray-700">{announcement.content}</p>
            </Card>

          ))
        )}
        </div>
        {/* Modal for Creating Announcement */}
        <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
          <Modal.Header>Create Announcement</Modal.Header>
          <Modal.Body>
            <div className="mb-4">
              <Label htmlFor="title" value="Title" />
              <TextInput
                id="title"
                placeholder="Announcement title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="content" value="Content" />
              <Textarea
                id="content"
                placeholder="Create announcement"
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div className="mb-4">
                <Label htmlFor="banner" value="Banner Image" />
                <FileInput
                    id="banner"
                    onChange={handleFileChange}
                />
            </div>
            <div className="mb-4">
              <Label htmlFor="is_public" value="Public" />
              <Checkbox
                id="is_public"
                checked={isPublic}
                onChange={() => setIsPublic(!isPublic)}
                label="Public"
                className="ml-2"
              />
              <Label htmlFor="is_active" value="Active" className='ml-4' />
              <Checkbox
                id="is_active"
                checked={isActive}
                onChange={() => setIsActive(!isActive)}
                label="Active"
                className="ml-2"
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button color="success" onClick={handleCreateAnnouncement} disabled={loading}>
              {loading ? (
                <Spinner aria-label="Creating..." />
              ) : (
                "Create Announcement"
              )}
            </Button>
            <Button color="gray" onClick={() => setModalOpen(false)}>Cancel</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Announcement;
