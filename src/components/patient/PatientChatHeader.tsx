import React from "react";
import { Link } from "react-router-dom";
import IconButton from "./IconButton";

interface PatientChatHeaderProps {
  title: string;
  showMenu?: boolean; // Optional prop
}

const PatientChatHeader: React.FC<PatientChatHeaderProps> = ({ title, showMenu = false }) => (
  <header className="flex items-center justify-between px-4 py-6 bg-gradient-to-b from-gray-100 to-transparent text-black z-10">
    <IconButton
      iconSrc="/icons/back-icon.png"
      altText="Back"
      className="absolute left-4"
      onClick={() => window.history.back()}
    />
    <h1 className="text-lg font-bold text-center flex-1">{title}</h1>
    {showMenu && (
      <Link to="/patient-chat-categories" className="absolute right-4 text-lg">
        <IconButton iconSrc="/icons/menu-icon.png" altText="Menu" />
      </Link>
    )}
  </header>
);

export default PatientChatHeader;