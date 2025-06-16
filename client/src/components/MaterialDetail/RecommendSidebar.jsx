const RecommendSidebar = () => {
    return(
    <div className="w-72 p-4 border-l border-gray-200 bg-white overflow-y-auto max-h-[calc(100vh-120px)] shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Gợi ý tài liệu</h3>
        <ul className="list-none p-0 text-gray-600">
        <li className="mb-2">Tài liệu 1</li>
        <li className="mb-2">Tài liệu 2</li>
        <li className="mb-2">Tài liệu 3</li>
        </ul>
    </div>
    )
};

export default RecommendSidebar;