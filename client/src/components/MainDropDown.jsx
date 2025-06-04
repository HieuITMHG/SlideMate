import { useDispatch, useSelector } from "react-redux";
import { clearUserInfo } from '../store/slices/userSlice';
import { useState } from "react";
import defaultAvatar from "@imgs/defaultAvatar.png";
import api from '../utils/api';

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
    <>
      <div className="cursor-pointer" onClick={handleToggleDropDown}>
        <img src={defaultAvatar} className="h-14 w-14 rounded-full" />
      </div>

      {isOpen && (
        <div
          id="main-drop-down"
          className="h-96 w-48 bg-black text-white absolute top-20 right-4 rounded shadow-lg z-50"
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
    </>
  );
};

export default MainDropDown;
