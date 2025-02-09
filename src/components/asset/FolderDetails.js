import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams to get route parameters
import { Modal, Button } from 'flowbite-react'; // Import Flowbite components
import { FiDownload } from 'react-icons/fi'; // Import icons
import SidebarComponent from '../utils/SidebarComponent';

const FolderDetails = () => {
  const { id } = useParams(); // Get the folder ID from the URL
  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false); // Move modal state
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false); // Add uploading state
  const [targetFolderId, setTargetFolderId] = useState(''); // Target folder for moving files
  const [folders, setFolders] = useState([]); // Folders for moving assets
  const [selectedAsset, setSelectedAsset] = useState(null); // Selected asset to move
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
    setFiles(e.target.files); // Update files state with selected files
  };

  const handleFileUpload = async () => {
    setUploading(true); // Set uploading state to true
    const formData = new FormData();
    for (const file of files) {
      formData.append('attachments', file);
    }

    // Append asset information
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
    formData.append('folderId', id); // Assuming you need to send folder ID

    try {
      const response = await fetch(`https://itdesk-backend.vercel.app/api/assets/create`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFolder(prevFolder => ({
          ...prevFolder,
          assets: [...prevFolder.assets, ...data.assets], // Update folder with new assets
        }));
        setModalOpen(false); // Close the modal
        setFiles([]); // Clear the file input
      } else {
        console.error('Failed to upload files:', response.statusText);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false); // Set uploading state to false
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
        // Update the folder state after moving the asset
        setFolder(prevFolder => ({
          ...prevFolder,
          assets: prevFolder.assets.filter(asset => asset._id !== selectedAsset._id),
        }));
        setMoveModalOpen(false); // Close the modal
        setSelectedAsset(null); // Clear the selected asset
      } else {
        console.error('Failed to move file:', response.statusText);
      }
    } catch (error) {
      console.error('Error moving file:', error);
    }
  };

  // New delete handler for assets
  const handleDeleteAsset = async (assetId) => {
    try {
      const response = await fetch(`https://itdesk-backend.vercel.app/api/assets/${assetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update the folder state after deleting the asset
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

  return (
    <div className="flex h-screen">
      <SidebarComponent />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Folder Details</h1>
        <div className='w-full flex justify-between items-center mb-4 bg-gray-100 p-2'>
          <button onClick={() => setModalOpen(true)} type="button" className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Create</button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : folder ? (
          <div className="p-4 shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold mb-2 text-blue-600">{folder.category}</h2>
              <p className="flex items-center text-sm text-gray-600 mb-4">
                Created on: {new Date(folder.dateCreated).toLocaleDateString()}
              </p>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b-2 p-2 text-left">File Name</th>
                  <th className="border-b-2 p-2 text-left">Asset Type</th>
                  <th className="border-b-2 p-2 text-left">Manufacturer</th>
                  <th className="border-b-2 p-2 text-left">Model</th>
                  <th className="border-b-2 p-2 text-left">Serial Number</th>
                  <th className="border-b-2 p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {folder.assets.map(asset => (
                  <tr key={asset._id}>
                    <td className="p-2">
                      <a
                        href={`${asset.assetPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline flex items-center gap-2"
                      >
                        {asset.assetName}
                        <FiDownload size={16} className="text-gray-500" />
                      </a>
                    </td>
                    <td className="p-2">{asset.assetType}</td>
                    <td className="p-2">{asset.manufacturer}</td>
                    <td className="p-2">{asset.model}</td>
                    <td className="p-2">{asset.serialNumber}</td>
                    <td className="p-2">
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteAsset(asset._id)} // Call delete function on click
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Folder not found</p>
        )}
      </div>
    </div>
  );
};

export default FolderDetails;
