const ViewMaterial = ({ fileId }) => {
  const fileUrl = `http://localhost:3000/drive/view/${fileId}`;

  return (
    <div className="pdf-container" style={{ height: '90vh' }}>
      <iframe
        src={fileUrl}
        title="Google Drive PDF"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default ViewMaterial;
