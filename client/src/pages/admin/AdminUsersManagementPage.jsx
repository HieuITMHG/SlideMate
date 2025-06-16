import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';

const UserListItem = ({ user, onToggleUser }) => {
    console.log(user);
    return (
        <div className='grid h-11 shadow grid-cols-5 gap-4 m-2 p-2 text-center ' >
            <div>{user.user_id}</div>
            <div>{user.first_name + user.last_name}</div>
            <div>{user.email}</div>
            <div>{(user?.is_active) ? "active" : "unactive"}</div>
            <button
                className={`rounded-xl w-2/3 h-full p-auto m-auto ${user.is_active ? 'bg-red-500 hover:bg-red-200' : 'bg-green-500 hover:bg-green-200'}`}
                onClick={() => onToggleUser(user)}>
                {(user.is_active) ? "Khóa tài khoản" : "Mở tài khoản"}
            </button>
        </div>
    );
}
const AdminUsersManagementPage = () => {

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [maxPage, setMaxPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchData = async  () => {
        setIsLoading(true);
        try{
            const response = await api.get("api/admin/users");
            setUsers(response.data.data);
            console.log(JSON.stringify(response.data, null, 4));
            console.log(typeof response.data.data[0].is_active);
        }
        catch(e){
            console.log(e);
        }
        
        setIsLoading(false);
    }

    const handleNextPage = () => { if (currentPage < maxPage) { setCurrentPage(currentPage + 1) } };
    const handelePrevPage = () => { if (currentPage > 1) { setCurrentPage(currentPage - 1) } };
    const handleUser = async (user) => {
        const isActive = !user.is_active;
        const action = isActive?"mở khóa":"khóa";
        const confirm =window.confirm(`Bạn có xác nhận ${action} tài khoản ${user.user_id} không?`);
        if (confirm){
            try{
                const apiName = isActive ? 'activate' : 'deactivate';
                const response = await api.post(`/api/admin/users/${user.user_id}/${apiName}`);
                await fetchData();
                window.alert('Thành công!');
            }
            catch (error){
                window.alert("Có lỗi xảy ra: " + error);
            }
            
        }else{
            console.log("Cancelled");
        }
    }
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setMaxPage(Math.ceil(users.length / itemsPerPage));
        setCurrentPage(1);
    }, [users]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min((currentPage * itemsPerPage), users.length);


    return (
        isLoading ? <div>Loading....</div>
            :
            <div className="w-full h-full bg-sky-100 from-blue-50 to-indigo-100 p-8 font-sans rounded-xl">
                <h1 className="text-4xl font-bold text-center m-2 p-2 ">Quản lý người dùng</h1>

                <div className='bg-white rounded-xl'>
                    <div className='grid grid-cols-5 gap-4 shadow rounded-t-xl h-10 text-center p-2 font-bold bg-sky-500'>
                        <div>UID</div>
                        <div>Họ và tên</div>
                        <div>Email</div>
                        <div>Trạng thái</div>
                        <div>hành động</div>
                    </div>
                    {users.slice(startIndex, endIndex).map((u) => (
                        <UserListItem key={u.user_id} user={u} onToggleUser={handleUser} />
                    ))}
                     <div className='grid h-0 grid-cols-5 gap-4 m-0 p-0 rounded-b-xl bg-white'></div>
                </div>


                {/* page */}
                <div className="m-auto grid grid-cols-3 gap-4 items-center text-center justify-center w-1/2 p-4">
                    <button className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-gray-500"
                        disabled={currentPage == 1}
                        onClick={handelePrevPage}
                    >
                        Trang trước
                    </button>

                    <div className="text-gray-700 font-medium">{`${currentPage} / ${maxPage}`}</div>

                    <button className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-gray-500"
                        disabled={currentPage == maxPage}
                        onClick={handleNextPage}
                    >
                        Trang sau
                    </button>
                </div>
            </div>
    );
};

export default AdminUsersManagementPage;