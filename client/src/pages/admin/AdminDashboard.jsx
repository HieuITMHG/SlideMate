import { useState, useEffect } from 'react'
import axios from 'axios';
import { Link } from "react-router-dom";
const StatItem = ({ name, value }) => {
    return (
        <div className="bg-cyan-100 rounded-lg shadow h-30 p-4 text-center">
            <p className="text-sky-700 text-xl font-bold">{name}</p>
            <p className="text-xl ">{value}</p>
        </div>
    );
};

const QUICKACTION = [
    {name:"Xủ lý báo cáo", link:"/admin/reports"},
    {name:"Quản lý tài khoản", link:"/admin/users"},
    {name:"Quản lý danh mục", link:"/admin/categories"},
    {name:"Thống kê", link:"/admin/statistics"}
    
]
const QuickAction = ({name, link}) =>{
    return (
        <div className='bg-sky-300 py-2 px-5 m-5 rounded shadow'>
            <Link to={link}> 
            <div className='hover:font-bold'>{name}</div>
            </Link>
            
        </div>
    )
}




const AdminDashboard = () => {
    console.log("token:", localStorage.getItem('accessToken'));
    const [statisticsData, setStatisticsData] = useState();
    const [isLoading, setIsLoading] = useState(true)


    const fetchData = async () => {

        setStatisticsData({
            "Tổng số người dùng": 10000,
            "Số người dùng đăng ký mới trong tháng này": 100,
            "Số tố cáo cần giải quyết": 25,
            "Số danh mục tài liệu": 10,
            "Tổng số tài liệu trên hệ thống": 1000000,
            "Tổng số tài liệu được tải lên mới trong tháng này": 1000,

        });
        setIsLoading(false);
    };


    useEffect(() => {
        fetchData();
    }
        , [])

    if(isLoading)   
        return <div>Loading...</div>
    return (
        <div className="p-6 bg-sky-100 w-full h-full rounded-xl">
            <h1 className="text-3xl text-sky-900 font-bold text-center mb-5">Trang chủ </h1>
            
            
            <div className='bg-white rounded-xl shadow p-3 m-3' >
                <div className='text-xl font-bold'>Tổng quan hệ thống</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 m-2 p-2">
                {Object.entries(statisticsData).map(([name, value]) => (
                    <StatItem key={name} name={name} value={value} />
                ))}
            </div>
            </div>

            <div className='bg-white rounded-xl shadow p-3 m-3'>
                <div className='text-xl font-bold'>Truy cập nhanh các chức năng</div>
                <div className='flex flex-rows gap-4 items-center justify-center' >
                    {QUICKACTION.map((element, index)=>(
                    <QuickAction name={element.name} link={element.link} key={index}/>
                ))}
                </div>
            </div>
            
            
        </div>
    );
};

export default AdminDashboard;