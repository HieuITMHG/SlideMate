// MainDropDown.jsx
import { useDispatch, useSelector } from "react-redux";
import { clearUserInfo } from "../store/slices/userSlice";
import { useState } from "react";
import defaultAvatar from "@imgs/defaultAvatar.png";
import api from "../utils/api";

const MainDropDown = () => {
  const user = useSelector((state) => state.user.userInfo);
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleDropDown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/users/logout");
      localStorage.removeItem("accessToken");
      dispatch(clearUserInfo());
      window.location.href = "/login";
    } catch (error) {
      console.error("Lỗi khi logout:", error);
    }
  };

  return (
    <div className="relative cursor-pointer z-[999]" onClick={handleToggleDropDown} > 
      <img
        src={user?.avatar || defaultAvatar}
        alt="User Avatar"
        className="h-14 w-14 rounded-full object-cover"
      />

      {isOpen && (
        <div
          id="main-drop-down"
          className="w-48 bg-black text-white absolute top-16 right-0 rounded shadow-lg overflow-visible"
        >
          <p className="p-4">Hello, {user?.name || "User"}</p>
          <ul>
            <li className="p-2 hover:bg-gray-700 cursor-pointer">Profile</li>
            <li className="p-2 hover:bg-gray-700 cursor-pointer">Settings</li>
            <li
              className="p-2 hover:bg-gray-700 cursor-pointer"
              onClick={handleLogout}
            >
              Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MainDropDown;