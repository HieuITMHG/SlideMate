import { useState, useEffect } from 'react'
import axios from 'axios';

const AdminStatisticsPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState();

    return (
        <div>
            <h1 className="text-red text-8xl">ADMIN STATISTIC PAGE</h1>
        </div>
    )
}

export default AdminStatisticsPage;