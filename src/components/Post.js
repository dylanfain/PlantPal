import React, { useState } from "react";
import { Button, Form, Card, Container } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

async function createPost(postDetails, firebaseUserID, navigate) {
    const formData = new FormData(); // Capitalize FormData

    formData.append("title", postDetails.title);
    formData.append("caption", postDetails.caption);
    formData.append("likes", postDetails.likes);
    formData.append("contentType", postDetails.contentType);
    formData.append("userId", firebaseUserID);

    if (postDetails.image) {
        formData.append("image", postDetails.image);
    }

    console.log("Form Data: ", formData); // Add this for debugging

    try {
        const response = await fetch("http://localhost:5000/api/posts", {
            method: "POST",
            body: formData,
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log("Post created:", data);
            navigate("/"); // Use navigate to redirect on success
        } else {
            console.error("Failed to create post.");
        }
    } catch (error) {
        console.error("Error creating a post:", error);
    }
}


export default function Post() {
    const [title, setTitle] = useState("");
    const [image, setImage] = useState(null);
    const [caption, setCaption] = useState("");
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert("Not logged in.");
            return;
        }
        createPost(
            {
                title,
                image,
                caption,
                likes: 0,
                contentType: image ? image.type : ""
            },
            currentUser.uid,
            navigate // Pass navigate as an argument to createPost
        );
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
                                onChange={(e) => setImage(e.target.files[0])}
                                required
                            />
                        </Form.Group>
                        <Button className="mt-3" variant="primary" type="submit">
                            Create Post
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}
