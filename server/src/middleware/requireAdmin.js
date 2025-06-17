const AdminService = require("../services/adminService");
const requireAdmin= async (req, res, next) =>{
    try{
        if (! req?.user?.id)
            res.status(500).json({ message: 'No token provided '});
        const admin = await AdminService.getAdminByAccountId({account_id:req.user.id});
        if (!admin)
            res.status(401).json({ message: 'Bạn không có quyền Admin'});
        req.admin = {id:admin._id};
        next();
    }catch (error){
        res.status(401).json({ message: 'Bạn không có quyền Admin' });
    }
}

module.exports = requireAdmin;