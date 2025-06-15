import { useEffect, useState, useRef } from "react";
import { getMaterialsByCategory } from "../apis/materialApis";
import MaterialCard from "../components/MaterialCard";
import Footer from "../components/Footer";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Home = () => {
  const [showFilter, setShowFilter] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [materialsByCategory, setMaterialsByCategory] = useState([]);
  const lst_category = ["Technology", "Literature", "Biology"];
  const scrollRefs = useRef([]);

  // Fetch materials and thumbnails
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const updatedMaterials = [];
        for (const category of lst_category) {
          const response = await getMaterialsByCategory(category);
          updatedMaterials.push({
            category: response.category || category,
            materials: response.materials || [],
          });
        }
        setMaterialsByCategory(updatedMaterials);
        setIsLoading(false);
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
        setShowFilter(false);
      } else if (currentScrollY < lastScrollY) {
        setShowFilter(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Hàm xử lý cuộn trái
  const scrollLeft = (index) => {
    const container = scrollRefs.current[index];
    if (container) {
      container.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  // Hàm xử lý cuộn phải
  const scrollRight = (index) => {
    const container = scrollRefs.current[index];
    if (container) {
      container.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  } else {
    return (
      <div className="min-h-screen bg-white">
        {/* Filter */}
        <div
          className={`transition-all duration-300 sticky top-0 w-full h-16 bg-gray-800 z-10 ${
            showFilter ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
          }`}
        />

        {/* Materials by Category */}
        {materialsByCategory.length > 0 ? (
          materialsByCategory.map(({ category, materials }, catIndex) => (
            <div key={category} className="px-4 py-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{category}</h2>
              <div className="relative flex items-center">
                {/* Nút cuộn trái */}
                <button
                  onClick={() => scrollLeft(catIndex)}
                  className="absolute left-0 z-10 p-2 h-full bg-transparent group cursor-pointer"
                  aria-label="Scroll left"
                >
                  <FaChevronLeft className="text-gray-400 text-2xl group-hover:text-black transition-colors duration-200" />
                </button>


                {/* Container cuộn ngang */}
                <div
                  ref={(el) => (scrollRefs.current[catIndex] = el)}
                  className="overflow-x-auto scrollbar-hide flex-1"
                  style={{ scrollBehavior: "smooth" }}
                >
                  <div className="flex flex-shrink-0 gap-9">
                    {materials.length > 0 ? (
                      materials.map((material, index) => (
                        <div
                          key={material.id || `material-${index}`}
                        >
                          <MaterialCard material={material} />
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 w-full">No materials found for {category}</p>
                    )}
                  </div>
                </div>

                {/* Nút cuộn phải */}
                <button
                  onClick={() => scrollRight(catIndex)}
                  className="absolute right-0 z-10 p-2 h-full bg-transparent group cursor-pointer"
                  aria-label="Scroll right"
                >
                  <FaChevronRight className="text-gray-400 text-2xl group-hover:text-black transition-colors duration-200"/>
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No categories loaded.</p>
        )}
        <Footer />
      </div>
    );
  }
};

export default Home;