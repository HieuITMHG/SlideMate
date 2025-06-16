const Report = require("../../models/Report");




const getAllPendingReports = async (req, res) =>{
    try{
        const selectAll = await Report.find({status:"PENDING"})
            .populate({path:"material_id", populate:{path:"user_id"}})
        
        ;
        const reports = selectAll.filter((r)=>(r.material_id && r.material_id.user_id));

        const groupByMaterial = reports.reduce((grouped, report)=>{
            const key = report.material_id._id;
            if (! grouped[key]){
                grouped[key] = {
                    material_id: report.material_id._id,
                    material_title: report.material_id.title,
                    material_pdf_url: report.material_id.pdf_version_path,
                    material_thumnail_url: report.material_id.thumbnail_path,
                    material_owner_id:report.material_id.user_id._id,
                    reports: []
                };
            }
            grouped[key].reports.push({
                reporter_id: report.user_id,
                report_at: report.createdAt,
                report_content: report.report_content,
                report_id: report._id
            });
            
            return grouped;
        }, {})

        const data = Object.values(groupByMaterial);
        res.json({ message: "ok" , "data":data});
    }catch(err){
        console.error("error:", err);
        res.status(500).json({ message: err.message });
    }
};

const getAllHandledReports = async (req, res) =>{
    try{
        const selectAll = await Report.find({status: "HANDLED"});

        const data = selectAll;
        res.json({ message: "ok" , "data":data});
    }catch(err){
        console.error("error:", err);
        res.status(500).json({ message: err.message });
    }
};

const handleAllReportOfMaterial = async (req, res) =>{
    try{
        // const {material_id, is_delete_material, is_ban_account} = req.body;
        res.json({ message: "ok" , "data":[]});
    }catch(err){
        console.error("error:", err);
        res.status(500).json({ message: err.message });
    }
};


module.exports = {getAllPendingReports, getAllHandledReports, handleAllReportOfMaterial};