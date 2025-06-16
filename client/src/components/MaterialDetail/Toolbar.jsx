const Toolbar = ({ onSave, onLike, onDownload, onReport, isSaved, isLiked }) => {
    return (
    <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="space-x-4">
        <button
            onClick={onDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
            📥 Download
        </button>
        <button
            onClick={onReport}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
        >
            ⚠️ Report
        </button>
        </div>
        <div className="space-x-4">
        <button
            onClick={onSave}
            className={`px-4 py-2 border border-blue-600 rounded-md transition-colors duration-200 ${
            isSaved
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-transparent text-blue-600 hover:bg-blue-100'
            }`}
        >
            💾 Lưu
        </button>
        <button
            onClick={onLike}
            className={`px-4 py-2 border border-red-600 rounded-md transition-colors duration-200 ${
            isLiked
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-transparent text-red-600 hover:bg-red-100'
            }`}
        >
            ❤️ Thích
        </button>
        </div>
    </div>
  )
};

export default Toolbar;