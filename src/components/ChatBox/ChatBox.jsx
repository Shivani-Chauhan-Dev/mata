// import "./ChatBox.css";
// import { useState } from "react";
// import axios from "axios"; // for API call add axios 

// const ChatBox = () => {
//     const [input, setInput] = useState("");
//     const [messages, setMessages] = useState([]);

//     // Function to send messages and fetch response from API
//     const handleSendMessage = async () => {
//         if (input.trim()) {
//             const newMessage = { sender: "You", message: input };
//             setMessages([...messages, newMessage]); // Store user's message

//             setTimeout(async () => {
//                 const botReply = await generateBotResponse(input);
//                 setMessages((prevMessages) => [...prevMessages, { sender: "Bot", message: botReply }]);
//             }, 1000);

//             setInput("");
//         }
//     };

//     // for API Bot reply to  faction
//     const generateBotResponse = async (userMessage) => {
//         try {
//             const response = await axios.post("wss://onetoone-m2jw.onrender.com", { message: userMessage });
//             return response.data.reply; // API reply find
//         } catch (error) {
//             console.error("API Error:", error);
//             return "Sorry, I couldn't process that.";
//         }
//     };

//     return (
//         <div className="chat-container">
//             <h2>Chat Interface</h2>
//             <div className="chat-messages">
//                 {messages.length === 0 ? <p>No messages yet...</p> : null}
//                 {messages.map((msg, index) => (
//                     <div key={index} className={msg.sender === "You" ? "msg msg-user" : "msg msg-bot"}>
//                         <strong>{msg.sender}:</strong> {msg.message}
//                     </div>
//                 ))}
//             </div>
//             <div className="chat-input-container">
//                 <input
//                     type="text"
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     placeholder="Type a message..."
//                     autoComplete="off"
//                 />
//                 <button className="btn-send" onClick={handleSendMessage}>
//                     Send
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default ChatBox;


import { useState, useEffect } from "react";
import "../ChatBox/ChatBox.css";
import useChatContext from "./hooks/useChatContext";

const ChatBox = () => {
  const { typing, messages, handleSendMassage, socketRef, recipient, user } = useChatContext();
  const [input, setInput] = useState("");

  const handleTyping = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && user && recipient) {
      socketRef.current.send(
        JSON.stringify({ type: "typing", sender: user, to: recipient })
      );
    }
  };

  return (
    <div style={{ width: "80vw", height: "100vh", padding: "20px", background: "#f5f5f5", margin: "auto" }}>
      <h2>Chat Interface</h2>
      <div style={{ height: "80vh", overflowY: "auto", padding: "20px", border: "1px solid #ccc", background: "#fff", borderRadius: "8px" }}>
        {messages.map((msg, index) => (
          <div className="msg" key={index}>
            <strong>{msg.sender?.id === user?.id ? "You" : msg.sender?.name}:</strong> {msg.message} <br />
          </div>
        ))}
      </div>
      <div>{typing}</div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onInput={handleTyping}
        placeholder="Type a message..."
        autoComplete="off"
      />
      <button
        className="btn-send"
        onClick={() => {
          if (input.trim()) {
            handleSendMassage(input);
            setInput("");
          }
        }}
      >
        Send
      </button>
    </div>
  );
};

export default ChatBox;
