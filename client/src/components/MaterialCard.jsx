import { Link } from "react-router-dom";
import {FileType} from "../enums";

const MaterialCard = ({ material }) => {
    console.log(material);
    return (
        <div className="w-96 h-80 p-2.5 bg-white rounded-md overflow-hidden">
            <Link to={`/material/${material.id}`} className="w-full h-2/3 bg-gray-200 flex justify-center items-center rounded-xl overflow-hidden group">
                <img
                    src={material.thumbnail_path}
                    alt="thumbnail"
                    className={`
                        transition-transform duration-300 
                        ${material.file_type === FileType.PPT ? "w-full" : "h-full"} 
                        group-hover:scale-105
                    `}
                />
            </Link>

            <div className="mt-2.5">
                <Link to={`/material/${material._id}`}>
                    <p className="font-bold text-2xl line-clamp-2">{material.title}</p>
                </Link>
            </div>

            <Link to={`/user/${material.user._id}`} className="hover:underline font-semibold text-[#00809D]">
                <p>{material.user.username}</p>
            </Link>
            <p>{material.likes}</p>
        </div>
    );
};

export default MaterialCard;
