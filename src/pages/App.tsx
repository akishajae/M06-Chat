

function App() {
  return (
    <div className="display-flex flex h-screen w-screen">
      <div className="w-[30%] h-full bg-gray-200 flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold">My App</h1>
        <div className="flex flex-col items-center mt-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Button 1
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
            Button 2
          </button>
        </div>
      </div>
      <div className="w-[70%] h-full bg-gray-100 flex justify-center items-center">
        <h1>DOC</h1>
      </div>
    </div>
  );
}

export default App;
