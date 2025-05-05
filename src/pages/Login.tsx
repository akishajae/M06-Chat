import { useEffect, useState } from "react";

const Login = () => {
  const [login, setLogin] = useState(false);
  useEffect(() => {
    if (login) {
      window.location.href = "/Home";
    }
  }, [login]);
  return (
    <div className="display-flex flex h-screen w-screen justify-center items-center bg-gray-200">
      <form action="" method="post">
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
                required
              />
            </div>
            <button
              onClick={() => setLogin(true)}
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200 hover:cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
