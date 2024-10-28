import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext'; // Adjust the path
import { BrowserRouter } from 'react-router-dom';
import Login from './Login'; // Adjust the path

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
  }));

jest.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({
        login: jest.fn(), 
        getAuth: jest.fn(),
        createUserWithEmailAndPassword: jest.fn(),
        signInWithEmailAndPassword: jest.fn(),
        signOut: jest.fn(),
        sendPasswordResetEmail: jest.fn(),
        onAuthStateChanged: jest.fn(),
    }),
  }));
describe('Login Component', () => {
  const { signInWithEmailAndPassword } = require('firebase/auth');
  beforeEach(() => {
    // Reset mock implementations before each test
    jest.clearAllMocks();
  });

  test('renders email and password fields', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  
    expect(screen.getByTestId("emailInput")).toBeInTheDocument();
    expect(screen.getByTestId("passwordInput")).toBeInTheDocument();
  });
  

  test('renders Login component', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByTestId("emailInput")).toBeInTheDocument();
    expect(screen.getByTestId("passwordInput")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

//   const mockLogin = jest.fn();
//   test('displays an error message on failed login', async () => {
    
//     // signInWithEmailAndPassword.mockImplementation(() => 
//     //     Promise.reject(new Error('Invalid credentials'))
//     //   );
//     mockLogin.mockRejectedValue(new Error('Invalid credentials'));
//     render(
//       <MemoryRouter>
//         <Login />
//       </MemoryRouter>
//     );

//     fireEvent.change(screen.getByTestId("emailInput"), { target: { value: 'test@example.com' } });
//     fireEvent.change(screen.getByTestId("passwordInput"), { target: { value: 'wrongpassword' } });
//     fireEvent.click(screen.getByRole('button', { name: /log in/i }));

//     const errorMessage = await screen.findByText("Failed to log in");
//     expect(errorMessage).toBeInTheDocument();
//   });

//   test('logs in successfully', async () => {
//     const { signInWithEmailAndPassword } = require('firebase/auth');

//     signInWithEmailAndPassword.mockResolvedValue({ user: { email: 'test@example.com' } });

//     render(
//       <MemoryRouter>
//         <AuthProvider>
//           <Login />
//         </AuthProvider>
//       </MemoryRouter>
//     );

//     fireEvent.change(screen.getByTestId("emailInput"), { target: { value: 'test@example.com' } });
//     fireEvent.change(screen.getByLabelText("Password"), { target: { value: 'correctpassword' } });
//     fireEvent.click(screen.getByRole('button', { name: /log in/i }));

//     // Check for navigation or success message here
//     // Example: expect(someCondition).toBeTruthy();
//   });

//   test('renders login heading', () => {
//     // Render the component with necessary providers
//     render(
//       <AuthProvider>
//         <BrowserRouter>
//           <Login />
//         </BrowserRouter>
//       </AuthProvider>
//     );
  
//     // Look for the heading by text
//     const headingElement = screen.getByText(/log in/i);
//     expect(headingElement).toBeInTheDocument();
//   });

//   test('allows password reset', async () => {
//     const { sendPasswordResetEmail } = require('firebase/auth');

//     sendPasswordResetEmail.mockResolvedValueOnce();

//     render(
//       <MemoryRouter>
//         <AuthProvider>
//           <Login />
//         </AuthProvider>
//       </MemoryRouter>
//     );

//     const emailInput = await screen.findByTestId('emailInput');
//     fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
//     fireEvent.click(screen.getByRole('button', { name: /forgot password/i })); // Assuming you have this button

//     const successMessage = await screen.findByText(/check your email/i);
//     expect(successMessage).toBeInTheDocument();
//   });
});
