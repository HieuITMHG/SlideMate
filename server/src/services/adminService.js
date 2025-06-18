const Account = require("../models/Account");
const Role = require("../models/Role");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Material = require("../models/Material");
const Category = require("../models/Category");
const Report = require("../models/Report");
const FileType = require("../models/FileType");
const ListMaterial = require("../models/ListMaterial");
const Like = require("../models/Like");
const MaterialTag = require("../models/MaterialTag");

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

    static async deleteMaterial({ material_id }) {
        // check
        const material = await Material.findOne({ _id: material_id });
        if (!material)
            throw new Error("material id không tồn tại!");

        // delete List-Material
        await ListMaterial.deleteMany(
            { material_id: material_id }
        );

        // delete Like
        await Like.deleteMany(
            { material_id: material_id }
        );

        // delete Material-Tag
        await MaterialTag.deleteMany(
            { material_id: material_id }
        );

        // delete Material 
        await Material.deleteOne(
            { _id: material_id }
        );
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
        const selectAll = await Report
            .find({ status: "HANDLED" })
            .populate({ path: "material_id", populate: { path: "user_id" } })
            ;
        const reportMapped = selectAll.map((r) => (
            {
                report_id: r._id,
                material_id: r?.material_id?._id || null,
                material_title: r?.material_id?.title || null,
                material_owner_id: r?.material_id?.user_id?._id || null,
                report_content: r.report_content,
                admin_id: r.admin_id,
                is_delete_material: r.is_delete_material,
                is_ban_account: r.is_ban_account,
                report_at: r.createdAt,
                handle_at: r.updatedAt
            }
        ));
        return reportMapped;
    }

    static async handleAllReportsOfMaterial({ material_id, admin_id, material_owner_id, is_delete_material, is_deactivate_account }) {


        if (is_deactivate_account) {
            await AdminService.deactivateUser({ user_id: material_owner_id });
        }

        if (is_delete_material) {
            await AdminService.deleteMaterial({ material_id: material_id });
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

    static async selectOveriewData() {
        // this month
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // user
        const usersNotFiltered = await User.find().populate({ path: 'account' });
        const users = usersNotFiltered.filter((u)=>(u.account));
        
        // material & categories & report
        const publicMaterialsNotFiltered = await Material
            .find({ is_active: true, visibility: "PUBLIC" })
            .populate("user_id")
            .populate("category_id")
            .populate("file_type_id");
        const publicMaterials = publicMaterialsNotFiltered.filter((m) => (m.user_id && m.category_id && m.file_type_id));
        const categories = await Category.find();
        const reports = await AdminService.selectAllPendingReportsGroupByMaterial();
        

        const thisMonthMaterialCount = publicMaterials.filter((m) => (new Date(m.createdAt) > thisMonth)).length;
        const numOfUsers = users.length;
        const numOfActiveUsers = users.filter((u) => (u.account.is_active)).length;
        const numOfNewUsers = users.filter((u) => (new Date(u.account.createdAt) >= thisMonth)).length;
        return [

            {
                name: "Tổng số người dùng",
                value: numOfUsers
            },
            {
                name: "Số người dùng bị khóa tài khoản",
                value: numOfUsers - numOfActiveUsers
            },
            {
                name: "Số người dùng đăng ký mới trong tháng này",
                value: numOfNewUsers
            },
            {
                name: "Số tài liệu trên hệ thống(public)",
                value: publicMaterials.length
            },

            {
                name: "Số tài liệu được tải lên trong tháng này(public)",
                value: thisMonthMaterialCount
            },
            {
                name: "Số danh mục tài liệu",
                value: categories.length
            },
            {
                name: "Số tố cáo cần giaỉ quyết",
                value: reports.length
            },
        ]
    }

    static async selectStatisticsData() {
        const allMaterials = await Material
            .find(
                { is_active: true, visibility: "PUBLIC" }
                , {
                    title: 1,
                    description: 1,
                    user_id: 1,
                    total_views: 1,
                    total_likes: 1,
                    createdAt: 1,
                    pdf_version_path: 1,
                    thumbnail_path: 1
                }
            )
            .populate({ path: "category_id", select: "category_name" })
            .populate({ path: "file_type_id", select: "type_name" })
            .populate({ path: "user_id", select: "account firstname lastname", populate: { path: "account", select: "username" } });
        const materialsFiltered = allMaterials.filter(
            (m) => (m.category_id && m.file_type_id && m.user_id && m.user_id.account));

        const materialMapped = materialsFiltered.map(
            (m) => ({
                material_id: m._id,
                material_title: m.title,
                material_description: m.description,
                material_thumnail_path: m.thumbnail_path,
                material_pdf_path: m.pdf_version_path,
                material_owner_id: m.user_id._id,
                material_owner_name:
                    (m.user_id.first_name && m.user_id.last_name)
                        ? (m.user_id.first_name + m.user_id.last_name)
                        : (m.user_id.account.username ? m.user_id.account.username : ""),
                total_views: m.total_views,
                total_likes: m.total_likes,
                category_name: m.category_id.category_name,
                file_type: m.file_type_id.type_name,
                created_at: m.createdAt
            })
        );

        const allCategories = await Category.find();
        const allFileTypes = await FileType.find();

        const categories = allCategories.reduce(
            (cat, element) => {
                const key = element.category_name;
                cat[key] = {
                    name: key,
                    total_materials: 0,
                    total_views: 0,
                    total_likes: 0
                };
                return cat;
            }, {}
        );
        // const categories = {};
        const filetypes = allFileTypes.reduce(
            (type, element) => {
                const key = element.type_name;
                type[key] = {
                    name: key,
                    total_materials: 0,
                    total_views: 0,
                    total_likes: 0
                }
                return type;
            }, {}
        );
        materialMapped.forEach(element => {
            // categories
            const catKey = element.category_name;
            categories[catKey].total_materials += 1;
            categories[catKey].total_views += element.total_views;
            categories[catKey].total_likes += element.total_likes;
            //file_types
            const typeKey = element.file_type;
            filetypes[typeKey].total_materials += 1;
            filetypes[typeKey].total_views += element.total_views;
            filetypes[typeKey].total_likes += element.total_likes;

        });
        // return allMaterials;
        // return materialsFiltered;
        return {
            materials: materialMapped,
            categories: Object.values(categories),
            filetypes: Object.values(filetypes)
        }
    }
}

module.exports = AdminService;