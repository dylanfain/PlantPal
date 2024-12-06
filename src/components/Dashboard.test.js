import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext'; // Adjust the path
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard'; // Adjust the 


jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
}));

jest.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({
        currentUser: { email: 'testmail@gmail.com' }, // Mock currentUser for testing
        logout: jest.fn(),
        // Mock any additional functions your Dashboard needs
    }),
}));

describe('Dashboard Component', () => {
    const { logout } = require('../contexts/AuthContext').useAuth();
    
    beforeEach(() => {
        jest.clearAllMocks();
        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );
    });


    test('renders Dashboard components', () => {
        expect(screen.getByText(/PlantPal/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/search.../i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Profile/i })).toBeInTheDocument();
        expect(screen.getByText(/your plant feed/i)).toBeInTheDocument();
        expect(screen.getByText(/plant post 1/i)).toBeInTheDocument();
        expect(screen.getByText(/plant post 2/i)).toBeInTheDocument();
        expect(screen.getByText(/plant post 3/i)).toBeInTheDocument();
        expect(screen.getByText(/following/i)).toBeInTheDocument();
    });

    test('renders posts in the feed', () => {
        expect(screen.getAllByRole('img')).toHaveLength(3);
        expect(screen.getByText(/plant post 1/i)).toBeInTheDocument();
        expect(screen.getByText(/this is a beautiful plant/i)).toBeInTheDocument();
    });

    test('increments like count when like button is clicked', () => {
        const likeButton = screen.getAllByRole('button', {name: /like/i})[0];
        const likeCount = screen.getAllByText(/like \(0\)/i)[0];
        expect(likeCount).toHaveTextContent('Like (0)');
        fireEvent.click(likeButton);
        expect(likeCount).toHaveTextContent('Like (1)');
    })

    test('allows user to only like once', () => {
        const likeButton = screen.getAllByRole('button', {name: /like/i})[0];
        const likeCount = screen.getAllByText(/like \(0\)/i)[0];
        expect(likeCount).toHaveTextContent('Like (0)');
        fireEvent.click(likeButton);
        expect(likeCount).toHaveTextContent('Like (1)');
        fireEvent.click(likeButton);
        expect(likeCount).toHaveTextContent('Like (1)');
    });

    test('allows user to comment', () => {
        const commentButton = screen.getAllByRole('button', {name: /comment/i})[0];
        fireEvent.click(commentButton);
        const commentInput = screen.getByPlaceholderText(/Write a comment.../i);
        fireEvent.change(commentInput, { target: { value: 'This is a test comment' } });
        const submitButton = screen.getByRole('button', { name: /submit/i });
        fireEvent.click(submitButton);
        expect(screen.getByText(/this is a test comment/i)).toBeInTheDocument();
    });
});