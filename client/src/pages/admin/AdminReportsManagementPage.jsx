import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Main Component: AdminReportsManagementPage
const AdminReportsManagementPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [allReports, setAllReports] = useState([]);
    const [viewUnhandledReports, setViewUnhandledReports] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);

    // Biến state mới cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [reportsPerPage] = useState(5); // Số báo cáo trên mỗi trang
    const [maxPage, setMaxPage] = useState(1);

    return (
        !isLoading? <div>Loading</div>
        :
        <div className="bg-sky-100 w-full h-full m-auto p-auto rounded-xl">
             <h1 className="text-5xl font-bold text-center m-2 p-2 ">Báo cáo tài liệu từ người dùng</h1>
             <div className="flex justify-center mb-10 bg-white p-1 rounded-full shadow-inner max-w-sm mx-auto border border-gray-200">
                <button 
                    onClick={() => setViewUnhandledReports(true)}
                    className={`flex-1 px-6 py-2 rounded-full text-lg font-medium transition-all duration-300 ease-in-out 
                        ${viewUnhandledReports 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    Chưa xử lý
                </button>
                <button 
                    onClick={() => setViewUnhandledReports(false)}
                    className={`flex-1 px-6 py-2 rounded-full text-lg font-medium transition-all duration-300 ease-in-out 
                        ${!viewUnhandledReports 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    Đã xử lý
                </button>
            </div>
        </div>
    );
}

export default AdminReportsManagementPage;