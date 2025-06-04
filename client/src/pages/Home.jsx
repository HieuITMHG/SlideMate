import { useEffect, useState } from "react";
import banner from "@imgs/banner.jpg";
import { getMaterialsByCategory } from "../apis/materialApis";
import axios from "axios";
const Home = () => {
  const [showFilter, setShowFilter] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [materialsByCategory, setMaterialsByCategory] = useState({});
  const lst_category = ["Technology"];

  // Fetch materials and thumbnails
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/materials/category/Technology");
        console.log("Response from /api/materials/Technology:", res.data);

        // Update materialsByCategory with the response
        setMaterialsByCategory({
          Technology: res.data.materials || [], // Use the materials array from the response
        });
      } catch (error) {
        console.error("Error fetching materials:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
    };

    fetchMaterials();
  }, []);

  // Scroll handler for filter visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        setShowFilter(false); // Scroll down
      } else if (currentScrollY < lastScrollY) {
        setShowFilter(true); // Scroll up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      {/* Filter */}
      <div
        className={`transition-all duration-300 sticky top-18 w-full h-16 bg-gray-800 z-50 ${
          showFilter ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
        }`}
      />

      {/* Banner */}
      <div
        className="w-full h-[300px] bg-cover bg-center"
        style={{ backgroundImage: `url(${banner})` }}
      />

      {/* Materials by Category */}
      {lst_category.map((category) => (
        <div key={category} className="px-4 py-6">
          <h2 className="text-2xl font-bold mb-4">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {materialsByCategory[category]?.length > 0 ? (
              materialsByCategory[category].map((material) => (
                <div
                  key={material.id}
                  className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      {material.thumbnailUrl ? (
                      <img
                        src={material.thumbnailUrl}
                        alt={material.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500">No Thumbnail</span>
                    )}
                  </div>
                  {/* Title and View Count */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold truncate">
                      {material.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Views: {material.total_view || 0}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No materials found for {category}</p>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

export default Home;