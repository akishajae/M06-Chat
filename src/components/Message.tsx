interface MessageProps {
  author: string;
  timestamp: string;
  text: string;
}
const Message: React.FC<MessageProps> = ({ author, timestamp, text }) => {
  const isYou = localStorage.getItem("username") === author;

  let messageContent;

  if (isYou) {
    messageContent = (
      <div className="flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end">
        <div>
          <div className="bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg">
            <p className="text-sm">{text}</p>
          </div>
          <span className="text-xs text-gray-400 leading-none">
            {timestamp}
          </span>
        </div>
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex flex-col justify-center text-center">


          <p className="font-medium">{author.slice(0, 2).toUpperCase()}</p>
        </div>
      </div>
    );
  } else if (author === "system") {
    messageContent = (
      <div className="flex w-full mt-2 space-x-3 max-w-xs mx-auto justify-center">
        <div>
          <div className="bg-gray-600  text-gray-300 pl-2 pr-2 rounded-lg">
            <p className="text-sm">{text}</p>
          </div>
        </div>
      </div>
    );
  } else {
    messageContent = (
      <div className="flex w-full mt-2 space-x-3 max-w-xs">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex flex-col justify-center text-center">
          <p className="font-medium">{author.slice(0, 2).toUpperCase()}</p>
        </div>
        <div>
          <div className="bg-gray-300 p-2 pl-3 rounded-r-lg rounded-bl-lg">
          <p className="text-xs font-bold text-gray-400">~{author}</p>
            <p className="text-sm">{text}</p>
          </div>
          <span className="text-xs text-gray-400 leading-none">
            {timestamp}
          </span>
        </div>
      </div>
    );
  }

  return <>{messageContent}</>;
};

export default Message;
