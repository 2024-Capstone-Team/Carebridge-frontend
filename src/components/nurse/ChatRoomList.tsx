import React, { useState, useMemo, useRef, useEffect } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import { getChoseong } from 'es-hangul'; // Import the getChoseong function
import { ChatRoom } from "../../types";

// Helper function to format time
const formatTime = (timestamp: string): string => {
  if (!timestamp) return ''; // Return an empty string if timestamp is empty
  
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffInMs = now.getTime() - messageTime.getTime();
  
  const diffInMinutes = Math.floor(diffInMs / 60000); // minutes
  const diffInHours = Math.floor(diffInMs / 3600000); // hours
  const diffInDays = Math.floor(diffInMs / 86400000); // days

  if (diffInMinutes < 1) {
    return "방금 전"; // Less than a minute ago
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} 분 전`; // Minutes ago
  } else if (diffInHours < 24) {
    return `${diffInHours} 시간 전`; // Hours ago
  } else {
    return `${diffInDays} 일 전`; // Days ago
  }
};

interface ChatRoomListProps {
  rooms: ChatRoom[];
  currentRoom: string;
  onRoomSelect: (room: string) => void;
  patientDetails: {
    [key: number]: {
      patientId: number;
      name: string;
    };
  };
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({ rooms, currentRoom, onRoomSelect, patientDetails }) => {
  const [sortOrder, setSortOrder] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownButtonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleSortChange = (value: string) => {
    setSortOrder(value);
    setDropdownOpen(false);
  };

  const handleSearchInput = (event: React.FormEvent<HTMLInputElement>) => {
    setSearchQuery(event.currentTarget.value);
  };

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !dropdownButtonRef.current?.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filterRoomsBySearchQuery = (room: ChatRoom, searchQuery: string): boolean => {
    if (searchQuery === '') {
      return true; // Show all rooms if the search query is empty
    }
  
    const userChoseong = getChoseong(room.userName); 
    const searchChoseong = getChoseong(searchQuery);
  
    // Check if the search query contains Korean characters
    const isKoreanSearch = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(searchQuery);
  
    if (isKoreanSearch) {
      // If it's a Korean search, check 초성
      return userChoseong.startsWith(searchChoseong);
    } else {
      // If it's an English search, check if the userName contains the searchQuery
      return room.userName.toLowerCase().includes(searchQuery.toLowerCase());
    }
  };

  const filteredRoomsMemo = useMemo(() => {
    return rooms
      .filter((room) => filterRoomsBySearchQuery(room, searchQuery))
      .sort((a, b) => {
        // Move empty previewMessage rooms to the top
        if (a.lastMessageTime === '' && b.lastMessageTime !== '') return -1;
        if (b.lastMessageTime === '' && a.lastMessageTime !== '') return 1;
  
        if (sortOrder === "latest") {
          return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime(); // Most recent messages first
        } else if (sortOrder === "unread") {
          if (b.isRead === a.isRead) {
            return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime(); // Secondary sort by latest
          }
          return b.isRead ? 1 : -1; // Unread messages first
        }
        return 0; // Default (no sorting)
      });
  }, [rooms, sortOrder, searchQuery]);  

  const parsePatientId = (conversationId: string): number => {
    const parts = conversationId.split("_");
    if (parts.length < 2) return 0;
    return parseInt(parts[1], 10);
  };

  return (
    <div className="flex flex-col h-full p-4 bg-primary-100 text-sm">
      {/* Title and Dropdown Button */}
      <div className="relative flex items-end justify-between w-full py-2">
        <h2 className="font-semibold" style={{ fontSize: "var(--font-title)" }}>채팅 목록</h2>
        <div className="flex items-center gap-1 text-[0.7rem] text-gray-500 self-end">
          <span>{sortOrder === "latest" ? "최신 메시지 순" : "안 읽은 메시지 순"}</span>
          <button
            ref={dropdownButtonRef}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-0 bg-transparent border-none cursor-pointer"
          >
            <FaChevronDown />
          </button>
        </div>
        {dropdownOpen && (
          <div
            ref={dropdownRef} 
            className="absolute z-10 w-48 bg-white border border-gray-300 rounded shadow-lg"
            style={{
              top: dropdownButtonRef.current ? `${dropdownButtonRef.current.offsetTop + dropdownButtonRef.current.offsetHeight}px` : '0', // Position the dropdown below the button
              left: dropdownButtonRef.current ? `${dropdownButtonRef.current.offsetLeft}px` : '0', // Align the left edge of the dropdown with the button
            }}
          >
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
      <div className="mb-4 flex items-center bg-zinc-50 border border-gray-300 rounded-lg w-full text-xs">
        <FaSearch className="text-gray-400 ml-3" />
        <input
          type="text"
          placeholder="환자 이름 검색"
          className="border-none outline-none w-full px-3 py-2 rounded-lg text-xs" // Apply smaller font size
          value={searchQuery}
          onInput={handleSearchInput} // Handle each input event
        />
      </div>

      {/* Chat Room List */}
      <div className="flex-1 overflow-y-auto">
        <ul className="w-full bg-zinc-50 rounded-xl max-h-[400px] overflow-auto">
          {filteredRoomsMemo.map((room) => {
            const pid = parsePatientId(room.conversationId);
            const displayName = room.userName
            return (
            <li
              key={room.conversationId}
              className={`cursor-pointer px-4 py-2 flex items-center justify-between w-full ${
                currentRoom === room.conversationId
                  ? 'bg-primary-200 text-white' // Only change background for selected room
                  : 'bg-transparent text-black'
              }`}
              onClick={() => onRoomSelect(room.conversationId)}
            >
              <div className="flex flex-col min-h-[56px] w-full">
                <span
                  className={`font-semibold ${!room.isRead ? 'font-bold' : ''}`}
                >
                  {room.userName}
                </span>
                <span className={`text-gray-600 font-semibold ${!room.isRead ? 'font-bold' : ''}`} style={{ fontSize: "var(--font-caption)" }}>
                  {room.previewMessage.length > 30 ? `${room.previewMessage.slice(0, 30)}...` : room.previewMessage}
                </span>
                <span
                  className={`self-end text-gray-400 text-[0.6rem] whitespace-nowrap ${currentRoom === room.conversationId ? 'text-white' : 'text-gray-400'}`}
                >
                  {formatTime(room.lastMessageTime)}
                </span>
              </div>
            </li>
            );
          })}
        </ul>
      </div>

    </div>
  );
};

export default ChatRoomList;