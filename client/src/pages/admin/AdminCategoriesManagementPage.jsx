import { useState, useEffect } from 'react'
import api from '../../utils/api';

const CategorisItem = ({ category }) => {
    return (
        <div
            className='grid grid-cols-2 gap-4 shadow h-10 text-center p-2 bg-white'
        >
            <div>{category.id}</div>
            <div>{category.name}</div>
        </div>
    );
}

const AdminCategoriesManagementPage = () => {
    const [categories, setCategories] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    const itemsPerPage = 10;
    const [maxPage, setMaxPage] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const handleNextPage = () => { if (currentPage < maxPage) { setCurrentPage(currentPage + 1) } };
    const handelePrevPage = () => { if (currentPage > 1) { setCurrentPage(currentPage - 1) } };

    const fetchData = async () => {
        setIsLoading(true);
        // const fakeData = [];
        // for (let i = 0; i < 101; i++) {
        //     fakeData.push({ id: i, name: `cat${i}` });
        // }
        // setCategories(fakeData);
        try{
            const response = await api.get("api/admin/categories");
            console.log(JSON.stringify(response.data.data, null, 4));
            setCategories(response.data.data);

        }catch(error){
            console.log(error);
        }
        setIsLoading(false);
    }

    const addNewCategory = async () => {
        const name = window.prompt("Nhap ten moi");
        if (name != null && name.trim() != "") {
            const confirm = window.confirm(`Bạn có chắc muốn thêm danh mục mới "${name}" không?`);
            if (confirm) {
                try{
                    const response = await api.post("api/admin/categories/new", {name:name});
                    window.alert("Thanh cong!");
                    await fetchData();
                }catch(error){
                    const message = error?.response?.data?.message || error.message || "Lỗi không xác định";
    window.alert("Có lỗi xảy ra: " + message);
                }
            }

        }
    }

    useEffect(() => {
        fetchData();
    }, [])

    useEffect(() => {
        setMaxPage(Math.ceil(categories.length / itemsPerPage));
        setCurrentPage(1);
    }, [categories])




    return (
        isLoading ? <div>Đang tải dữ liệu</div>
            :
            <div className="bg-sky-100 w-full h-full m-auto p-auto rounded-xl">
                <h1 className="text-5xl font-bold text-center m-2 p-2 ">Danh mục tài liệu</h1>


                <button className='p-2 m-2 bg-sky-500 rounded hover:bg-sky-300'
                    onClick={addNewCategory}
                >Thêm danh mục mới</button>

                {/* Categories list */}

                <div className='p-1 m-5 '>
                    <div
                        className='grid grid-cols-2 gap-4 shadow rounded-t-xl h-10 text-center p-2 font-bold bg-sky-500'
                    >
                        <div>Mã danh mục</div>
                        <div>Tên danh mục</div>
                    </div>
                    {
                        categories.slice((currentPage - 1) * itemsPerPage, Math.min((currentPage) * itemsPerPage, categories.length)).map((item) => (
                            <CategorisItem category={item} key={item.id} />
                        ))
                    }
                    <div
                        className='grid grid-cols-2 gap-4 shadow rounded-b-xl h-1 text-center p-2 font-bold bg-white'></div>


                    {/* page */}
                    <div className="m-auto grid grid-cols-3 gap-4 items-center text-center justify-center w-1/2 p-4">
                        <button className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-gray-500"
                            disabled={currentPage == 1}
                            onClick={handelePrevPage}
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
            </div>
    )
}

export default AdminCategoriesManagementPage;