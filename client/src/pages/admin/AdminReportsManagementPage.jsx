import { useState, useEffect } from 'react';
import axios from 'axios';

// Component ReportItem và ReportModal (không thay đổi, giữ nguyên như trước)
const ReportItem = ({ report, onOpenModal }) => {
    return (
        <div className="border p-4 mb-4 flex items-center bg-white rounded-lg shadow-sm">
            <img 
                src={report.material_thumnail_image_url} 
                alt="Thumbnail tài liệu" 
                className="w-24 h-24 object-cover rounded-md mr-4"
            />
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{report.material_title}</h3>
                <p className="text-sm text-gray-600">Người tố cáo: {report.owner_name}</p>
                <p className="text-sm text-gray-600">Số lượng tố cáo: {report.reports.length}</p>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                    ${report.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                    {report.status === 'PENDING' ? 'Chưa xử lý' : 'Đã xử lý'}
                </span>
            </div>
            <button 
                onClick={() => onOpenModal(report)}
                className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
                Xem chi tiết
            </button>
        </div>
    );
}

const ReportModal = ({ report, onClose, onHandleReport }) => {
    const [banAccount, setBanAccount] = useState(false);
    const [deleteMaterial, setDeleteMaterial] = useState(false);

    useEffect(() => {
        if (report) {
            setBanAccount(false);
            setDeleteMaterial(false);
        }
    }, [report]);

    if (!report) return null;

    const handleConfirm = () => {
        onHandleReport({
            material_id: report.material_id,
            is_ban_account: banAccount,
            is_delete_material: deleteMaterial,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Chi tiết báo cáo</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-700 text-3xl font-light"
                    >
                        &times;
                    </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-800">Thông tin tài liệu</h3>
                        <p className="text-gray-700"><strong>Tiêu đề:</strong> {report.material_title}</p>
                        <p className="text-gray-700"><strong>ID tài liệu:</strong> {report.material_id}</p>
                        <p className="text-gray-700"><strong>Chủ sở hữu:</strong> {report.owner_name} (ID: {report.owner_id})</p>
                        
                        <h3 className="text-lg font-semibold mt-6 mb-2 text-gray-800">Nội dung tố cáo</h3>
                        {report.reports.map((r, index) => (
                            <div key={index} className="bg-gray-100 p-3 rounded-md mb-2">
                                <p className="text-gray-700"><strong>Người tố cáo ID:</strong> {r.reporter_id}</p>
                                <p className="text-gray-700"><strong>Nội dung:</strong> {r.report_content}</p>
                                <p className="text-xs text-gray-500">Thời gian: {new Date(r.report_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-800">File PDF</h3>
                        <div className="w-full h-96 border border-gray-300 rounded-md overflow-hidden">
                            <iframe 
                                src={report.material_pdf_url} 
                                className="w-full h-full" 
                                title="Material PDF"
                                frameBorder="0"
                            ></iframe>
                        </div>

                        {report.status === 'PENDING' && (
                            <div className="mt-6 p-4 border border-red-300 rounded-md bg-red-50">
                                <h3 className="text-lg font-semibold mb-3 text-red-800">Tùy chọn xử lý</h3>
                                <div className="mb-3">
                                    <label className="inline-flex items-center text-gray-800">
                                        <input 
                                            type="checkbox" 
                                            className="form-checkbox h-5 w-5 text-red-600" 
                                            checked={banAccount}
                                            onChange={(e) => setBanAccount(e.target.checked)}
                                        />
                                        <span className="ml-2">Khóa tài khoản chủ sở hữu</span>
                                    </label>
                                </div>
                                <div className="mb-4">
                                    <label className="inline-flex items-center text-gray-800">
                                        <input 
                                            type="checkbox" 
                                            className="form-checkbox h-5 w-5 text-red-600" 
                                            checked={deleteMaterial}
                                            onChange={(e) => setDeleteMaterial(e.target.checked)}
                                        />
                                        <span className="ml-2">Xóa tài liệu này</span>
                                    </label>
                                </div>
                                <button 
                                    onClick={handleConfirm}
                                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
                                >
                                    Xử lý báo cáo
                                </button>
                            </div>
                        )}
                         {report.status === 'HANDELED' && (
                            <div className="mt-6 p-4 border border-green-300 rounded-md bg-green-50">
                                <h3 className="text-lg font-semibold mb-3 text-green-800">Trạng thái</h3>
                                <p className="text-green-700">Báo cáo này đã được xử lý.</p>
                                <p className="text-green-700">Tác vụ: {report.is_ban_account ? "Khóa tài khoản" : ""} {report.is_delete_material ? "Xóa tài liệu" : ""}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const AdminReportsManagementPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [allReports, setAllReports] = useState([]);
    const [viewUnhandledReports, setViewUnhandledReports] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);

    // **Biến state mới cho phân trang**
    const [currentPage, setCurrentPage] = useState(1);
    const [reportsPerPage] = useState(5); // Số báo cáo trên mỗi trang
    const [maxPage, setMaxPage] = useState(1);

    const fakeData = [
        {       
            status: "PENDING",
            material_id:"mt1",
            material_title: "Tài liệu vi phạm bản quyền A",
            material_pdf_url: "https://res.cloudinary.com/dgfolq4in/raw/upload/v1749874762/CSDLPTTesst.pdf",
            material_thumnail_image_url: "https://res.cloudinary.com/dgfolq4in/raw/upload/v1749876451/SlideMate/wybrc6f3vk59znpfdanv.png",
            owner_id:"sdfsda234124",
            owner_name:"Nguyễn Văn A",
            admin_id:null,
            is_delete_material: false,
            is_ban_account: false,
            reports:
            [
                {
                    reporter_id:"289375",
                    report_content: "Tài liệu này vi phạm bản quyền nghiêm trọng.",
                    report_at: "2025-06-10"
                },
                {
                    reporter_id:"289376",
                    report_content: "Nội dung không phù hợp với quy định của nền tảng.",
                    report_at: "2025-06-11"
                },
            ]
        },
        {       
            status: "HANDELED",
            material_id:"mt2",
            material_title: "Tài liệu đã xử lý B",
            material_pdf_url: "https://res.cloudinary.com/dgfolq4in/raw/upload/v1749874762/CSDLPTTesst.pdf",
            material_thumnail_image_url: "https://res.cloudinary.com/dgfolq4in/raw/upload/v1749876451/SlideMate/wybrc6f3vk59znpfdanv.png",
            owner_id:"sdfsda234125",
            owner_name:"Trần Thị B",
            admin_id:"admin123",
            is_delete_material: true,
            is_ban_account: false,
            reports:
            [
                {
                    reporter_id:"289377",
                    report_content: "Tài liệu này chứa thông tin sai lệch.",
                    report_at: "2025-06-05"
                },
            ]
        },
        {       
            status: "PENDING",
            material_id:"mt3",
            material_title: "Tài liệu cần xem xét C",
            material_pdf_url: "https://res.cloudinary.com/dgfolq4in/raw/upload/v1749874762/CSDLPTTesst.pdf",
            material_thumnail_image_url: "https://res.cloudinary.com/dgfolq4in/raw/upload/v1749876451/SlideMate/wybrc6f3vk59znpfdanv.png",
            owner_id:"sdfsda234126",
            owner_name:"Lê Văn C",
            admin_id:null,
            is_delete_material: false,
            is_ban_account: false,
            reports:
            [
                {
                    reporter_id:"289378",
                    report_content: "Tài liệu không đúng chủ đề.",
                    report_at: "2025-06-12"
                },
            ]
        },
        {       
            status: "HANDELED",
            material_id:"mt4",
            material_title: "Tài liệu đã giải quyết D",
            material_pdf_url: "https://res.cloudinary.com/dgfolq4in/raw/upload/v1749874762/CSDLPTTesst.pdf",
            material_thumnail_image_url: "https://res.cloudinary.com/dgfolq4in/raw/upload/v1749876451/SlideMate/wybrc6f3vk59znpfdanv.png",
            owner_id:"sdfsda234127",
            owner_name:"Phạm Thị D",
            admin_id:"admin456",
            is_delete_material: false,
            is_ban_account: true,
            reports:
            [
                {
                    reporter_id:"289379",
                    report_content: "Tài liệu chứa quảng cáo trái phép.",
                    report_at: "2025-06-01"
                },
            ]
        },
    ];

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const combinedFakeData = [].concat(fakeData);
            setAllReports(combinedFakeData);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu báo cáo:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleReport = async ({ material_id, is_ban_account, is_delete_material }) => {
        console.log(`Xử lý báo cáo cho material_id: ${material_id}`);
        console.log(`Khóa tài khoản: ${is_ban_account}, Xóa tài liệu: ${is_delete_material}`);
        
        // Cập nhật dữ liệu giả định để thấy sự thay đổi ngay lập tức
        setAllReports(prevReports => prevReports.map(report => 
            report.material_id === material_id 
            ? { 
                ...report, 
                status: "HANDELED", 
                is_ban_account: is_ban_account, 
                is_delete_material: is_delete_material,
                admin_id: "currentAdmin" 
            } 
            : report
        ));
        setSelectedReport(null); // Đóng modal sau khi xử lý
    }

    useEffect(() => {
        fetchData();
    }, []);

    // **Logic lọc và phân trang**
    const filteredReports = allReports.filter(report => {
        if (viewUnhandledReports) {
            return report.status === 'PENDING';
        } else {
            return report.status === 'HANDELED';
        }
    });

    // Cập nhật maxPage mỗi khi filteredReports thay đổi
    useEffect(() => {
        const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
        setMaxPage(totalPages === 0 ? 1 : totalPages); // Đảm bảo ít nhất 1 trang
        setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
    }, [filteredReports, reportsPerPage]);

    // Tính toán index của báo cáo cho trang hiện tại
    const indexOfLastReport = currentPage * reportsPerPage;
    const indexOfFirstReport = indexOfLastReport - reportsPerPage;
    const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);

    // Xử lý chuyển trang
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const nextPage = () => {
        if (currentPage < maxPage) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">QUẢN LÝ BÁO CÁO</h1>
            
            <div className="flex justify-center mb-8 space-x-4">
                <button 
                    onClick={() => setViewUnhandledReports(true)}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-200 
                        ${viewUnhandledReports ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Báo cáo chưa xử lý
                </button>
                <button 
                    onClick={() => setViewUnhandledReports(false)}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-200 
                        ${!viewUnhandledReports ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Báo cáo đã xử lý
                </button>
            </div>

            {isLoading ? (
                <div className="text-center text-xl text-gray-600">Đang tải dữ liệu...</div>
            ) : (
                <div className="max-w-4xl mx-auto">
                    {currentReports.length > 0 ? (
                        <>
                            {currentReports.map(report => (
                                <ReportItem 
                                    key={report.material_id} 
                                    report={report} 
                                    onOpenModal={setSelectedReport} 
                                />
                            ))}
                            
                            {/* Thanh phân trang */}
                            <div className="flex justify-center items-center mt-8 space-x-4">
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    &lt; Trang trước
                                </button>
                                <span className="text-lg font-semibold text-gray-700">
                                    {currentPage}/{maxPage}
                                </span>
                                <button
                                    onClick={nextPage}
                                    disabled={currentPage === maxPage}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Trang sau &gt;
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-lg text-gray-500 p-8 border border-dashed rounded-lg bg-white">
                            Không có báo cáo nào {viewUnhandledReports ? 'chưa xử lý' : 'đã xử lý'} vào lúc này.
                        </div>
                    )}
                </div>
            )}

            {selectedReport && (
                <ReportModal 
                    report={selectedReport} 
                    onClose={() => setSelectedReport(null)} 
                    onHandleReport={handleReport}
                />
            )}
        </div>
    )
}

export default AdminReportsManagementPage;