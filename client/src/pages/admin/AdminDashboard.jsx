import { useState, useEffect } from 'react'
import axios from 'axios';

const StatItem = ({ name, value }) => {
    return (
        <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-gray-500 text-sm">{name}</p>
            <p className="text-xl font-semibold">{value}</p>
        </div>
    );
};



const AdminDashboard = () => {
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
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Tóm tắt các thống kê</h1>
            {isLoading ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(statisticsData).map(([name, value]) => (
                        <StatItem key={name} name={name} value={value} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;