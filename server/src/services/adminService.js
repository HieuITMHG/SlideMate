const Account = require("../models/Account");
const Role = require("../models/Role");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Material = require("../models/Material");
const Category = require("../models/Category");
const Report = require("../models/Report");

class AdminService {

    /*
    --------------------------------------------------
                UTITLITIES METHODS
    --------------------------------------------------
    */
    static async getAdminByAccountId({ account_id }) {
        const account = await Account
            .findOne({ _id: account_id })
            .populate({ path: 'role' });

        if (!account || account.role?.role_name !== 'Admin') {
            return null;
        }

        const admin = await Admin.findOne({ account: account._id });
        return admin;
    }


    /*
    --------------------------------------------------
            USERS MANAGEMENT
    --------------------------------------------------
    */
    static async selectAllUsers() {
        const users = await User.find().populate({ path: 'account' });

        const filtered = users
            .filter((u) => (u.account))
            .map((u) => ({
                user_id: u._id,
                first_name: (u.first_name) ? u.first_name : "",
                last_name: (u.last_name) ? u.last_name : "",
                email: (u.account.email) ? u.account.email : "",
                is_active: u.account.is_active,
            }));

        return filtered;
    };

    static async deactivateUser({ user_id }) {
        const user = await User.findById(user_id);

        await Account.updateOne(
            { _id: user.account._id },
            { $set: { is_active: false } }
        );

        const result = await Material.updateMany(
            { user_id: user_id },
            { $set: { is_active: false } }
        );
        return result;
    }

    static async activateUser({ user_id }) {
        const user = await User.findById(user_id);
        await Account.updateOne(
            { _id: user.account._id },
            { $set: { is_active: true } }
        );
        const result = await Material.updateMany(
            { user_id: user_id },
            { $set: { is_active: true } }
        );
        return result;
    }


    /*
    --------------------------------------------------
            CATEGORIES MANAGEMENT
    --------------------------------------------------
    */
    static async selectAllCategories() {
        const categories = await Category.find();
        const data = categories.map(c => ({
            id: c._id,
            name: c.category_name
        }));
        return data;
    };

    static async createNewCategory({ name }) {
        const checkNameExist = await Category.findOne({ category_name: name });
        if (checkNameExist)
            throw new Error("Tên danh mục đã tồn tại!");
        const newCategory = await Category.create({ category_name: name });
        return newCategory;
    }


    static async renameCategory({ category_id, new_name }) {

        const category = await Category.findById(category_id);
        if (new_name == category.category_name)
            throw new Error("Tên danh mục không hề thay đổi!");

        const checkNameExists = await Category.findOne({ category_name: new_name });
        if (checkNameExists)
            throw new Error("Tên danh mục đã tồn tại!");

        await Category.updateOne(
            { _id: category_id },
            { $set: { category_name: new_name } }
        );
    }


    /*
    --------------------------------------------------
            REPORTS MANAGEMENT
    --------------------------------------------------
    */

    static async selectAllPendingReportsGroupByMaterial() {
        const selectAll = await Report
            .find({ status: "PENDING" })
            .populate(
                {
                    path: "material_id",
                    populate: { path: "user_id" }
                }
            );

        // make sure material & reporter != null
        const reports = selectAll.filter(
            (r) => (r.material_id && r.material_id.user_id)
        );

        // group by material
        const groupByMaterial = reports.reduce(
            (grouped, report) => {
                const key = report.material_id._id;
                if (!grouped[key]) {
                    grouped[key] = {
                        material_id: report.material_id._id,
                        material_title: report.material_id.title,
                        material_pdf_url: report.material_id.pdf_version_path,
                        material_thumnail_url: report.material_id.thumbnail_path,
                        material_owner_id: report.material_id.user_id._id,
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

        return Object.values(groupByMaterial);
    }

    static async selectAllHandledReports() {
        const selectAll = await Report.find({ status: "HANDLED" });
        return selectAll;
    }

    static async handleAllReportsOfMaterial({ material_id, admin_id, material_owner_id, is_delete_material, is_deactivate_account }) {


        if (is_deactivate_account) {
            await AdminService.deactivateUser({ user_id: material_owner_id });
        }

        if (is_delete_material) {
            await Material.deleteOne({ _id: material_id });
        }

        await Report.updateMany(
            { material_id: material_id },
            {
                $set:
                {
                    status: "HANDLED",
                    admin_id: admin_id,
                    is_delete_material: is_delete_material,
                    is_ban_account: is_deactivate_account
                }
            }
        );
    }

    /*
    --------------------------------------------------
            STATISTICS
    --------------------------------------------------
    */

    static async selectStatisticsData() {

    }
}

module.exports = AdminService;