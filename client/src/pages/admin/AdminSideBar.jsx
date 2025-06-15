import { NavLink } from 'react-router-dom'

const SideBarItem = ({ to, name }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-4 py-2 rounded-md ${isActive
          ? 'bg-sky-600 text-white'
          : 'hover:bg-gray-700'}`}
      end
    >
      {name}
    </NavLink>
  )
}

const AdminSidebar = () => {
  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Quản Trị Viên</h2>
      <nav>
        <ul className="space-y-2">

          <li><SideBarItem to="/admin" name="Trang chủ" /></li>
          <li><SideBarItem to="/admin/reports" name="Tố cáo từ người dùng" /></li>
          <li><SideBarItem to="/admin/users" name="Quản lý người dùng" /></li>
          <li><SideBarItem to="/admin/categories" name="Quản lý danh mục" /></li>
          <li><SideBarItem to="/admin/statistics" name="Thống kê dữ liệu" /></li>

        </ul>
      </nav>
    </div>
  )
}
export default AdminSidebar