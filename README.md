# Aftab's Chat App

Aftab's Chat App is a real-time chat application built with React and Firebase. This application allows users to register, log in, and chat with each other in real-time.

## Features

- User Authentication (Sign Up, Login)
- Real-time Messaging
- User Profile Management
- Responsive Design

## Technologies Used

- React
- Firebase Authentication
- Firestore (Firebase Database)
- React Router
- React Toastify (for notifications)
- CSS

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine
- Firebase account

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name

2. **Install the dependencies:**

   ```sh
   npm install

3.Set up Firebase:

Go to the Firebase Console.
Create a new project.
Add a web app to your Firebase project.
Copy the Firebase configuration and replace the placeholders in your firebase.js file.

4. **Run the app:**

   ```sh
   npm start




5.project structure ├── public
│   ├── index.html
│   └── ...
├── src
│   ├── components
│   │   ├── login
│   │   │   └── Login.jsx
│   │   ├── chatList
│   │   │   └── ChatList.jsx
│   │   └── ...
│   ├── lib
│   │   ├── firebase.js
│   │   ├── userStore.js
│   │   └── chatStore.js
│   ├── main.jsx
│   └── ...
├── .gitignore
├── package.json
└── README.md





Usage
Register a new user:

Go to the registration page and fill in the required details.
Upload a profile picture and click "Sign Up".
Log in:

Go to the login page and enter your email and password.
Click "Sign In" to log in.
Chat with other users:

After logging in, you will see a list of users.
Click on a user to start a chat.
Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

License
This project is licensed under the MIT License. See the LICENSE file for details.

Acknowledgements
React
Firebase
React Router
React Toastify