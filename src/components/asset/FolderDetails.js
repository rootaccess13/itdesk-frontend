import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Modal, Button, Spinner, Card, Label, TextInput, Textarea, Select } from "flowbite-react";
import { FiDownload } from "react-icons/fi"; // Added FaTrash for delete
import { FaTrash } from "react-icons/fa";

import SidebarComponent from "../utils/SidebarComponent";

const FolderDetails = () => {
  const { id } = useParams();
  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState("");
  const [folders, setFolders] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    assetName: "",
    assetType: "",
    assetDescription: "",
    purchaseDate: "",
    cost: "",
    vendor: "",
    invoiceNumber: "",
    warranty: "",
    purchaseOrderNumber: "",
    location: "",
    hardwareSpecs: "",
    softwareVersion: "",
  });

  useEffect(() => {
    fetchFolder();
    fetchFolders();
  }, [id]);

  const fetchFolder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://itdesk-backend.vercel.app/api/assets/folder/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFolder(data);
      } else {
        setErrorMessage("Failed to fetch folder details");
      }
    } catch (error) {
      setErrorMessage("Error fetching folder: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await fetch(`https://itdesk-backend.vercel.app/api/assets/folder/list`);
      if (response.ok) {
        const data = await response.json();
        setFolders(data);
      } else {
        setErrorMessage("Failed to fetch folders");
      }
    } catch (error) {
      setErrorMessage("Error fetching folders: " + error.message);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleFileUpload = async () => {
    setUploading(true);
    setErrorMessage("");
    setSuccessMessage("");
    const uploadData = new FormData();
    files.forEach((file) => uploadData.append("attachments", file));
    Object.entries(formData).forEach(([key, value]) => uploadData.append(key, value));
    uploadData.append("folderId", id);

    try {
      const response = await fetch(`https://itdesk-backend.vercel.app/api/assets/create`, {
        method: "POST",
        body: uploadData,
      });
      if (response.ok) {
        const data = await response.json();
        setFolder((prev) => ({
          ...prev,
          assets: [...prev.assets, ...data.assets],
        }));
        setSuccessMessage("Assets uploaded successfully");
        resetForm();
      } else {
        setErrorMessage("Failed to upload assets");
      }
    } catch (error) {
      setErrorMessage("Error uploading assets: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleMoveClick = (asset) => {
    setSelectedAsset(asset);
    setMoveModalOpen(true);
  };

  const handleMoveFile = async () => {
    if (!targetFolderId) {
      setErrorMessage("Please select a target folder");
      return;
    }
    try {
      const response = await fetch(`https://itdesk-backend.vercel.app/api/assets/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: selectedAsset._id, targetFolderId }),
      });
      if (response.ok) {
        setFolder((prev) => ({
          ...prev,
          assets: prev.assets.filter((asset) => asset._id !== selectedAsset._id),
        }));
        setSuccessMessage("Asset moved successfully");
        setMoveModalOpen(false);
        setSelectedAsset(null);
        setTargetFolderId("");
      } else {
        setErrorMessage("Failed to move asset");
      }
    } catch (error) {
      setErrorMessage("Error moving asset: " + error.message);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      const response = await fetch(`https://itdesk-backend.vercel.app/api/assets/${assetId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setFolder((prev) => ({
          ...prev,
          assets: prev.assets.filter((asset) => asset._id !== assetId),
        }));
        setSuccessMessage("Asset deleted successfully");
      } else {
        setErrorMessage("Failed to delete asset");
      }
    } catch (error) {
      setErrorMessage("Error deleting asset: " + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      assetName: "",
      assetType: "",
      assetDescription: "",
      purchaseDate: "",
      cost: "",
      vendor: "",
      invoiceNumber: "",
      warranty: "",
      purchaseOrderNumber: "",
      location: "",
      hardwareSpecs: "",
      softwareVersion: "",
    });
    setFiles([]);
    setModalOpen(false);
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarComponent />
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-800">Folder Details</h1>
            <Button onClick={() => setModalOpen(true)} gradientDuoTone="greenToBlue">
              Create Asset
            </Button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{successMessage}</div>
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner size="xl" />
              <span className="ml-3 text-gray-600">Loading folder...</span>
            </div>
          ) : folder ? (
            <Card className="shadow-lg">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-blue-600">{folder.category}</h2>
                  <p className="text-sm text-gray-500">Created: {formatDate(folder.dateCreated)}</p>
                </div>
                {folder.assets.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No assets in this folder</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">File Name</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Asset Type</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Manufacturer</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Model</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Serial Number</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {folder.assets.map((asset) => (
                          <tr key={asset._id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <a
                                href={asset.assetPath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline flex items-center gap-2"
                              >
                                {asset.assetName}
                                <FiDownload className="text-gray-600 hover:text-blue-700" />
                              </a>
                            </td>
                            <td className="p-3">{asset.assetType}</td>
                            <td className="p-3">{asset.manufacturer || "N/A"}</td>
                            <td className="p-3">{asset.model || "N/A"}</td>
                            <td className="p-3">{asset.serialNumber || "N/A"}</td>
                            <td className="p-3 flex gap-2">
                              <Button
                                size="xs"
                                color="gray"
                                onClick={() => handleMoveClick(asset)}
                              >
                                Move
                              </Button>
                              <Button
                                size="xs"
                                color="failure"
                                onClick={() => handleDeleteAsset(asset._id)}
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <p className="text-center py-10 text-gray-600">No folder found</p>
          )}

          {/* Create Asset Modal */}
          <Modal show={modalOpen} onClose={resetForm} size="lg">
            <Modal.Header className="bg-gradient-to-r from-blue-500 to-blue-600">
              <span className="text-white">Create New Asset</span>
            </Modal.Header>
            <Modal.Body className="space-y-4">
              {uploading ? (
                <div className="flex justify-center items-center">
                  <Spinner size="lg" />
                  <span className="ml-3">Uploading assets...</span>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="assetName" value="Asset Name" />
                    <TextInput
                      id="assetName"
                      name="assetName"
                      value={formData.assetName}
                      onChange={handleInputChange}
                      placeholder="Enter asset name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="assetType" value="Asset Type" />
                    <Select
                      id="assetType"
                      name="assetType"
                      value={formData.assetType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Asset Type</option>
                      <option value="Purchase">Purchase</option>
                      <option value="Software">Software</option>
                      <option value="Hardware">Hardware</option>
                      <option value="Other">Other</option>
                    </Select>
                  </div>
                  {formData.assetType === "Purchase" && (
                    <>
                      <div>
                        <Label htmlFor="purchaseDate" value="Purchase Date" />
                        <TextInput
                          id="purchaseDate"
                          name="purchaseDate"
                          type="date"
                          value={formData.purchaseDate}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cost" value="Cost" />
                        <TextInput
                          id="cost"
                          name="cost"
                          type="number"
                          value={formData.cost}
                          onChange={handleInputChange}
                          placeholder="Enter cost"
                        />
                      </div>
                      <div>
                        <Label htmlFor="vendor" value="Vendor" />
                        <TextInput
                          id="vendor"
                          name="vendor"
                          value={formData.vendor}
                          onChange={handleInputChange}
                          placeholder="Enter vendor"
                        />
                      </div>
                      <div>
                        <Label htmlFor="invoiceNumber" value="Invoice Number" />
                        <TextInput
                          id="invoiceNumber"
                          name="invoiceNumber"
                          value={formData.invoiceNumber}
                          onChange={handleInputChange}
                          placeholder="Enter invoice number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="warranty" value="Warranty" />
                        <TextInput
                          id="warranty"
                          name="warranty"
                          value={formData.warranty}
                          onChange={handleInputChange}
                          placeholder="Enter warranty info"
                        />
                      </div>
                      <div>
                        <Label htmlFor="purchaseOrderNumber" value="Purchase Order Number" />
                        <TextInput
                          id="purchaseOrderNumber"
                          name="purchaseOrderNumber"
                          value={formData.purchaseOrderNumber}
                          onChange={handleInputChange}
                          placeholder="Enter PO number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location" value="Location" />
                        <TextInput
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="Enter location"
                        />
                      </div>
                    </>
                  )}
                  {formData.assetType === "Hardware" && (
                    <div className="md:col-span-2">
                      <Label htmlFor="hardwareSpecs" value="Hardware Specifications" />
                      <TextInput
                        id="hardwareSpecs"
                        name="hardwareSpecs"
                        value={formData.hardwareSpecs}
                        onChange={handleInputChange}
                        placeholder="Enter hardware specs"
                      />
                    </div>
                  )}
                  {formData.assetType === "Software" && (
                    <div className="md:col-span-2">
                      <Label htmlFor="softwareVersion" value="Software Version" />
                      <TextInput
                        id="softwareVersion"
                        name="softwareVersion"
                        value={formData.softwareVersion}
                        onChange={handleInputChange}
                        placeholder="Enter software version"
                      />
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <Label htmlFor="assetDescription" value="Description" />
                    <Textarea
                      id="assetDescription"
                      name="assetDescription"
                      value={formData.assetDescription}
                      onChange={handleInputChange}
                      placeholder="Enter asset description"
                      rows={4}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label value="Attachments" />
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              {!uploading && (
                <Button onClick={handleFileUpload} gradientDuoTone="greenToBlue">
                  Upload
                </Button>
              )}
              <Button onClick={resetForm} color="gray">
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Move Asset Modal */}
          <Modal show={moveModalOpen} onClose={() => setMoveModalOpen(false)}>
            <Modal.Header>Move Asset</Modal.Header>
            <Modal.Body>
              <Select
                value={targetFolderId}
                onChange={(e) => setTargetFolderId(e.target.value)}
                required
              >
                <option value="">Select target folder</option>
                {folders
                  .filter((f) => f._id !== id) // Exclude current folder
                  .map((folder) => (
                    <option key={folder._id} value={folder._id}>
                      {folder.category}
                    </option>
                  ))}
              </Select>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={handleMoveFile} gradientDuoTone="greenToBlue">
                Move
              </Button>
              <Button onClick={() => setMoveModalOpen(false)} color="gray">
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default FolderDetails;
