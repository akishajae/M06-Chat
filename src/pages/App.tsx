import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Message from "../components/message";
function App() {
  const navigate = useNavigate();
  useEffect(() => {
    const isLogged = localStorage.getItem("isLogged");

    if (!isLogged) {
      navigate("/");
    }
  });
  /* Creacio del websocket */
  let ws: WebSocket;

  useEffect(() => {
    ws = new WebSocket("ws://localhost:4000");

    ws.onopen = () => {
      console.log("WebSocket conectado");
    };
    ws.onclose = () => {
      console.log("WebSocket desconectado");
    };
    ws.onerror = (error) => {
      console.error("Error en WebSocket:", error);
    };
    ws.onmessage = (event) => {
      console.log("Mensaje recibido:", event.data);
    };

    return () => {
      ws.close();
    };
  });

  function sendMessage() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const text = (document.getElementById("textMessage") as HTMLInputElement)?.value;
      console.log(text);

      if (text) {
        ws.send(text);
      } else {
        console.error("No message to send or invalid input");
      }
    } else {
      console.error("WebSocket no está conectado");
    }
  }

  return (
    <div className="display-flex flex h-screen w-screen">
      <div className="w-[30%] h-full bg-gray-200 flex flex-col justify-center items-center">
        <div className="w-[100%] h-[100%] bg-gray-200 grid-rows-2">
          <div className="h-[90%] flex flex-col">
            <div className="flex flex-col flex-grow w-full max-w-xl bg-white overflow-hidden">
              <div className="flex flex-col flex-grow h-0 p-4 overflow-auto">
                <Message
                  author="test"
                  text="Muy buenas a rodos guapisimos"
                  timestamp="hoy"
                ></Message>
                <Message
                  author="arnau"
                  text="Hola guapo"
                  timestamp="hoy"
                ></Message>
              </div>
            </div>
          </div>
          <div className="h-[10%] w-full border-t border-gray-400 flex items-center px-4 mr-3">
            <input
              id="textMessage"
              className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="text"
              placeholder="Type your message..."
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
                stroke-width="2"
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
      <div className="w-[70%] h-full grid-cols-2 bg-gray-100 flex justify-center items-center"></div>
    </div>
  );
}
export default App;
