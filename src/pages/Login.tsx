import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const isLogged = localStorage.getItem("isLogged");
  const [loginError, setLoginError] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (isLogged) {
      // navigate("/home");
    }
  });

  const enviarLogin = async () => {
    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      console.log("Login successful:", data);

      // Navigate to the home page
      localStorage.setItem("username",username)
      localStorage.setItem("isLogged","true")
      navigate("/home");

    } catch (error) {
      console.error("Error during login:", error);
      setLoginError(true);
    }
  };

  return (
    <div className="display-flex flex h-screen w-screen justify-center items-center bg-gray-200">
      <div className="flex flex-col justify-center items-center bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Login</h1>
        <hr className="w-full border-gray-300 mb-4" />
        <div className="w-full">
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {loginError && (
            <div className="text-red-500 text-sm mb-4">
              Login failed. Please check your credentials and try again.
            </div>
          )}
          <button
            onClick={() => enviarLogin()}
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200 hover:cursor-pointer"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
