import { useState } from 'react';
import PendingReportsPage from './PendingReportsPage';
import HandledReportsPage from './HandledReportsPage';

const AdminReportsManagementPage = () => {
    const [viewPendingReports, setViewPendingReports] = useState(true);
    return (
        <div className="bg-sky-100 w-full h-full m-auto p-auto rounded-xl">
            <h1 className="text-5xl font-bold text-center m-2 p-2 ">Báo cáo tài liệu vi phạm từ người dùng</h1>

            {/* Nut chuyen page */}
            <div className="ml-1 w-1/4">
                <button
                    onClick={() => setViewPendingReports(true)}
                    className={`${viewPendingReports ? "bg-blue-400" : "hover:bg-blue-200"} shadow py-1  px-3 w-1/2`}
                >
                    Chưa xử lý
                </button>
                <button
                    onClick={() => setViewPendingReports(false)}
                    className={`${!viewPendingReports ? "bg-blue-400" : "hover:bg-blue-200"} shadow py-1  px-3 w-1/2`}
                >
                    Đã xử lý
                </button>
            </div>
            <hr />

            {/* Page */}
            {(viewPendingReports) ? <PendingReportsPage /> : <HandledReportsPage />}
        </div>
    );
}

export default AdminReportsManagementPage;