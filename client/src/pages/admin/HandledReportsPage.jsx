import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';

const HandledReportsPage = () => {
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
            const response = await api.get("api/admin/reports/handled");
            setReports(response.data.data);
        }
        catch (error) {
            const message = error?.response?.data?.message || "Lỗi không xác định";
            console.log(message);
        }
        setIsLoading(false);
    };

    useEffect(() => { fetchData() }, []);
    useEffect(() => {
        setMaxPage(Math.ceil(reports.length / itemsPerPage));
        setCurrentPage(1);
    }, [reports]);

    if (isLoading)
        return <div>Loading...</div>
    return (
        (currentReport != null) ?
            <></>
            : <div>
                <div>Code UI chưa kịp, coi đỡ JSON đi :)</div>
                <pre>{JSON.stringify(reports, null, 4)}</pre>
            </div>
    );
};

export default HandledReportsPage;