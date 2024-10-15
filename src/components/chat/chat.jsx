import './chat.css'; 
import { useEffect, useRef, useState } from 'react'; 
import EmojiPicker from 'emoji-picker-react';
import { updateDoc, doc, arrayUnion, onSnapshot } from 'firebase/firestore'; 
import { db } from '../../lib/firebase'; 
import useChatStore from '../../lib/chatStore'; 
import { useUserStore } from '../../lib/userStore'; 

const Chat = () => {
  const [open, setOpen] = useState(false); 
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]); 
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, setChatId, setUser } = useChatStore(); 
  const { currentUser } = useUserStore(); 
  const endRef = useRef(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [showCameraPopup, setShowCameraPopup] = useState(false);
  const [showVoicePopup, setShowVoicePopup] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    if (!chatId || !currentUser) return;

    const chatRef = doc(db, "chats", chatId);
    const unsubscribe = onSnapshot(chatRef, (doc) => {
      if (doc.exists()) {
        setMessages(doc.data().messages || []);
      }
      setLoading(false); // Set loading to false after data is fetched
    });

    return () => unsubscribe();
  }, [chatId, currentUser]);

  useEffect(() => {
    if (!loading) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
  };

  const handleSend = async () => {
    if (text === "") return;
    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
        }),
      });

      setText('');
    } catch (error) {
      console.log(error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          await updateDoc(doc(db, "chats", chatId), {
            messages: arrayUnion({
              senderId: currentUser.id,
              file: reader.result,
              fileName: file.name,
              createdAt: new Date(),
            }),
          });
        } catch (error) {
          console.log(error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    document.getElementById("imageInput").click();
  };

  const handleMicClick = async () => {
    setShowVoicePopup(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        setAudioChunks((prev) => [...prev, e.data]);
      };
      recorder.onstop = () => {
        clearInterval(recordingIntervalRef.current);
      };
      recorder.start();
      setMediaRecorder(recorder);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
  };

  const handleSendRecording = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await updateDoc(doc(db, "chats", chatId), {
          messages: arrayUnion({
            senderId: currentUser.id,
            audio: reader.result,
            createdAt: new Date(),
          }),
        });
        setAudioChunks([]);
        setShowVoicePopup(false);
      } catch (error) {
        console.log(error);
      }
    };
    reader.readAsDataURL(audioBlob);
  };

  const handleCancelRecording = () => {
    setAudioChunks([]);
    setShowVoicePopup(false);
  };

  const handleCameraClick = async () => {
    setShowCameraPopup(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    videoRef.current.play();
  };

  const handleCapturePhoto = () => {
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    const imageData = canvasRef.current.toDataURL('image/png');
    videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    setShowCameraPopup(false);
    updateDoc(doc(db, "chats", chatId), {
      messages: arrayUnion({
        senderId: currentUser.id,
        image: imageData,
        createdAt: new Date(),
      }),
    });
  };

  const handleAttachClick = () => {
    document.getElementById("attachInput").click();
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }

  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="avatar" />
          <div className="texts">
            <span>{user?.username || "Unknown User"}</span>
            <p>{isCurrentUserBlocked ? "You are blocked" : isReceiverBlocked ? "User is blocked" : "No messages yet"}</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="phone" />
          <img src="./video.png" alt="video" />
          <img src="./info.png" alt="menu" />
        </div>
      </div>
      <div className="center">
        {messages.map((message, index) => (
          <div className={`message ${message.senderId === currentUser.id ? 'own' : ''}`} key={index}>
            <img src={message.senderId === currentUser.id ? currentUser.avatar : user?.avatar || "./avatar.png"} alt="avatar" />
            <div className="texts">
              {message.file ? (
                <a href={message.file} download={message.fileName}>
                  <img src={message.file} alt={message.fileName} style={{ maxWidth: '200px', maxHeight: '200px' }} />
                </a>
              ) : message.audio ? (
                <audio controls src={message.audio}></audio>
              ) : message.image ? (
                <img src={message.image} alt="Captured" style={{ maxWidth: '200px', maxHeight: '200px' }} />
              ) : (
                <p>{message.text}</p>
              )}
              <span>{message.createdAt.toDate().toLocaleString()}</span>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <img src="./img.png" alt="img" onClick={handleImageClick} />
          <input
            type="file"
            id="imageInput"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <img src="./mic.png" alt="mic" onClick={handleMicClick} />
          <img src="./camera.png" alt="camera" onClick={handleCameraClick} />
          <input
            type="file"
            id="cameraInput"
            accept="image/*"
            capture="camera"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <i className="material-icons" onClick={handleAttachClick} style={{ cursor: 'pointer' }}>attachment</i>
          <input
            type="file"
            id="attachInput"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
        <input
          type="text"
          placeholder="Type a message.."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <div className="emoji">
          <img src='./emoji.png' alt="emoji" onClick={() => setOpen((prev) => !prev)} />
          {open && (
            <div className="picker">
              <EmojiPicker onEmojiClick={handleEmoji} />
            </div>
          )}
        </div>
        <button className='sendButton' onClick={handleSend}>Send</button>
      </div>

      {showCameraPopup && (
        <div className="camera-popup">
          <video ref={videoRef} style={{ width: '100%' }}></video>
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          <button onClick={handleCapturePhoto}>Capture Photo</button>
          <button onClick={() => setShowCameraPopup(false)}>Close</button>
        </div>
      )}

      {showVoicePopup && (
        <div className="voice-popup">
          <p>Recording... {recordingTime}s</p>
          <button onClick={handleStopRecording}>Stop</button>
          <button onClick={handleSendRecording}>Send</button>
          <button onClick={handleCancelRecording}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default Chat;