import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Modal, 
  Button, 
  Card, 
  TextInput, 
  Spinner 
} from 'flowbite-react';
import SidebarComponent from '../utils/SidebarComponent';
import { 
  HiOutlineFolder, 
  HiOutlinePlus, 
  HiOutlineTrash, 
  HiOutlineSearch, 
  HiOutlineDownload,
  HiOutlineCalendar
} from 'react-icons/hi';

const FolderDetails = () => {
  const { id } = useParams(); // Get the folder ID from the URL
  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(null); // For deletion confirmation, store asset ID
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
  const [searchTerm, setSearchTerm] = useState(''); // For search functionality
  const [currentPage, setCurrentPage] = useState(1);
  const [assetsPerPage] = useState(5); // Number of assets per page

  useEffect(() => {
    const fetchFolder = async () => {
      try {
        const response = await fetch(`https://itdesk-backend.vercel.app/api/assets/folder/${id}`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` } // Add auth header if required
        });
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

    const fetchFolders = async () => {
      try {
        const response = await fetch(`https://itdesk-backend.vercel.app/api/assets/folder/list`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` } // Add auth header if required
        });
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

    fetchFolder();
    fetchFolders();
  }, [id]);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleFileUpload = async () => {
    setUploading(true);
    const formData = new FormData();
    for (const file of files) {
      formData.append('attachments', file);
    }
    formData.append('folderId', id);
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

    try {
      const response = await fetch(`https://itdesk-backend.vercel.app/api/assets/create`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFolder(prevFolder => ({
          ...prevFolder,
          assets: [...prevFolder.assets, ...data.assets],
        }));
        setModalOpen(false);
        setFiles([]);
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
          "Authorization": `Bearer ${localStorage.getItem('token')}` // Add auth header if required
        },
        body: JSON.stringify({ assetId: selectedAsset._id, targetFolderId }),
      });

      if (response.ok) {
        setFolder(prevFolder => ({
          ...prevFolder,
          assets: prevFolder.assets.filter(asset => asset._id !== selectedAsset._id),
        }));
        setMoveModalOpen(false);
        setSelectedAsset(null);
        setTargetFolderId('');
      } else {
        console.error('Failed to move file:', response.statusText);
      }
    } catch (error) {
      console.error('Error moving file:', error);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    setDeleteModalOpen(null); // Close confirmation modal after deletion
    try {
      const response = await fetch(`https://itdesk-backend.vercel.app/api/assets/${assetId}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` } // Add auth header if required
      });

      if (response.ok) {
        setFolder(prevFolder => ({
          ...prevFolder,
          assets: prevFolder.assets.filter(asset => asset._id !== assetId),
        }));
      } else {
        console.error('Failed to delete asset:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  // Filter assets based on search term
  const filteredAssets = folder?.assets.filter(asset =>
    asset.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.assetType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asset.vendor && asset.vendor.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (asset.model && asset.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  const indexOfLastAsset = currentPage * assetsPerPage;
  const indexOfFirstAsset = indexOfLastAsset - assetsPerPage;
  const currentAssets = filteredAssets?.slice(indexOfFirstAsset, indexOfLastAsset);
  const totalPages = Math.ceil((filteredAssets?.length || 0) / assetsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDownload = async (assetPath) => {
    try {
      const response = await fetch(assetPath, {
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` } // Add auth header if required
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = assetPath.split('/').pop() || 'asset_file'; // Use the filename from the URL or a default name
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        link.remove();
      } else {
        console.error('Failed to download file:', response.statusText);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarComponent />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6 bg-gray-100 p-4 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-800">Folder Details</h1>
          <Button
            onClick={() => setModalOpen(true)}
            color="blue"
            icon={HiOutlinePlus}
            className="hover:bg-blue-600 transition-colors"
          >
            Upload Asset
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner size="xl" />
          </div>
        ) : folder ? (
          <div className="space-y-6">
            <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <HiOutlineFolder className="text-blue-500 w-6 h-6" />
                  <h2 className="text-xl font-semibold text-blue-600">{folder.category}</h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <HiOutlineCalendar className="text-gray-500 w-5 h-5" />
                  <span>Created on: {new Date(folder.dateCreated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-4">
              <TextInput
                icon={HiOutlineSearch}
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Assets Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentAssets?.map((asset) => (
                <Card
                  key={asset._id}
                  className="p-4 shadow-md rounded-lg border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HiOutlineFolder className="text-blue-500 w-5 h-5" />
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{asset.assetName}</h3>
                      </div>
                      <Button
                        onClick={() => handleDownload(asset.assetPath)}
                        color="gray"
                        size="xs"
                        className="p-1 rounded-full hover:bg-gray-300"
                        title="Download Asset"
                      >
                        <HiOutlineDownload className="w-5 h-5 text-gray-700" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div><span>Type: {asset.assetType || 'N/A'}</span></div>
                      <div><span>Vendor: {asset.vendor || 'N/A'}</span></div>
                      <div><span>Model: {asset.model || 'N/A'}</span></div>
                      <div><span>Serial Number: {asset.serialNumber || 'N/A'}</span></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <Button
                        onClick={() => handleMoveClick(asset)}
                        color="blue"
                        size="xs"
                        className="hover:bg-blue-600"
                      >
                        Move
                      </Button>
                      <Button
                        onClick={() => setDeleteModalOpen(asset._id)}
                        color="failure"
                        size="xs"
                        className="hover:bg-red-600"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-6">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  color="gray"
                  className="hover:bg-gray-300"
                >
                  Previous
                </Button>
                <span className="self-center text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  color="gray"
                  className="hover:bg-gray-300"
                >
                  Next
                </Button>
              </div>
            )}

            {/* Upload Modal */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)} size="md">
              <Modal.Header className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Upload Asset</h3>
              </Modal.Header>
              <Modal.Body className="p-4 space-y-4">
                <TextInput
                  id="assetName"
                  placeholder="Asset Name"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full"
                />
                <TextInput
                  id="assetType"
                  placeholder="Asset Type"
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="w-full"
                />
                <TextInput
                  id="assetDescription"
                  placeholder="Asset Description"
                  value={assetDescription}
                  onChange={(e) => setAssetDescription(e.target.value)}
                  className="w-full"
                />
                <TextInput
                  id="purchaseDate"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full"
                />
                <TextInput
                  id="cost"
                  type="number"
                  placeholder="Cost"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full"
                />
                <TextInput
                  id="vendor"
                  placeholder="Vendor"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full"
                />
                <TextInput
                  id="invoiceNumber"
                  placeholder="Invoice Number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full"
                />
                <TextInput
                  id="warranty"
                  placeholder="Warranty (e.g., 1 year)"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="w-full"
                />
                <TextInput
                  id="purchaseOrderNumber"
                  placeholder="Purchase Order Number"
                  value={purchaseOrderNumber}
                  onChange={(e) => setPurchaseOrderNumber(e.target.value)}
                  className="w-full"
                />
                <TextInput
                  id="location"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full"
                />
                <TextInput
                  id="hardwareSpecs"
                  placeholder="Hardware Specs"
                  value={hardwareSpecs}
                  onChange={(e) => setHardwareSpecs(e.target.value)}
                  className="w-full"
                />
                <TextInput
                  id="softwareVersion"
                  placeholder="Software Version"
                  value={softwareVersion}
                  onChange={(e) => setSoftwareVersion(e.target.value)}
                  className="w-full"
                />
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded-lg"
                />
                {uploading && <Spinner size="sm" className="mt-2" />}
              </Modal.Body>
              <Modal.Footer className="p-4 bg-gray-50 border-t border-gray-200">
                <Button onClick={handleFileUpload} color="blue" disabled={uploading}>
                  <HiOutlinePlus className="mr-2 w-5 h-5" />
                  Upload
                </Button>
                <Button onClick={() => setModalOpen(false)} color="gray" className="ml-2" disabled={uploading}>
                  Cancel
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Move Modal */}
            <Modal show={moveModalOpen} onClose={() => setMoveModalOpen(false)} size="md">
              <Modal.Header className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Move Asset</h3>
              </Modal.Header>
              <Modal.Body className="p-4">
                <p className="mb-4 text-sm text-gray-700">
                  Move "{selectedAsset?.assetName}" to another folder:
                </p>
                <select
                  value={targetFolderId}
                  onChange={(e) => setTargetFolderId(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select a folder</option>
                  {folders.map((folder) => (
                    <option key={folder._id} value={folder._id}>
                      {folder.category}
                    </option>
                  ))}
                </select>
              </Modal.Body>
              <Modal.Footer className="p-4 bg-gray-50 border-t border-gray-200">
                <Button onClick={handleMoveFile} color="blue" disabled={!targetFolderId}>
                  Move
                </Button>
                <Button onClick={() => setMoveModalOpen(false)} color="gray" className="ml-2">
                  Cancel
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={deleteModalOpen !== null} onClose={() => setDeleteModalOpen(null)} size="sm">
              <Modal.Header className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
              </Modal.Header>
              <Modal.Body className="p-4 text-center">
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete the asset "{folder?.assets.find(asset => asset._id === deleteModalOpen)?.assetName}"? This action cannot be undone.
                </p>
              </Modal.Body>
              <Modal.Footer className="p-4 bg-gray-50 border-t border-gray-200">
                <Button onClick={() => handleDeleteAsset(deleteModalOpen)} color="failure">
                  Delete
                </Button>
                <Button onClick={() => setDeleteModalOpen(null)} color="gray" className="ml-2">
                  Cancel
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">Folder not found</p>
        )}
      </div>
    </div>
  );
};

export default FolderDetails;
