import React, { useState } from "react";
import { Button, Form, Card, Container } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

async function createPost(formData, navigate) {
    try {
        console.log('Creating post with formData:', {
            title: formData.get('title'),
            caption: formData.get('caption'),
            userId: formData.get('userId')
        });

        const response = await axios.post("http://localhost:5050/api/posts", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        console.log("Post created response:", response.data);
        navigate("/");
    } catch (error) {
        console.error("Error creating post:", {
            message: error.message,
            response: error.response?.data
        });
    }
}


export default function Post() {
    const [title, setTitle] = useState("");
    const [image, setImage] = useState(null);
    const [caption, setCaption] = useState("");
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    // Create a state to hold the image preview URL
    const [imagePreview, setImagePreview] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert("Not logged in.");
            return;
        }

        console.log('Current user in handleSubmit:', {
            uid: currentUser.uid,
            email: currentUser.email,
            metadata: currentUser.metadata,  // This will show when the user was created/last signed in
            providerId: currentUser.providerId
        });

        const formData = new FormData();
        formData.append("title", title);
        formData.append("caption", caption);
        formData.append("userId", currentUser.uid);
        if (image) {
            formData.append("image", image);
        }

        console.log('Form data being sent:', {
            title: formData.get('title'),
            caption: formData.get('caption'),
            userId: formData.get('userId')
        });

        createPost(formData, navigate);
    };

    // Handle the image file change and create a preview URL
    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        setImage(selectedImage);

        // Create a preview URL and store it in state
        const previewURL = URL.createObjectURL(selectedImage);
        setImagePreview(previewURL);
    };

    return (
        <Container>
            <Card className="my-3"> {/* Fixed className */}
                <Card.Body>
                    <h2 className="mb-3">Create New Post</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="title">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Post Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="caption" className="mt-3">
                            <Form.Label>Caption</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Post Caption"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="image" className="mt-3">
                            <Form.Label>Image</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={handleImageChange} // Update the image when selected
                                required
                            />
                        </Form.Group>

                        {/* Display the image preview */}
                        {imagePreview && (
                            <div className="mt-3">
                                <h5>Image Preview:</h5>
                                <img
                                    src={imagePreview}
                                    alt="Selected"
                                    style={{ width: "100%", maxHeight: "300px", objectFit: "cover" }}
                                />
                            </div>
                        )}
                        <Button className="mt-3" variant="primary" type="submit">
                            Create Post
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}
