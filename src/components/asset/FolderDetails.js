import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Modal, Button } from 'flowbite-react';
import { FiDownload, FiTrash2, FiPlus, FiMove } from 'react-icons/fi'; // Added FiMove
import SidebarComponent from '../utils/SidebarComponent';

const FolderDetails = () => {
  const { id } = useParams();
  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState('');
  const [folders, setFolders] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [cost, setCost] = useState('');
  const [vendor, setVendor] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [warranty, setWarranty] = useState('');
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState('');
  const [location, setLocation] = useState('');
  const [hardwareSpecs, setHardwareSpecs] = useState('');
  const [softwareVersion, setSoftwareVersion] = useState('');

  useEffect(() => {
    const fetchFolder = async () => {
      try {
        const response = await fetch(`https://itdesk-backend.vercel.app/api/assets/folder/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFolder(data);
        } else {
          console.error('Failed to fetch folder:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching folder details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFolder();
  }, [id]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch(`https://itdesk-backend.vercel.app/api/assets/folder/list`);
        if (response.ok) {
          const data = await response.json();
          setFolders(data);
        } else {
          console.error('Failed to fetch folders:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    };

    fetchFolders();
  }, []);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleFileUpload = async () => {
    setUploading(true);
    const formData = new FormData();
    for (const file of files) {
      formData.append('attachments', file);
    }
    formData.append('assetName', assetName);
    formData.append('assetType', assetType);
    formData.append('assetDescription', assetDescription);
    formData.append('purchaseDate', purchaseDate);
    formData.append('cost', cost);
    formData.append('vendor', vendor);
    formData.append('invoiceNumber', invoiceNumber);
    formData.append('warranty', warranty);
    formData.append('purchaseOrderNumber', purchaseOrderNumber);
    formData.append('location', location);
    formData.append('hardwareSpecs', hardwareSpecs);
    formData.append('softwareVersion', softwareVersion);
    formData.append('folderId', id);

    try {
      const response = await fetch(`https://itdesk-backend.vercel.app/api/assets/create`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setFolder((prevFolder) => ({
          ...prevFolder,
          assets: [...prevFolder.assets, ...data.assets],
        }));
        setModalOpen(false);
        setFiles([]);
        // Reset form fields
        setAssetName('');
        setAssetType('');
        setAssetDescription('');
        setPurchaseDate('');
        setCost('');
        setVendor('');
        setInvoiceNumber('');
        setWarranty('');
        setPurchaseOrderNumber('');
        setLocation('');
        setHardwareSpecs('');
        setSoftwareVersion('');
      } else {
        console.error('Failed to upload files:', response.statusText);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleMoveClick = (asset) => {
    setSelectedAsset(asset);
    setMoveModalOpen(true);
  };

  const handleMoveFile = async () => {
    try {
      const response = await fetch(`https://itdesk-backend.vercel.app/api/assets/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assetId: selectedAsset._id, targetFolderId }),
      });
      if (response.ok) {
        setFolder((prevFolder) => ({
          ...prevFolder,
          assets: prevFolder.assets.filter((asset) => asset._id !== selectedAsset._id),
        }));
        setMoveModalOpen(false);
        setSelectedAsset(null);
      } else {
        console.error('Failed to move file:', response.statusText);
      }
    } catch (error) {
      console.error('Error moving file:', error);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    try {
      const response = await fetch(`https://itdesk-backend.vercel.app/api/assets/${assetId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setFolder((prevFolder) => ({
          ...prevFolder,
          assets: prevFolder.assets.filter((asset) => asset._id !== assetId),
        }));
      } else {
        console.error('Failed to delete asset:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarComponent />
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Folder Details</h1>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            <FiPlus size={18} />
            Create Asset
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        ) : folder ? (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            {/* Folder Info */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-blue-600">{folder.category}</h2>
              <p className="text-sm text-gray-500">
                Created on: {new Date(folder.dateCreated).toLocaleDateString()}
              </p>
            </div>

            {/* Assets Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4 font-semibold text-gray-700">File Name</th>
                    <th className="p-4 font-semibold text-gray-700">Asset Type</th>
                    <th className="p-4 font-semibold text-gray-700">Manufacturer</th>
                    <th className="p-4 font-semibold text-gray-700">Model</th>
                    <th className="p-4 font-semibold text-gray-700">Serial Number</th>
                    <th className="p-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {folder.assets.map((asset) => (
                    <tr
                      key={asset._id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <a
                          href={`${asset.assetPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-500 hover:underline"
                        >
                          {asset.assetName}
                          <FiDownload size={16} className="text-gray-500" />
                        </a>
                      </td>
                      <td className="p-4 text-gray-700">{asset.assetType}</td>
                      <td className="p-4 text-gray-700">{asset.manufacturer}</td>
                      <td className="p-4 text-gray-700">{asset.model}</td>
                      <td className="p-4 text-gray-700">{asset.serialNumber}</td>
                      <td className="p-4 flex gap-2">
                        <button
                          onClick={() => handleMoveClick(asset)}
                          className="text-blue-500 hover:text-blue-700 transition"
                          title="Move"
                        >
                          <FiMove size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset._id)}
                          className="text-red-500 hover:text-red-700 transition"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Folder not found</p>
        )}

        {/* Create Asset Modal */}
        <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
          <Modal.Header>Create New Asset</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Asset Name</label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter asset name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Asset Type</label>
                <input
                  type="text"
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter asset type"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={assetDescription}
                  onChange={(e) => setAssetDescription(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cost</label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter cost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vendor</label>
                <input
                  type="text"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter vendor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter invoice number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Warranty</label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter warranty"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Purchase Order Number</label>
                <input
                  type="text"
                  value={purchaseOrderNumber}
                  onChange={(e) => setPurchaseOrderNumber(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter PO number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hardware Specs</label>
                <input
                  type="text"
                  value={hardwareSpecs}
                  onChange={(e) => setHardwareSpecs(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter hardware specs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Software Version</label>
                <input
                  type="text"
                  value={softwareVersion}
                  onChange={(e) => setSoftwareVersion(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter software version"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Attachments</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={handleFileUpload}
              disabled={uploading || !assetName || files.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
            <Button color="gray" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Move Asset Modal */}
        <Modal show={moveModalOpen} onClose={() => setMoveModalOpen(false)}>
          <Modal.Header>Move Asset</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <p className="text-gray-700">
                Move <span className="font-semibold">{selectedAsset?.assetName}</span> to:
              </p>
              <select
                value={targetFolderId}
                onChange={(e) => setTargetFolderId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a folder</option>
                {folders.map((folder) => (
                  <option key={folder._id} value={folder._id}>
                    {folder.category}
                  </option>
                ))}
              </select>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={handleMoveFile}
              disabled={!targetFolderId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Move
            </Button>
            <Button color="gray" onClick={() => setMoveModalOpen(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default FolderDetails;
