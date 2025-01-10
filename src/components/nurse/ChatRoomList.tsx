import React from "react";

interface ChatRoomListProps {
  rooms: string[];
  currentRoom: string;
  onRoomSelect: (room: string) => void;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({ rooms, currentRoom, onRoomSelect }) => {
  return (
    <div className="w-full flex flex-col">
      <ul className="w-full">
        {rooms.map((room, index) => (
          <li
            key={index}
            className={`cursor-pointer px-4 py-2 ${
              currentRoom === room ? "bg-blue-500 text-white" : "bg-transparent text-black"
            }`}
            onClick={() => onRoomSelect(room)}
          >
            {room}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatRoomList;