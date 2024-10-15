import { toast } from "react-toastify";
import "./login.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { setDoc, doc, getDoc } from "firebase/firestore"; // Ensure getDoc is imported
import upload from "../../lib/upload";
import useUserStore from "../../lib/userStore"; // Import user store

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser); // Get setCurrentUser function from user store

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!avatar.file) {
      toast.error("Please upload a profile picture.");
      return;
    }
    setLoading(true);
    const formdata = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formdata);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const imgUrl = await upload(avatar.file);

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        id: res.user.uid,
        avatar: imgUrl,
        blocked: [],
      });

      await setDoc(doc(db, "userChats", res.user.uid), {
        chats: [],
      });

      toast.success("User created successfully! Logging in...");

      // Automatically log the user in after registration
      await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser({ id: res.user.uid, username, email, avatar: imgUrl }); // Update user store
      navigate("/chat"); // Redirect to the chat page after successful login

    } catch (err) {
      console.error("Error during registration:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formdata = new FormData(e.target);
    const { email, password } = Object.fromEntries(formdata);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", res.user.uid)); // Use getDoc to fetch user data
      const userData = userDoc.data();
      setCurrentUser({ id: res.user.uid, ...userData }); // Update user store
      navigate("/chat"); // Redirect to the chat page after successful login
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Welcome back,</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
        </form>
      </div>
      <div className="seperator"></div>
      <div className="item">
        <h2>Create an account</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img src={avatar.url || "./avatar.png"} alt="Avatar" />
            Upload Profile Picture
          </label>
          <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
          <input type="text" placeholder="Username" name="username" />
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
        </form>
      </div>
    </div>
  );
};

export default Login;