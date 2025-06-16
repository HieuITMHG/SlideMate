import { useState, useEffect } from 'react';
import api from '../../utils/api';
import CustomPieChart from './components/CustomPieChart';
import CustomBarChart from './components/CustomBarChart';

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EF5",
  "#FF6699", "#33CCFF", "#66FF66", "#FF4444", "#9966FF",
  "#FF9933", "#0099CC", "#CCFF66", "#FFCC00", "#6699FF",
  "#FF6666", "#66CCCC", "#CC99FF"
];

const AdminStatisticsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [data, setData] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setLoadingMessage("Loading...");
    try {
      const response = await api.get("api/admin/statistics");
      setData(response.data.data);
    } catch (error) {
      const message = error?.response?.data?.message || "Lỗi không xác định";
      setLoadingMessage("Error: " + message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading || !data) {
    return <div className='bg-sky-50 w-full h-full p-10 text-center text-xl'>{loadingMessage}</div>;
  }

  const topViewedMaterials = [...data.materials]
    .sort((a, b) => b.total_views - a.total_views)
    .slice(0, 10);

  const topLikedMaterials = [...data.materials]
    .sort((a, b) => b.total_likes - a.total_likes)
    .slice(0, 10);

  const topViewedCategories = [...data.categories]
  .sort((a, b)=>b.total_views - a.total_views)
  .slice(0, 10);

  const topLikedCategories = [...data.categories]
  .sort((a, b)=>b.total_likes - a.total_likes)
  .slice(0, 10);


  return (
    <div className='bg-sky-100 p-8 rounded-xl h-screen overflow-auto'>
      <h1 className="text-3xl font-bold text-center text-sky-800">Thống kê Tài liệu</h1>
      <h2 className=" text-center text-sky-800 mb-5">(Dựa trên các tài liệu được đăng public)</h2>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className='bg-white p-4 rounded-xl shadow col-span-1 md:col-span-2'>
          <h2 className="text-lg font-semibold mb-2 text-sky-600">Top 10 tài liệu được xem nhiều nhất</h2>
          <CustomBarChart data={topViewedMaterials} dataKeyValue='total_views' dataKeyLabel='material_title' />
        </div>

        <div className='bg-white p-4 rounded-xl shadow col-span-1 md:col-span-2'>
          <h2 className="text-lg font-semibold mb-2 text-sky-600">Top 10 tài liệu được thích nhiều nhất</h2>
          <CustomBarChart data={topLikedMaterials} dataKeyValue='total_likes' dataKeyLabel='material_title' />
        </div>

        <div className='bg-white p-4 rounded-xl shadow col-span-1 md:col-span-2'>
          <h2 className="text-lg font-semibold mb-2 text-sky-600">Top 10 danh mục được xem nhiều nhất</h2>
          <CustomBarChart data={topLikedCategories} dataKeyValue='total_views' dataKeyLabel='name' />
        </div>

        <div className='bg-white p-4 rounded-xl shadow col-span-1 md:col-span-2'>
          <h2 className="text-lg font-semibold mb-2 text-sky-600">Top 10 danh mục được thích nhiều nhất</h2>
          <CustomBarChart data={topLikedCategories} dataKeyValue='total_likes' dataKeyLabel='name' />
        </div>


        <div className='bg-white p-4 rounded-xl shadow'>
          <h2 className="text-lg font-semibold mb-2 text-sky-600">Tài liệu theo chuyên mục</h2>
          <CustomPieChart data={data.categories} dataKey='total_materials' nameKey='name' color={COLORS} innerRadius={40}/>
        </div>

        <div className='bg-white p-4 rounded-xl shadow'>
          <h2 className="text-lg font-semibold mb-2 text-sky-600">Tài liệu theo định dạng</h2>
          <CustomPieChart data={data.filetypes} dataKey='total_materials' nameKey='name' color={COLORS} innerRadius={40}/>
        </div>





      </div>
    </div>
  );
};

export default AdminStatisticsPage;
