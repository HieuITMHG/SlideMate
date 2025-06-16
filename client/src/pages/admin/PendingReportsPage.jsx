import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';


const fakeData = [
    {
        "material_id": "684fa72aa75c086b5188868a",
        "material_title": "Công nghệ nana",
        "material_pdf_url": "https://res.cloudinary.com/dgfolq4in/raw/upload/v1750050601/SlideMate/684fa724a75c086b51888689/converted.pdf",
        "material_thumnail_url": "https://res.cloudinary.com/dgfolq4in/image/upload/v1750050602/SlideMate/684fa724a75c086b51888689/thumbnail.png.png",
        "material_owner_id": "684f88d39d579b3818ef0fbf",
        "reports": [
            {
                "reporter_id": "684f88d39d579b3818ef0fbf",
                "report_at": "2025-06-16T06:13:07.997Z",
                "report_content": "Hư quá",
                "report_id": "684fb5f3380ad086bdd82b54"
            },
            {
                "reporter_id": "684fc0efca172efb11ce1366",
                "report_at": "2025-06-16T08:37:33.335Z",
                "report_content": "Thích thì tố",
                "report_id": "684fd7cd0d0005ef84c30d31"
            },
            {
                "reporter_id": "684fd8190d0005ef84c30d4e",
                "report_at": "2025-06-16T08:39:12.181Z",
                "report_content": "Tố cáothêm cái nữa",
                "report_id": "684fd8300d0005ef84c30d7e"
            },
            {
                "reporter_id": "684f88d39d579b3818ef0fbf",
                "report_at": "2025-06-16T06:13:07.997Z",
                "report_content": "Hư quá",
                "report_id": "684fb5f3380ad086bdd82b54"
            },
            {
                "reporter_id": "684f88d39d579b3818ef0fbf",
                "report_at": "2025-06-16T06:13:07.997Z",
                "report_content": "Hư quá",
                "report_id": "684fb5f3380ad086bdd82b54"
            },
            {
                "reporter_id": "684f88d39d579b3818ef0fbf",
                "report_at": "2025-06-16T06:13:07.997Z",
                "report_content": "Hư quá",
                "report_id": "684fb5f3380ad086bdd82b54"
            }
        ]
    },
    {
        "material_id": "684f98769e7f9898a1740c2c",
        "material_title": "Văn học 1",
        "material_pdf_url": "https://res.cloudinary.com/dgfolq4in/raw/upload/v1750046836/SlideMate/684f986f9e7f9898a1740c2b/converted.pdf",
        "material_thumnail_url": "https://res.cloudinary.com/dgfolq4in/image/upload/v1750046837/SlideMate/684f986f9e7f9898a1740c2b/thumbnail.png.png",
        "material_owner_id": "684f88d39d579b3818ef0fbf",
        "reports": [
            {
                "reporter_id": "684fc0efca172efb11ce1366",
                "report_at": "2025-06-16T08:37:33.335Z",
                "report_content": "Thích thì tố",
                "report_id": "684fd7cd0d0005ef84c30d31"
            },
            {
                "reporter_id": "684fd8190d0005ef84c30d4e",
                "report_at": "2025-06-16T08:39:12.181Z",
                "report_content": "Tố cáothêm cái nữa",
                "report_id": "684fd8300d0005ef84c30d7e"
            },
            {
                "reporter_id": "684f88d39d579b3818ef0fbf",
                "report_at": "2025-06-16T06:13:07.997Z",
                "report_content": "Hư quá",
                "report_id": "684fb5f3380ad086bdd82b54"
            },
            {
                "reporter_id": "684f88d39d579b3818ef0fbf",
                "report_at": "2025-06-16T06:13:07.997Z",
                "report_content": "Hư quá",
                "report_id": "684fb5f3380ad086bdd82b54"
            },
            {
                "reporter_id": "684f88d39d579b3818ef0fbf",
                "report_at": "2025-06-16T06:13:07.997Z",
                "report_content": "Hư quá",
                "report_id": "684fb5f3380ad086bdd82b54"
            }
        ]
    }
];

const ListItem = ({ data, onClick }) => {
    return (
        <div className='bg-white flex flex-row shadow rounded-xl m-2 p-2'>
            <div className='shadow p-5'><img src={data.material_thumnail_url} alt="thumnail" className='h-30' /></div>

            <div className='shadow flex flex-col p-5'>
                <div>{`Tiêu đề: ${data.material_title}`}</div>
                <div>{`Id tai lieu: ${data.material_id}`}</div>
                <div>{`Id chu so huu: ${data.material_owner_id}`}</div>
                <div>{`So luot to cao: ${data.reports.length}`}</div>
            </div>

            <div
                className='bg-green-500 flex items-center justify-center m-auto p-5 rounded-xl hover:bg-green-300 hover:font-bold'
                onClick={() => (onClick(data))}
            >
                <button>
                    Chi tiet
                </button>
            </div>
        </div>
    )
}

const ReportsDetails = ({ data, onAction, onExit }) => {
    const [viewMaterial, setViewMaterial] = useState(false);
    const [isDeleteMaterial, setIsDeleteMaterial] = useState(false);
    const [isBanAccount, setIsBanAccount] = useState(false);
    return (
        <div className='flex flex-col bg-white m-2 p-2 rounded-xl'>
            <div className='text-center bg-green-500 w-1/10  p-2 rounded-xl hover:bg-green-300 hover:font-bold'>
                <button
                    className='text-center'
                    onClick={onExit}>
                    exit
                </button>
            </div>
            <div className='shadow flex flex-col p-5 m-2'>
                <div>{`Tiêu đề: ${data.material_title}`}</div>
                <div>{`Id tai lieu: ${data.material_id}`}</div>
                <div>{`Id chu so huu: ${data.material_owner_id}`}</div>
                <div>{`So luot to cao: ${data.reports.length}`}</div>
            </div>

            <div className='text-center bg-green-500 w-2/10  p-2 rounded-xl hover:bg-green-300 hover:font-bold'>
                <button
                    className='text-center'
                    onClick={() => (setViewMaterial(!viewMaterial))}>
                    {`Click de ${(viewMaterial) ? "an" : "xem"} tai lieu`}
                </button>
            </div>

            {viewMaterial && <div className='w-9/10 flex justify-center items-center bg-red-500'>
                <iframe className='w-full h-200 ' src={data.material_pdf_url} ></iframe>
            </div>}


            <div>Cac bao cao ve tai lieu nay:</div>
            <div className='overflow-auto max-h-50 p-5 shadow m-5 rounded-xl border-1 border-black-100'>
                {data.reports.map((r) => {
                    return (
                        <div className='shadow m-2 rounded-xl bg-gray-100'>
                            <div>{`Id report: ${r.report_id}`}</div>
                            <div>{`Id nguoi bao cao: ${r.reporter_id}`}</div>
                            <div>{`Vao luc: ${r.report_at}`}</div>
                            <div>{`Noi dung: ${r.report_content}`}</div>
                        </div>
                    );
                })}
            </div>

            <div>Xu ly:</div>
            <div className='border-1 border-red-500 rounded-xl p-5'>
                <div>
                    <input
                        className='w-4 h-4 m-2'
                        type="checkbox"
                        checked={isDeleteMaterial}
                        onChange={() => setIsDeleteMaterial(!isDeleteMaterial)} />
                    <span>Xoa tai lieu</span>
                </div>

                <div >
                    <input
                        className='w-4 h-4 m-2'
                        type="checkbox"
                        checked={isBanAccount}
                        onChange={() => setIsBanAccount(!isBanAccount)} />
                    <span>Khoa tai khoan</span>
                </div>

                <div className='flex items-center justify-center p-1 m-1 text-center'>
                    <button
                        className='w-1/10 bg-red-500 rounded-xl p-2 hover:bg-red-500 hover:text-white hover:text-xl hover:text-red-500 hover:font-bold'
                        onClick={() => onAction({ data: data, isDeleteMaterial: isDeleteMaterial, isBanAccount: isBanAccount })}
                    >Xac nhan</button>
                </div>

            </div>

        </div>
    )
}
const PendingReportsPage = () => {
    const [reports, setReports] = useState([]);
    const [currentReport, setCurrentReport] = useState(null);

    // loading
    const [isLoading, setIsLoading] = useState(true);


    // page
    const itemsPerPage = 5;
    const [maxPage, setMaxPage] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const handleNextPage = () => { if (currentPage < maxPage) setCurrentPage(currentPage + 1) };
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1) };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("api/admin/reports/pending");

            setReports(response.data.data);
            // setReports(fakeData);
        }
        catch (error) {
            console.log(error);

        }
        setIsLoading(false);
    };

    useEffect(() => { fetchData() }, []);
    useEffect(() => {
        setMaxPage(Math.ceil(reports.length / itemsPerPage));
        setCurrentPage(1);
        setCurrentReport(null);
        console.log(JSON.stringify(reports, null, 4));
    }, [reports]);

    const handleReport = async ({ data, isDeleteMaterial, isBanAccount }) => {
        window.alert(`${isDeleteMaterial}, ${isBanAccount} \n chua code api, tutu`);
        setCurrentReport(null);
    }
    return (
        isLoading ? <>Loading...</>
            : (
                (currentReport != null) ?
                    <><ReportsDetails data={currentReport} onAction={handleReport} onExit={() => { (setCurrentReport(null)) }} /></>
                    : <div>
                        {/* <div>Code UI chưa kịp, coi đỡ JSON đi :)</div>
                        <pre className='w-9/10 overflow-auto'>{JSON.stringify(reports, null, 1)}</pre> */}
                        {/* <ListItem data={reports[0]} onClick={setCurrentReport} /> */}

                        {
                            reports.slice((currentPage - 1) * itemsPerPage, Math.min(currentPage * itemsPerPage, reports.length))
                                .map((r) => (
                                    <ListItem data={r} onClick={setCurrentReport} key={r.material_id} />
                                ))
                        }
                        <div className="m-auto grid grid-cols-3 gap-4 items-center text-center justify-center w-1/2 p-4">
                            <button className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-gray-500"
                                disabled={currentPage == 1}
                                onClick={handlePrevPage}
                            >
                                Trang trước
                            </button>

                            <div className="text-gray-700 font-medium  h-full text-center font-bold text-xl">{`${currentPage} / ${maxPage}`}</div>

                            <button className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-gray-500"
                                disabled={currentPage == maxPage}
                                onClick={handleNextPage}
                            >
                                Trang sau
                            </button>
                        </div>

                    </div>
            )

    )
}

export default PendingReportsPage;