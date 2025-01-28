import React, { useState, useEffect } from "react";
import axios from "axios";
import SidebarComponent from "../utils/SidebarComponent";
// Try changing to default imports for flowbite-react if named imports cause issues
import { Table, Button, Spinner, Modal, TextInput, Label, Checkbox, Select } from 'flowbite-react';

const Profile = () => {
    // Debug log to check if any component is undefined
    // const { Table, Button, Spinner, Modal, TextInput, Label, Checkbox, Select } = Flowbite;
    console.log({ Table, Button, Spinner, Modal, TextInput, Label, Checkbox, Select });

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        role: "",
        isActive: false,
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:5001/api/users/me", {
                headers: { Authorization: localStorage.getItem("token") },
            });
            setUser(res.data);
            setFormData({
                username: res.data.username,
                email: res.data.email,
                role: res.data.role,
                isActive: res.data.isActive,
            });
        } catch (err) {
            setError("Failed to fetch user data.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await axios.put("http://localhost:5001/api/users/me", formData, {
                headers: { Authorization: localStorage.getItem("token") },
            });
            setIsEditing(false);
            setIsModalOpen(false);
            fetchUserData();
        } catch (err) {
            setError("Failed to save user data.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleCheckboxChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.checked,
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
    };

    return (
        <div className="flex h-screen">
            <SidebarComponent />
            <div className="container mx-auto p-4">
                <div className="flex-1 p-10">
                    <h1 className="text-2xl font-bold">Profile</h1>
                    {loading ? (
                        <Spinner className="mt-5" />
                    ) : error ? (
                        <p className="text-red-500 mt-5">{error}</p>
                    ) : user ? (
                        <div className="mt-5">
                            <Table>
                                <Table.Body>
                                    <Table.Row>
                                        <Table.Cell className="font-bold">Username</Table.Cell>
                                        <Table.Cell>{user.username}</Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.Cell className="font-bold">Email</Table.Cell>
                                        <Table.Cell>{user.email}</Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.Cell className="font-bold">Role</Table.Cell>
                                        <Table.Cell>{user.role}</Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.Cell className="font-bold">Is Active</Table.Cell>
                                        <Table.Cell>{user.isActive ? "Yes" : "No"}</Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                            <div className="mt-5">
                                <Button onClick={handleEdit}>Edit Profile</Button>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-5">No user data found.</p>
                    )}
                </div>
            </div>

            {/* Modal for Editing Profile */}
            <Modal show={isModalOpen} onClose={handleCloseModal}>
                <Modal.Header>Edit Profile</Modal.Header>
                <Modal.Body>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="username" value="Username" />
                            <TextInput
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div>
                            <Label htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div>
                            <Label htmlFor="role" value="Role" />
                            <Select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            >
                                <Select.Option value="user">User</Select.Option>
                                <Select.Option value="admin">Admin</Select.Option>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="isActive" value="Is Active" />
                            <Checkbox
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleCheckboxChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleCloseModal} color="gray">Cancel</Button>
                    {isEditing && <Button onClick={handleSave}>Save</Button>}
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Profile;
