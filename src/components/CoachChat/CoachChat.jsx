// import React, { useState, useEffect } from "react";
// import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
// import "./CoachChat.css";
// import chatImage from "../../assets/Images/Ellipse 5.png"; 
// import user1Image from "../../assets/Images/Ellipse 6.png"; 
// import { FaAngleRight } from "react-icons/fa";
// import AthHeader from "../../Pages/AthPage/AthHeader/AthHeader";
// import ChatSidebar from "../../components/CoachChat/ChatSidebar";

// function CoachChat() {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [athleteId, setAthleteId] = useState(1);  // Assume athlete ID is dynamically updated

//   // WebSocket connection
//   useEffect(() => {
//     const socket = new WebSocket("wss://onetoone-m2jw.onrender.com");

//     socket.onopen = () => console.log("WebSocket connected");
    
//     socket.onmessage = (event) => {
//       const messageData = JSON.parse(event.data);
//       setMessages((prevMessages) => [...prevMessages, messageData]);
//     };

//     socket.onclose = () => console.log("WebSocket disconnected");

//     return () => socket.close();
//   }, []);

//   // Fetch messages from API
//   useEffect(() => {
//     if (athleteId) {
//       fetch(`https://sports-backend-x6w5.onrender.com/chats/athlete/${athleteId}`)
//         .then((res) => res.json())
//         .then((data) => setMessages(data))
//         .catch((error) => console.error("Error fetching messages:", error));
//     }
//   }, [athleteId]);

//   // Send message to API & WebSocket
//   const handleSendMessage = () => {
//     if (newMessage.trim()) {
//       const newMsg = { sender: "ME", message: newMessage };

//       fetch("https://sports-backend-x6w5.onrender.com/chats", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newMsg),
//       })
//       .then(() => setMessages([...messages, newMsg]))
//       .catch((error) => console.error("Error sending message:", error));

//       setNewMessage("");
//     }
//   };

//   return (
//     <>
//       <AthHeader/>
//       <Container fluid className="p-4 chat-container">
        
//         <Row>
//           <ChatSidebar/>
//         </Row>

//         <Row className="g-4 c-wrapper">
//           {/* Chat Section */}
//           <Col lg={8} xs={12} className="chat-card-container">
//             <Card className="chat-card">
//               <Card.Body>
//                 <div className="chat-messages">
//                   {messages.map((msg, index) => (
//                     <div key={index} className={`d-flex ${msg.sender === "ME" ? "justify-content-end" : "justify-content-start"} mb-3`}>
//                       {msg.sender !== "ME" && (
//                         <img src={user1Image} alt={msg.sender} className="chat-sender-image" />
//                       )}
//                       <div className={`message-bubble ${msg.sender === "ME" ? "bg-primary text-white" : "bg-light"}`}>
//                         <strong>{msg.sender}</strong>
//                         <p className="mb-0">{msg.message}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <Form className="d-flex mt-3" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
//                   <Form.Control
//                     type="text"
//                     placeholder="Enter a message..."
//                     className="me-2"
//                     value={newMessage}
//                     onChange={(e) => setNewMessage(e.target.value)}
//                   />
//                   <Button variant="primary" onClick={handleSendMessage}>
//                     Submit
//                   </Button>
//                 </Form>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//       </Container>
//     </>
//   );
// }

// export default CoachChat;


import React, { useEffect, useState, useRef, useContext } from "react";
//import ChatContext from "../../components/ChatBox/Context/ChatContext";

const CoachChatBox = ({ coachUser }) => {
  const [socket, setSocket] = useState(null);
  const [athleteList, setAthleteList] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // const ws = new WebSocket("wss://onetoone-m2jw.onrender.com");
    const ws = new WebSocket("ws://localhost:8775");
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connected");
      // Send coach identity
      ws.send(
        JSON.stringify({
          id: coachUser.id,
          role: "coach",
          name: coachUser.name,
        })
      );

      // Ask for chat list
      ws.send(
        JSON.stringify({
          type: "get_chat_list",
          id: coachUser.id,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "chat_list") {
        setAthleteList(data.athletes || []);
      } else if (data.type === "chat") {
        const incoming = {
          from: data.from,
          message: data.message,
          timestamp: data.timestamp,
        };
        setChatMessages((prev) => [...prev, incoming]);
      } else if (data.type === "typing") {
        // You can show "typing..." indicator if needed
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => ws.close();
  }, [coachUser]);

  const sendMessage = () => {
    if (!message.trim() || !selectedAthlete) return;

    const msg = {
      type: "chat",
      message,
      sender: {
        id: coachUser.id,
        role: "coach",
        name: coachUser.name,
      },
      to: {
        id: selectedAthlete.id,
        role: "athlete",
        name: selectedAthlete.name,
      },
    };

    socket.send(JSON.stringify(msg));
    setChatMessages((prev) => [...prev, { from: coachUser, message }]);
    setMessage("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
 useEffect(scrollToBottom, [chatMessages]);

//   useEffect(() => {
//   // Ensure coachUser is defined before starting WebSocket
//   if (!coachUser || !coachUser.id) {
//     console.warn("coachUser not ready, skipping WebSocket setup");
//     return;
//   }

//   const ws = new WebSocket("wss://onetoone-m2jw.onrender.com");
//   setSocket(ws);

//   ws.onopen = () => {
//     console.log("WebSocket connected");

//     // Safe to use coachUser here because we already checked
//     ws.send(
//       JSON.stringify({
//         id: coachUser.id,
//         role: "coach",
//         name: coachUser.name,
//       })
//     );

//     ws.send(
//       JSON.stringify({
//         type: "get_chat_list",
//         id: coachUser.id,
//       })
//     );
//   };

//   ws.onmessage = (event) => {
//     const data = JSON.parse(event.data);

//     if (data.type === "chat_list") {
//       setAthleteList(data.athletes || []);
//     } else if (data.type === "chat") {
//       const incoming = {
//         from: data.from,
//         message: data.message,
//         timestamp: data.timestamp,
//       };
//       setChatMessages((prev) => [...prev, incoming]);
//     }
//   };

//   ws.onclose = () => {
//     console.log("WebSocket disconnected");
//   };

//   return () => {
//     ws.close();
//   };
// }, [coachUser]); // This effect only runs when coachUser changes

// const scrollToBottom = () => {
//   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
// };
//   useEffect(scrollToBottom, [chatMessages]);

//   const sendMessage = () => {
//   if (!message.trim() || !selectedAthlete) return;

//   const msg = {
//     type: "chat",
//     message,
//     sender: {
//       id: coachUser.id,
//       role: "coach",
//       name: coachUser.name,
//     },
//     to: {
//       id: selectedAthlete.id,
//       role: "athlete",
//       name: selectedAthlete.name,
//     },
//   };

//   socket.send(JSON.stringify(msg));
//   setChatMessages((prev) => [...prev, { from: coachUser, message }]);
//   setMessage("");
// };


  return (
    <div style={{ display: "flex", height: "90vh" }}>
      {/* Athlete List */}
      <div style={{ width: "25%", borderRight: "1px solid #ccc", padding: 10 }}>
        <h3>Your Athletes</h3>
        {athleteList.map((athlete) => (
          <div
            key={athlete.id}
            onClick={() => {
              setSelectedAthlete(athlete);
              setChatMessages([]); // Optional: clear previous messages
            }}
            style={{
              padding: "8px",
              margin: "5px 0",
              cursor: "pointer",
              backgroundColor:
                selectedAthlete?.id === athlete.id ? "#e0e0ff" : "#f9f9f9",
              borderRadius: 5,
            }}
          >
            {athlete.name}
          </div>
        ))}
      </div>

      {/* Chat Box */}
      <div style={{ flexGrow: 1, padding: 10, display: "flex", flexDirection: "column" }}>
        <div style={{ flexGrow: 1, overflowY: "auto", padding: 10, backgroundColor: "#f1f1f1" }}>
          {selectedAthlete ? (
            <>
              <h4>Chatting with {selectedAthlete.name}</h4>
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: msg.from.id === coachUser.id ? "right" : "left",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "10px",
                      borderRadius: 10,
                      backgroundColor: msg.from.id === coachUser.id ? "#cce5ff" : "#d9fdd3",
                    }}
                  >
                    <strong>{msg.from.id === coachUser.id ? "You" : msg.from.name}:</strong>{" "}
                    {msg.message}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <p>Select an athlete to start chatting.</p>
          )}
        </div>

        {/* Input */}
        <div style={{ display: "flex", marginTop: 10 }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            style={{ flexGrow: 1, padding: 10 }}
          />
          <button onClick={sendMessage} style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "#fff" }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachChatBox;
