import Footer from "../../components/Footer";
import AdminSidebar from "./AdminSideBar";
import { Outlet } from 'react-router-dom'

const AdminLayout = ()=>{
    return (
        <div className="flex flex-col min-h-screen">
            {/* <div className="flex bg-sky-400">Chưa có header, khi nào có bỏ vào đây</div> */}

            <div className="flex flex-1">
                <AdminSidebar />
                <main className="flex-1 p-6 ">
                    <Outlet />
                </main>
            </div>

            <Footer />
        </div>
    )
}
export default AdminLayout;