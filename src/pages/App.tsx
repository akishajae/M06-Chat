import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Message from "../components/message";

interface MessageData {
  author: string;
  text: string;
  timestamp: string;
}

function App() {
  const navigate = useNavigate();
  const chatRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [documentContent, setDocumentContent] = useState("");

  // Check authentication
  useEffect(() => {
    const isLogged = localStorage.getItem("isLogged");
    if (!isLogged) {
      navigate("/");
    }
  }, [navigate]);

  // WebSocket and initial data fetch
  useEffect(() => {
    // Fetch initial chat and document data
    fetch("http://localhost:4000/api/chat")
      .then((res) => res.text())
      .then((chatText) => {
        const parsedMessages = chatText
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => {
            const match = line.match(/\[(.+?)\] (.+?): (.+)/);
            if (match) {
              return {
                timestamp: match[1],
                author: match[2],
                text: match[3],
              };
            }
            return null;
          })
          .filter((msg) => msg !== null) as MessageData[];
        console.log("Fetched initial chat:", parsedMessages);
        setMessages(parsedMessages);
      })
      .catch((error) => console.error("Error fetching chat:", error));

    fetch("http://localhost:4000/api/document")
      .then((res) => res.text())
      .then((data) => {
        console.log("Fetched initial document:", data);
        setDocumentContent(data);
      })
      .catch((error) => console.error("Error fetching document:", error));

    ws.current = new WebSocket("ws://localhost:4000");

    ws.current.onopen = () => {
      console.log("WebSocket conectado");
    };

    ws.current.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);
        console.log("Received WebSocket message:", messageData);

        if (messageData.type === "broadcast" && messageData.author && messageData.text && messageData.timestamp) {
          const newMessage: MessageData = {
            author: messageData.author,
            text: messageData.text,
            timestamp: messageData.timestamp,
          };
          setMessages((prev) => [...prev, newMessage]);
        } else if (messageData.type === "system") {
          console.log("System message:", messageData.message);
        } else if (messageData.type === "error") {
          console.error("Server error:", messageData.message);
        } else if (messageData.type === "document") {
          setDocumentContent(messageData.content);
        } else if (messageData.type === "chatHistory") {
          setMessages(messageData.history);
        } else {
          console.warn("Unknown or invalid message type:", messageData);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket desconectado");
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  // Auto-scroll to bottom for chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (ws.current?.readyState === WebSocket.OPEN && inputMessage.trim()) {
      const messageData = {
        type: "message",
        author: localStorage.getItem("username"),
        text: inputMessage,
        timestamp: new Date().toISOString(),
      };
      
      console.log("Sending message:", messageData);
      ws.current.send(JSON.stringify(messageData));
      setInputMessage("");
    } else {
      console.error("WebSocket no está conectado o mensaje vacío");
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setDocumentContent(newContent);
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "document",
          content: newContent,
        })
      );
    }
  };


  /**
   * 
   * @param e element
   * On enter, calls sendMessage function due to send a message using websocket
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  /**
   * Handles the logout, removes localstorage
   */
  const handleLogout = () => {
    localStorage.removeItem("isLogged");
    localStorage.removeItem("username");
    navigate("/");
  };

  const handleDownloadChat = () => {
    fetch("http://localhost:4000/api/chat")
      .then((res) => res.text())
      .then((chatText) => {
        const blob = new Blob([chatText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "chat.txt";
        link.click();
        URL.revokeObjectURL(url);
      })
      .catch((error) => console.error("Error downloading chat:", error));
  };

  const handleDownloadDocument = () => {
    fetch("http://localhost:4000/api/document")
      .then((res) => res.text())
      .then((docText) => {
        const blob = new Blob([docText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "document.txt";
        link.click();
        URL.revokeObjectURL(url);
      })
      .catch((error) => console.error("Error downloading document:", error));
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Chat Section (Untouched) */}
      <div className="w-[30%] h-full bg-gray-200 flex flex-col justify-center items-center">
        <div className="w-[100%] h-[100%] bg-gray-200 grid-rows-2">
          <div className="h-[90%] flex flex-col">
            <div className="flex flex-col flex-grow w-full max-w-xl bg-white overflow-hidden">
              <div
                id="chat"
                ref={chatRef}
                className="flex flex-col flex-grow h-0 p-4 overflow-auto"
              >
                {messages.map((msg, index) => (
                  <Message
                    key={index}
                    author={msg.author}
                    text={msg.text}
                    timestamp={msg.timestamp}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="h-[10%] w-full border-t border-gray-400 flex items-center px-4 mr-3">
            <input
              id="textMessage"
              className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <div className="w-[10%] rounded-full bg-blue">
              <svg
                onClick={sendMessage}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-send-2"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4.698 4.034l16.302 7.966l-16.302 7.966a.503 .503 0 0 1 -.546 -.124a.555 .555 0 0 1 -.12 -.568l2.468 -7.274l-2.468 -7.274a.555 .555 0 0 1 .12 -.568a.503 .503 0 0 1 .546 -.124z" />
                <path d="M6.5 12h14.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Collaborative Document Section with Sidebar */}
      <div className="w-[70%] h-full bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md flex flex-col items-center py-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Opciones</h2>
          <button
            className="w-48 mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={handleDownloadDocument}
          >
            Descargar Documento
          </button>
          <button
            className="w-48 mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={handleDownloadChat}
          >
            Descargar Chat
          </button>
          <button
            className="w-48 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* Document Area */}
        <div className="flex-1 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Collaborative Document</h2>
          <textarea
            className="w-full h-[80vh] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            value={documentContent}
            onChange={handleDocumentChange}
            placeholder="Start collaborating here..."
          />
        </div>
      </div>
    </div>
  );
}

export default App;