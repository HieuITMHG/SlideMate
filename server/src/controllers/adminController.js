const AdminService = require("../services/adminService");

class AdminController {
    static async template(req, res) {
        try {
            res.json({ message: "ok", data: [] });
        } catch (error) {
            console.error("error:", error);
            res.status(500).json({ message: error.message });
        }
    }

    /*----------------------------------------------------
                    CHECK AUTH 
    -----------------------------------------------------*/
    static async checkAuth(req, res) {
        try {
            if(! req?.user?.id)
                res.status(500).json({ message: "Không tìm thấy token"});
            const admin = await AdminService.getAdminByAccountId({ account_id: req.user.id });
            if (!admin) {
                throw new Error("Bạn không có quyền Admin!");
            }
            res.json({ message: "ok", data: []});
        } catch (error) {
            console.error("error:", error);
            res.status(500).json({ message: "Bạn không có quyền Admin!" + error.message});
        }
    }

    /*----------------------------------------------------
                    USERS 
    -----------------------------------------------------*/
    static async getAllUsers(req, res) {
        try {
            const users = await AdminService.selectAllUsers();
            res.json({ message: "ok", data: users });
        } catch (error) {
            console.error("error:", error);
            res.status(500).json({ message: error.message });
        }
    }

    static async activateUser(req, res) {
        try {
            const user_id = req.params.id;
            await AdminService.activateUser({ user_id: user_id });
            res.json({ message: "ok", data: [] });
        } catch (error) {
            console.error("error:", error);
            res.status(500).json({ message: error.message });
        }
    }

    static async deactivateUser(req, res) {
        try {
            const user_id = req.params.id;
            await AdminService.deactivateUser({ user_id: user_id });
            res.json({ message: "ok", data: [] });
        } catch (error) {
            console.error("error:", error);
            res.status(500).json({ message: error.message });
        }
    }

    /*----------------------------------------------------
                    CATEGORIES
    -----------------------------------------------------*/
    static async getAllCategories(req, res) {
        try {
            const categories = await AdminService.selectAllCategories();
            res.json({ message: "ok", data: categories });
        } catch (error) {
            console.error("error:", error);
            res.status(500).json({ message: error.message });
        }
    }

    static async createNewCategory(req, res) {
        try {
            const name = req.body.name;
            await AdminService.createNewCategory({ name: name });
            res.json({ message: "ok", data: [] });
        } catch (error) {
            console.error("error:", error);
            res.status(500).json({ message: error.message });
        }
    }

    static async renameCategory(req, res) {
        try {
            const { id, new_name } = req.body;
            await AdminService.renameCategory({ category_id: id, new_name: new_name });
            res.json({ message: "ok", data: [] });
        } catch (error) {
            console.error("error:", error);
            res.status(500).json({ message: error.message });
        }
    }

    /*----------------------------------------------------
                    REPORTS
    -----------------------------------------------------*/
    static async getAllPendingReportGroupByMaterial(req, res) {
        try {
            const reports = await AdminService.selectAllPendingReportsGroupByMaterial();
            res.json({ message: "ok", data: reports });
        } catch (error) {
            console.error("error:", error);
            res.status(500).json({ message: error.message });
        }
    }

    static async getAllHandledReports(req, res) {
        try {
            const reports = await AdminService.selectAllHandledReports();
            res.json({ message: "ok", data: reports });
        } catch (error) {
            console.error("error:", error);
            res.status(500).json({ message: error.message });
        }
    }

    static async handleAllReportsOfMaterial(req, res) {
        try {
            const { material_id, owner_id, is_delete_material, is_ban_account } = req.body;
            if (!req.user.id)
                throw new Error("Không tìm thấy token của admin!");

            const admin = await AdminService.getAdminByAccountId({ account_id: req.user.id });

            if (!admin) {
                throw new Error("Bạn không có quyền admin!");
            }

            await AdminService.handleAllReportsOfMaterial(
                {
                    material_id: material_id,
                    admin_id: admin._id,
                    material_owner_id: owner_id,
                    is_delete_material: is_delete_material,
                    is_deactivate_account: is_ban_account
                }
            );
            res.json({ message: "ok", data: [] });
        } catch (error) {
            console.error("error:", error);
            res.status(500).json({ message: error.message });
        }
    }

    /*----------------------------------------------------
                    STATISTICS
    -----------------------------------------------------*/
    static async getOverviewData(req, res){
        try {
            const data = await AdminService.selectOveriewData();
            res.json({ message: "ok", data: data });
        } catch (error) {
            console.error("error:", error);
            res.status(500).json({ message: error.message });
        }
    }
    static async getStatisticsData(req, res) {
        try {
            const data = await AdminService.selectStatisticsData();
            res.json({ message: "ok", data: data });
        } catch (error) {
            console.error("error:", error);
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = AdminController;