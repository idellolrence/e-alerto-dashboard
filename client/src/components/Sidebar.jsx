import React from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const Sidebar = ({ isOpen, setIsOpen, setPage }) => {
  const navigate = useNavigate();
  const links = ["Dashboard", "Reports", "Users", "Settings"];

  return (
    <div
      className={`fixed md:relative top-0 left-0 h-full w-64 bg-white shadow-md transform transition-transform duration-300 z-30 ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="p-6">
        <img
          src={assets.logo}
          alt="Logo"
          onClick={() => navigate("/Dashboard")}
          className="w-50 cursor-pointer"
        />
      </div>
      <ul className="p-4 space-y-2">
        {links.map((link) => (
          <li
            key={link}
            onClick={() => {
              setPage(link.toLowerCase());
              setIsOpen(false);
            }}
            className="p-2 rounded hover:bg-indigo-100 cursor-pointer"
          >
            {link}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
