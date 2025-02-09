import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Button, Textarea, Toast, Select, TextInput, Card, Label, FileInput, Spinner, Modal } from 'flowbite-react';
import ReCAPTCHA from 'react-google-recaptcha';

const Incident = () => {
    const [formData, setFormData] = useState({
        email: '',
        title: '',
        description: '',
        department: '',
        type: '',
        attachments: []
    });
    
    const [fileNames, setFileNames] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const captchaRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [ticketInfo, setTicketInfo] = useState(null);

    const { email, title, description, department, type } = formData;

    const generateTicketNumber = () => {
        const date = new Date();
        const timestamp = date.getTime().toString();
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `TKT-${timestamp}-${randomNum}`;
    };

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onFileChange = e => {
        const files = Array.from(e.target.files);
        setFormData({ ...formData, attachments: files });
        setFileNames(files.map(file => file.name));
    };

    const onSubmit = async e => {
        e.preventDefault();
        if (!captchaVerified) {
            setToast({ show: true, message: 'Please complete the reCAPTCHA verification.' });
            return;
        }

        setLoading(true);

        try {
            const ticketNumber = generateTicketNumber();
            const form = new FormData();
            form.append('email', email);
            form.append('ticketNumber', ticketNumber);
            form.append('title', formData.title);
            form.append('description', formData.description);
            form.append('department', formData.department);
            form.append('type', formData.type);
            formData.attachments.forEach(file => {
                form.append('attachments', file);
            });

            const response = await axios.post('https://itdesk-backend.vercel.app/api/tickets/create', form, {
                headers: { Authorization: `${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' }
            });

            setToast({ show: true, message: formData.type + ' report submitted successfully.' });
            setFormData({
                email: '', 
                title: '',
                description: '',
                department: '',
                type: '',
                attachments: []
            });
            setFileNames([]);
            setCaptchaVerified(false);
            if (captchaRef.current) {
                captchaRef.current.reset();
            }

            setTicketInfo(response.data); // Set ticket info for the modal
            setModalVisible(true); // Show the modal

        } catch (err) {
            console.error('Incident report error:', err.response);
            setToast({ show: true, message: err.response.data['message'] });
        } finally {
            setLoading(false);
        }
    };

    const handleCaptchaChange = (value) => {
        if (value) {
            setCaptchaVerified(true);
        } else {
            setCaptchaVerified(false);
        }
    };

    const closeModal = () => setModalVisible(false);

    return (
        <>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center">Incident Report Form</h1>
            <div className="max-w-2xl mx-auto mt-4 m-2">
                {toast.show && (
                    <Toast className='mb-2 max-w-md'>
                        <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                            <svg
                                aria-hidden="true"
                                className="h-5 w-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 4.707a1 1 0 00-1.414-1.414L7 11.586 4.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l9-9z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="sr-only">Check icon</span>
                        </div>
                        <div className="ml-3 text-sm font-normal">{toast.message}</div>
                        <Toast.Toggle onClick={() => setToast({ ...toast, show: false })} />
                    </Toast>
                )}
                <Card>
                    <form onSubmit={onSubmit}>
                        <div className="mb-2 block">
                            <Label htmlFor="email" value="Email Address" />
                        </div>
                        <TextInput
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={email}
                            onChange={onChange}
                            className='mb-2'
                            required
                        />
                        <div className="mb-2 block">
                            <Label htmlFor="title" value="Title" />
                        </div>
                        <TextInput
                            type="text"
                            name="title"
                            placeholder="Title"
                            value={title}
                            onChange={onChange}
                            className='mb-2'
                            required
                        />
                        <div className="mb-2 block">
                            <Label htmlFor="description" value="Descriptions" />
                        </div>
                        <Textarea
                            name="description"
                            placeholder="Description"
                            value={description}
                            onChange={onChange}
                            className='mb-2'
                            rows={4}
                            required
                        />
                        <h1 className="mb-2 text-sm text-gray-700 dark:text-gray-400">Attachments</h1>
                        <div className="flex w-full items-center justify-center">
                            <Label
                                htmlFor="dropzone-file"
                                className="flex mb-2 h-36 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                            >
                                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                    <svg
                                        className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 20 16"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                        />
                                    </svg>
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                                </div>
                                <FileInput id="dropzone-file" className="hidden" onChange={onFileChange} multiple />
                            </Label>
                        </div>
                        {fileNames.length > 0 && (
                            <div className="mt-2 mb-2 bg-gray-100 rounded-md p-2">
                                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-400">Attached Files:</h2>
                                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-400">
                                    {fileNames.map((name, index) => (
                                        <li key={index}>{name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="mb-2 block">
                            <Label htmlFor="type" value="Type" />
                        </div>
                        <Select
                            name="type"
                            value={type}
                            onChange={onChange}
                            className='mb-2'
                            required
                        >
                            <option value="">Select Type</option>
                            <option value="Incident">Incident</option>
                            <option value="Request">Request</option>
                        </Select>
                        <div className="mb-2 block">
                            <Label htmlFor="department" value="Department" />
                        </div>
                        <Select
                            name="department"
                            value={department}
                            onChange={onChange}
                            className='mb-2'
                            required
                        >
                            <option value="">Select Department</option>
                            <option value="IT">IT</option>
                            <option value="HR">HR</option>
                            <option value="Finance">Finance</option>
                        </Select>

                        <div className="w-full mb-4">
                            <ReCAPTCHA
                                sitekey="6LeYuNEqAAAAAIEOylhCIH-fLBRUL4y5lOIchYl-" // Replace with your reCAPTCHA site key
                                onChange={handleCaptchaChange}
                                className='max-w-md w-full mb-4'
                            />
                        </div>
                        
                        <Button type="submit" className="w-full mt-4" disabled={loading}>
                            {loading ? <Spinner size="sm" light={true} /> : 'Submit'}
                        </Button>
                    </form>
                </Card>
            </div>

            <Modal show={modalVisible} onClose={closeModal}>
                <Modal.Header>
                    Ticket Confirmation
                </Modal.Header>
                <Modal.Body>
                    <p className='mb-2'>Your ticket has been created successfully. Here are the details:</p>
                    {ticketInfo && (
                        <ul className="list-disc list-inside bg-gray-100 rounded p-2 mb-2">
                            <li><strong>Ticket Number:</strong> {ticketInfo.ticketNumber}</li>
                            <li><strong>Title:</strong> {ticketInfo.title}</li>
                            <li><strong>Description:</strong> {ticketInfo.description}</li>
                            <li><strong>Department:</strong> {ticketInfo.department}</li>
                            <li><strong>Status:</strong> {ticketInfo.status}</li>
                            <li><strong>Priority:</strong> {ticketInfo.priority}</li>
                            <li><strong>Type:</strong> {ticketInfo.type}</li>
                            <li><strong>Due Date:</strong> {ticketInfo.dueDate ? new Date(ticketInfo.dueDate).toLocaleDateString() : 'N/A'}</li>
                        </ul>
                    )}
                    <p>A confirmation email has been sent to your provided email address.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={closeModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Incident;
