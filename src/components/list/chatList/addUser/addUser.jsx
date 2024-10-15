import React, { useState } from "react";
import { collection, query, where, getDocs, doc, setDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import "./addUser.css";
import { db } from "../../../../lib/firebase";
import useUserStore from "../../../../lib/userStore"; // Assuming you have a user store to get the current user

const AddUser = ({ onChatAdded }) => {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore(); // Get the current user from your user store

  const handleSearch = async (e) => {
    e.preventDefault();
    const formdata = new FormData(e.target);
    const username = formdata.get("username");

    try {
      const UserRef = collection(db, "users");
      const q = query(UserRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data());
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAdd = async () => {
    if (!user) return;

    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userChats");

    try {
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
        participants: [currentUser.id, user.id]
      });
     
      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          receiverId: currentUser.id,
          lastMessage: ""
        })
      });
      await updateDoc(doc(userChatsRef, user.id), {
        updatedAt: serverTimestamp()
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          receiverId: user.id,
          lastMessage: ""
        })
      });
      await updateDoc(doc(userChatsRef, currentUser.id), {
        updatedAt: serverTimestamp()
      });


      // Call the callback function to update the chat list in ChatList
      onChatAdded({
        chatId: newChatRef.id,
        user,
        lastMessage: "",
        isSeen: true,
        updatedAt: new Date() // Use the current date for sorting
      });
    } catch (err) {
      console.error("Error adding chat:", err);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button type="submit">Search</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="Avatar" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;