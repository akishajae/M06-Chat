import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Message from "../components/Message";
interface MessageData {
  author: string;
  text: string;
  timestamp: string;
}

// interface DocumentData {
//   author: string;
//   content: string;
//   timestamp: string;
// }

type DocumentSnapshot = {
  timestamp: string; // ISO string
  author: string;
  content: string;
};

function App() {
  const navigate = useNavigate();
  const chatRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const [documentContent, setDocumentContent] = useState("");
  const [snapshots, setSnapshots] = useState<DocumentSnapshot[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastContentRef = useRef("");

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
        setMessages(parsedMessages);
      })
      .catch((error) => console.error("Error fetching chat:", error));

    fetch("http://localhost:4000/api/document")
      .then((res) => res.text())
      .then((data) => {
        setDocumentContent(data);
      })
      .catch((error) => console.error("Error fetching document:", error));

    ws.current = new WebSocket("ws://localhost:4000");

    ws.current.onopen = () => {
      const messageData = {
        type: "systemNotification",
        author: localStorage.getItem("username"),
        text: localStorage.getItem("username") + " has entered the chat.",
        timestamp: new Date().toISOString(),
      };
      ws.current?.send(JSON.stringify(messageData));
    };

    ws.current.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);
        console.log("Received WebSocket message:", messageData);

        const documentMessage = JSON.parse(event.data);
        if (documentMessage.type === "edit") {
          setDocumentContent(documentMessage.content);
          recordSnapshot(documentMessage.author, documentMessage.content);
        }

        if (
          messageData.type === "broadcast" &&
          messageData.author &&
          messageData.text &&
          messageData.timestamp
        ) {
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
      console.log("disconected");
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  // 3. Send edit to server
  const sendEdit = (content: string) => {
    const message = {
      type: "edit",
      author: localStorage.getItem("username"),
      timestamp: new Date().toISOString(),
      content,
    };
    ws.current?.send(JSON.stringify(message));
  };

  // 4. Record a snapshot
  const recordSnapshot = (author: string, content: string) => {
    setSnapshots((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        author,
        content,
      },
    ]);
  };

  // 5. Generate .txt from history
  const generateSnapshotTxt = (history: DocumentSnapshot[]): string => {
    return history
      .map((s) => {
        const date = new Date(s.timestamp).toLocaleString();
        return `[${date} - ${s.author}]\n${s.content}\n`;
      })
      .join("\n");
  };

  // 6. Download .txt
  const downloadHistoryTxt = () => {
    const historyTxt = generateSnapshotTxt(snapshots);
    const blob = new Blob([historyTxt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document-history.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

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

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const currentUser = localStorage.getItem("username") || "Unknown";
      if (newContent !== lastContentRef.current) {
        lastContentRef.current = newContent;
        sendEdit(newContent);
        recordSnapshot(currentUser, newContent);
      }
    }, 500);
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
    const messageData = {
      type: "systemNotification",
      author: localStorage.getItem("username"),
      text: localStorage.getItem("username") + " has left the chat.",
      timestamp: new Date().toISOString(),
    };
    ws.current?.send(JSON.stringify(messageData));
    localStorage.removeItem("isLogged");
    localStorage.removeItem("username");
    ws.current?.close();
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

  // HISTORICAL

  // Function to download document history
  // const handleDownloadDocumentHistory = () => {
  //   const historyText = documentHistory.join("\n");
  //   const blob = new Blob([historyText], { type: "text/plain" });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = "documentHistory.txt";
  //   link.click();
  //   URL.revokeObjectURL(url);
  // };

  return (
    <div className="w-[100%] h-full flex">
      <div className="w-[70px] h-[100vh] border-r-1 bg-gray-200 border-gray-300 flex flex-col items-center gap-2">
        <div className="flex flex-col justify-start mt-4">
          <div className="h-[50px] w-[50px] mb-3 rounded-full bg-gray-600 flex flex-col justify-center items-center text-center">
            <p className="font-medium">
              {localStorage.getItem("username")?.slice(0, 2).toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center h-full">
          {/* button export chat */}
          <div
            data-tooltip-target="tooltip-chat"
            data-tooltip-placement="right"
            onClick={handleDownloadChat}
            className="h-[50px] w-[50px] mb-3 rounded-full transition-colors bg-gray-300 flex items-center justify-center hover:cursor-pointer hover:bg-gray-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-message-forward"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z" />
              <path d="M13 8l3 3l-3 3" />
              <path d="M16 11h-8" />
            </svg>
          </div>
          {/* tooltip chat */}
          <div
            id="tooltip-chat"
            role="tooltip"
            className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
          >
            Export chat
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
          {/* export document */}
          <div
            data-tooltip-target="tooltip-doc"
            data-tooltip-placement="right"
            onClick={handleDownloadDocument}
            className="h-[50px] w-[50px] mb-3 rounded-full transition-colors bg-gray-300 flex items-center justify-center hover:cursor-pointer hover:bg-blue-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-file-type-doc"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
              <path d="M5 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1z" />
              <path d="M20 16.5a1.5 1.5 0 0 0 -3 0v3a1.5 1.5 0 0 0 3 0" />
              <path d="M12.5 15a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1 -3 0v-3a1.5 1.5 0 0 1 1.5 -1.5z" />
            </svg>
          </div>
          {/* export document tooltip */}
          <div
            id="tooltip-doc"
            role="tooltip"
            className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
          >
            Export document
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
          {/* export document history */}
          <div
            data-tooltip-target="tooltip-history"
            data-tooltip-placement="right"
            onClick={downloadHistoryTxt}
            className="h-[50px] w-[50px] mb-3 rounded-full transition-colors bg-gray-300 flex items-center justify-center hover:cursor-pointer hover:bg-blue-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-history"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 8l0 4l2 2" />
              <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
            </svg>{" "}
          </div>
          {/* export document history tooltip */}
          <div
            id="tooltip-history"
            role="tooltip"
            className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
          >
            Export document history
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
        </div>
        <div className="flex flex-col justify-end mt-auto">
          <div
            onClick={handleLogout}
            className="h-[50px] w-[50px] mb-3 rounded-full transition-colors bg-gray-300 items-center flex flex-col justify-center hover:cursor-pointer hover:bg-red-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-logout"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
              <path d="M9 12h12l-3 -3" />
              <path d="M18 15l3 -3" />
            </svg>
          </div>

        </div>

      </div>
      {/* Chat section*/}
      <div className="w-[30%] h-[100vh] border-r-1 bg-gray-50 border-gray-300 grid-cols-2">
        <div className="h-[93%] flex flex-col">
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
                  timestamp={new Date(msg.timestamp).toLocaleString()}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="border-t-1 border-gray-300 flex h-[7%] flex-col justify-center">
          <div className="flex justify-evenly">
            <input
              id="textMessage"
              className="w-[80%] h-[50px] align-middle border-1 transition-colors duration-300 border-gray-300 rounded-2xl indent-3.5 focus:outline-1 focus:outline-gray-400"
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <div className="rounded-full w-[50px] h-[50px] flex flex-col transition-colors bg-gray-300 justify-center items-center hover:cursor-pointer hover:bg-gray-400">
              <svg
                onClick={sendMessage}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
                stroke-linecap="round"
                stroke-linejoin="round"
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
      <div className="w-[70%] flex flex-col justify-center items-center">
        <textarea
          className="h-[90vh] w-[60%] border-1 border-gray-100 p-5 resize-none shadow-md focus:select-none focus:outline-none"
          value={documentContent}
          onChange={handleDocumentChange}
          placeholder="Silence is gold..."
        />
      </div>
    </div>
  );
}

export default App;
