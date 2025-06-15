import { useState, useEffect } from 'react'
import axios from 'axios';

const AdminUsersManagementPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState();
    const [maxPage, setMaxPage] = useState();
    const [currentPage, setCurrentPage] = useState();

    const fetchData = async ()=>{
        setIsLoading(true);
        try{
            //call api...
            const fakeData = [];
            for(let i = 0; i < 1000; i++){
                fakeData.push({
                    user_id: `user_${i}`,
                    first_name: `user_${i}_firstName`,
                    last_name: `user_${i}_lastName`,
                    is_active: (i % 2 == 0),
                    email: `user${i}@gmail.com`
                });
            }
            // console("wellcome");
            console.log(JSON.stringify(fakeData, null, 4));
            setUsers(fakeData);
        }
        catch(err){

        }
        finally{

        }
        setIsLoading(false);
    }

    // call api activate/deactivate
    const handleUser = ({user_id, action})=>{
        
    }

    useEffect(()=>{
        fetchData();
    }, []);
    return (
        <div>
            <h1 className="text-red text-8xl">ADMIN USERS MANAGEMENTS PAGE?</h1>
        </div>
    )
}

export default AdminUsersManagementPage;