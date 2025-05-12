interface MessageProps {
  author: string;
  timestamp: string;
  text: string;
}
const Message: React.FC<MessageProps> = ({ author, timestamp, text }) => {
  const isYou = localStorage.getItem("username") === author;

  return (
    <>
      {isYou ? (
        <div className="flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end">
          <div>
            <div className="bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg">
              <p className="text-sm">{text}</p>
            </div>
            <span className="text-xs text-gray-500 leading-none">
              {timestamp}
            </span>
          </div>
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex flex-col justify-center text-center">
            <p className="font-medium">{author.slice(0, 2).toUpperCase()}</p>
          </div>
        </div>
      ) : (
        <div className="flex w-full mt-2 space-x-3 max-w-xs">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300">
            <img
              src={`https://avatar.iran.liara.run/public/60`}
              alt={`${author}'s profile`}
              className="h-10 w-10 rounded-full"
            />
          </div>
          <div>
            <div className="bg-gray-300 p-3 rounded-r-lg rounded-bl-lg">
              <p className="text-sm">{text}</p>
            </div>
            <span className="text-xs text-gray-500 leading-none">
              {timestamp}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default Message;
