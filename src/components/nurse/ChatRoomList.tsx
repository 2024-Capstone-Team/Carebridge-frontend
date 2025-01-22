import React, { useState, useEffect } from "react";
import * as Separator from "@radix-ui/react-separator";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import useStompClient from "../../hooks/useStompClient";

// Helper function to format time
const formatTime = (timestamp: number) => {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffInMs = now.getTime() - messageTime.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000); // minutes
  const diffInHours = Math.floor(diffInMs / 3600000); // hours
  const diffInDays = Math.floor(diffInMs / 86400000); // days

  if (diffInMinutes < 60) {
    return `${diffInMinutes} 분 전`;
  } else if (diffInHours < 24) {
    return `${diffInHours} 시간 전`;
  } else {
    return `${diffInDays} 일 전`;
  }
};

interface ChatRoomListProps {
  rooms: {
    userName: string;
    conversationId: string;
    previewMessage: string;
    lastMessageTime: number;
    unread: boolean;
  }[];
  currentRoom: string;
  onRoomSelect: (room: string) => void;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({ rooms, currentRoom, onRoomSelect }) => {
  const [sortOrder, setSortOrder] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filteredRooms, setFilteredRooms] = useState(rooms);

  // Use Stomp Client hook for message subscription and sending messages
  const { subscribeToRoom, isConnected } = useStompClient((message) => {
    // Handle incoming messages here
    console.log("New message received:", message);
    setFilteredRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.conversationId === message.conversationId
          ? { ...room, previewMessage: message.messageContent, lastMessageTime: message.timestamp }
          : room
      )
    );
  });

  useEffect(() => {
    // Only subscribe to rooms when the STOMP client is connected
    if (isConnected) {
      const subscriptions = rooms.map((room) => {
        try {
          return subscribeToRoom(room.conversationId);
        } catch (error) {
          console.error("Error subscribing to room:", error);
        }
      });

      // Cleanup subscriptions on component unmount or rooms change
      return () => {
        subscriptions.forEach((subscription) => {
          if (subscription && subscription.unsubscribe) {
            subscription.unsubscribe();
          }
        });
      };
    }
  }, [rooms, subscribeToRoom, isConnected]);

  const handleSortChange = (value: string) => {
    setSortOrder(value);
    setDropdownOpen(false);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filtering and sorting logic
  useEffect(() => {
    const updatedFilteredRooms = rooms
      .filter((room) =>
        room.userName.toLowerCase().includes(searchQuery.toLowerCase()) // Filter by userName
      )
      .sort((a, b) => {
        if (sortOrder === "latest") {
          return b.lastMessageTime - a.lastMessageTime; // Sort by most recent message
        } else if (sortOrder === "unread") {
          return b.unread === a.unread ? 0 : b.unread ? -1 : 1;
        }
        return 0;
      });

    setFilteredRooms(updatedFilteredRooms);
  }, [rooms, sortOrder, searchQuery]);

  return (
    <div className="flex flex-col h-full p-4 bg-primary-100">
      {/* Title and Dropdown Button */}
      <div className="relative flex items-center justify-between w-full">
        <h2 className="text-lg font-semibold flex items-center">
          채팅 목록
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="ml-2 text-sm p-0 bg-transparent border-none cursor-pointer"
          >
            <FaChevronDown />
          </button>
        </h2>

        {dropdownOpen && (
          <div className="absolute z-10 w-48 bg-white border border-gray-300 rounded shadow-lg">
            <div
              className="cursor-pointer px-4 py-2 hover:bg-gray-100"
              onClick={() => handleSortChange("latest")}
            >
              최신 메시지 순
            </div>
            <div
              className="cursor-pointer px-4 py-2 hover:bg-gray-100"
              onClick={() => handleSortChange("unread")}
            >
              안 읽은 메시지 순
            </div>
          </div>
        )}
      </div>

      {/* Search Box */}
      <div className="mb-4 flex items-center bg-white border border-gray-300 rounded-lg w-full text-sm">
        <FaSearch className="text-gray-400 ml-3" />
        <input
          type="text"
          placeholder="환자 이름 검색"
          className="border-none outline-none w-full px-3 py-2"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* Chat Room List */}
      <ScrollArea.Root className="w-full h-full flex-1">
        <ScrollArea.Viewport className="w-full h-full rounded-xl text-sm overflow-y-auto">
          <ul className="w-full bg-slate-50 rounded-xl text-sm">
            {filteredRooms.map((room) => (
              <li
                key={room.conversationId}
                className={`cursor-pointer px-4 py-2 flex items-center justify-between w-full ${
                  currentRoom === room.conversationId ? 'bg-slate-400 text-white' : 'bg-transparent text-black'
                }`}
                onClick={() => onRoomSelect(room.conversationId)}
              >
                <div className="flex flex-col">
                  <span className="font-semibold">{room.userName}</span>
                  <span className="text-sm text-gray-600">{room.previewMessage}</span>
                </div>
                <span
                  className={`text-xs ${
                    currentRoom === room.conversationId ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {formatTime(room.lastMessageTime)}
                </span>
              </li>
            ))}
          </ul>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          orientation="vertical"
          className="w-2 bg-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 ease-in-out"
        >
          <ScrollArea.Thumb className="bg-gray-500 rounded" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
};

export default ChatRoomList;