import AddUser from "./addUser/addUser";
import "./chatList.css";
import { useEffect, useState, useRef } from "react";
import { doc, onSnapshot, getDoc, collection, query, where, getDocs, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import useUserStore from "../../../lib/userStore";
import useChatStore from "../../../lib/chatStore";
import { toast } from 'react-toastify'; // Import toast for notifications

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { currentUser } = useUserStore();
  const { changeChatId } = useChatStore();
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (!currentUser?.id) return;

  

    const unSub = onSnapshot(doc(db, "userChats", currentUser.id), async (res) => {
      if (!res.exists()) return;

      const items = res.data().chats || [];
      const promises = items.map(async (item) => {
        const userDocRef = doc(db, "users", item.receiverId);
        const userDoc = await getDoc(userDocRef);
        const user = userDoc.exists() ? userDoc.data() : null;
        return { ...item, user };
      });

      try {
        const chatData = await Promise.all(promises);
        setChats(chatData
          .filter(chat => chat.user?.id !== currentUser.id) // Filter out current user's profile
          .sort((a, b) => b.updatedAt - a.updatedAt));
      } catch (error) {
        console.error("Error fetching chat data:", error);
      }
    });

    return () => {
      unSub();
    };
  }, [currentUser?.id]); // Only re-run the effect if currentUser.id changes

  const handleChatAdded = (newChat) => {

    const isUserAlreadyInChatList = chats.some(chat => chat.user?.id === newChat.user?.id);
    if (isUserAlreadyInChatList) {
      toast.error("User is already in the chat list"); // Show toast notification
      return;
    }
    setChats((prevChats) => [newChat, ...prevChats]);
    setAddMode(false); // Close the add user mode after adding a chat
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === '') {
        setSearchResults([]);
        return;
      }

      const q = query(collection(db, "users"), where("username", ">=", searchTerm), where("username", "<=", searchTerm + "\uf8ff"));
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => doc.data());
      setSearchResults(results);
    };

    fetchSearchResults();
  }, [searchTerm]);

  const handleUserSelect = async (selectedUser) => {
    const chatId = [currentUser.id, selectedUser.id].sort().join("_");

    const chatDocRef = doc(db, "chats", chatId);
    const chatDoc = await getDoc(chatDocRef);

    if (!chatDoc.exists()) {
      await setDoc(chatDocRef, {
        messages: [],
        users: [currentUser.id, selectedUser.id],
      });

      const userChatsRef = doc(db, "userChats", currentUser.id);
      const userChatsSnapshot = await getDoc(userChatsRef);

      if (userChatsSnapshot.exists()) {
        await updateDoc(userChatsRef, {
          chats: arrayUnion({
            chatId,
            receiverId: selectedUser.id,
            lastMessage: "",
            isSeen: true,
            updatedAt: Date.now(),
          }),
        });
      } else {
        await setDoc(userChatsRef, {
          chats: [{
            chatId,
            receiverId: selectedUser.id,
            lastMessage: "",
            isSeen: true,
            updatedAt: Date.now(),
          }],
        });
      }

      const receiverChatsRef = doc(db, "userChats", selectedUser.id);
      const receiverChatsSnapshot = await getDoc(receiverChatsRef);

      if (receiverChatsSnapshot.exists()) {
        await updateDoc(receiverChatsRef, {
          chats: arrayUnion({
            chatId,
            receiverId: currentUser.id,
            lastMessage: "",
            isSeen: false,
            updatedAt: Date.now(),
          }),
        });
      } else {
        await setDoc(receiverChatsRef, {
          chats: [{
            chatId,
            receiverId: currentUser.id,
            lastMessage: "",
            isSeen: false,
            updatedAt: Date.now(),
          }],
        });
      }
    }

    changeChatId(chatId, selectedUser); // Ensure the chat is opened
  };

  const filteredChats = searchTerm ? searchResults : chats;

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar" onClick={() => searchInputRef.current.focus()}>
          <img src="./search.png" alt="Search" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            ref={searchInputRef}
          />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          className="add"
          alt="Add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {filteredChats.map((chat) => (
        <div
          className="item"
          key={chat.chatId || chat.id}
          onClick={() => handleUserSelect(chat.user || chat)}
          style={{ backgroundColor: chat?.isSeen === false ? "#ff0000" : "transparent" }} // Conditional background color
        >
          <img src={chat.user?.avatar || chat.avatar || "./avatar.png"} alt="Avatar" />
          <div className="texts">
            <span>{chat.user?.username || chat.username || "Unknown User"}</span>
            <p>{chat.lastMessage || ""}</p>
          </div>
        </div>
      ))}
      {addMode && <AddUser onChatAdded={handleChatAdded} />} {/* Ensure AddUser is called correctly */}
    </div>
  );
};

export default ChatList;