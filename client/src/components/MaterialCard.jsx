import { Link } from "react-router-dom";
import { FileType } from "../enums";
import { FaHeart, FaBookmark } from "react-icons/fa";

const MaterialCard = ({ material }) => {
    const formatViews = (views) => {
        if (views >= 1_000_000) return (views / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (views >= 1_000) return (views / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
        return views.toString();
    };
    return (
        <div className="w-96 h-80 p-2.5 bg-white rounded-md overflow-hidden">
            <div className="relative w-full h-2/3 rounded-xl overflow-hidden group">
                <Link
                    to={`/material/${material.id}`}
                    className="block w-full h-full bg-gray-200 flex justify-center items-center"
                >
                    <img
                        src={material.thumbnail_path}
                        alt="thumbnail"
                        className={`
                            transition-all duration-300 
                            ${material.file_type === FileType.PPT ? "w-full" : "h-full"} 
                            group-hover:brightness-75
                            group-hover:scale-105
                        `}
                    />
                </Link>

                {/* Nút tim - góc trên bên phải */}
                <button
                    className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center cursor-pointer
                            bg-black/70 text-white border border-white rounded-full opacity-0 
                            group-hover:opacity-100 transition-all duration-300 z-20 hover:scale-110 shadow-md"
                >
                    <FaHeart className="text-lg hover:text-red-500" />
                </button>

                {/* Nút lưu - góc dưới bên phải */}
                <button
                    className="absolute bottom-2 right-2 w-9 h-9 flex items-center justify-center cursor-pointer
                            bg-black/70 text-white border border-white rounded-full opacity-0 
                            group-hover:opacity-100 transition-all duration-300 z-20 hover:scale-110 shadow-md"
                >
                    <FaBookmark className="text-lg hover:text-yellow-400" />
                </button>
            </div>

            <div className="mt-2.5">
                <Link to={`/material/${material._id}`}>
                    <p className="font-bold text-2xl line-clamp-2">{material.title}</p>
                </Link>
            </div>

            <Link to={`/user/${material.user._id}`} className="hover:underline font-semibold text-[#00809D]">
                <p>{material.user.username}</p>
            </Link>
            <p className="text-gray-600 text-sm">
                {material.total_pages} slides &nbsp;&middot;&nbsp; {formatViews(material.total_views)} views
            </p>
        </div>
    );
};

export default MaterialCard;
