import { Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import logo from '@imgs/troll_face.png';
import { FaSearch } from 'react-icons/fa';
import { GoUpload } from 'react-icons/go';

import MainDropDown from '../components/MainDropDown';

function Layout() {
  const user = useSelector((state) => state.user.userInfo);
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-black text-white py-4 px-10 w-screen flex sticky justify-between top-0">
        <Link to={'/'}>
          <div className="flex items-center">
            <div>
              <img src={logo} alt="Logo" className="h-10" />
            </div>
            <div>
              <p className="text-2xl font-bold">SlideMate</p>
              <p className="text-[10px]">Tài liệu của mày là của bố</p>
            </div>
          </div>
        </Link>

        <div className="flex gap-6 items-center">
            <div>
                <form className="flex items-center">
                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="border border-white p-2 rounded-l-full border-r-0 h-12 w-80 text-white"
                />
                <div className="border p-2 rounded-r-full h-12 flex items-center">
                    <FaSearch className="text-gray-500" />
                </div>
                </form>
            </div>

            <div>
                <Link to={'/upload'} className="flex items-center text-2xl font-bold">
                    <GoUpload className="h-8" />
                    <p>Upload</p>
                </Link>
            </div>

            {user ? (
                <MainDropDown />
          ) : (
            <>
              <div>
                <Link to={'/login'}>
                  <div className="border border-white rounded-full h-10 p-2 w-24 font-bold text-center">
                    Login
                  </div>
                </Link>
              </div>
              <div>
                <Link to={'/register'}>
                  <div className="border border-white rounded-full h-10 p-2 w-24 font-bold text-center">
                    Sign up
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;