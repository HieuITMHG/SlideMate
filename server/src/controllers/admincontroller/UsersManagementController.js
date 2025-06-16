const User = require("../../models/User");
const Account = require("../../models/Account");
const Material = require("../../models/Material");
const Printer = require("../../utils/debugPrinter");
const getAllUser = async (req, res) => {
  try {
    const users = await User.find().populate({path:'account', populate:{path:'role'}});

    const filtered = users
        .filter((u)=>(u.account))
        .map((u)=>({
            user_id: u._id,
            first_name: (u.first_name)?u.first_name:"",
            last_name: (u.last_name)?u.last_name:"",
            email: (u.account.email)?u.account.email:"",
            is_active: u.account.is_active,
            role: u.account.role.role_name
        }));
    res.json({ message: "ok" , "data":filtered});
  } catch (err) {
    console.error("error:", err);
    res.status(500).json({ message: err });
  }
};

const activateUser = async (req, res) =>{
    try{
        const user_id = req.params.id;
        Printer.notify("call api activate user id:", user_id);
        
        
        const user = await User.findById(user_id);

        // update
        await Account.updateOne({_id:user.account._id}, {$set:{is_active:true}});
        const numOfMaterialEffected = await Material.updateMany({ user_id: user_id }, { $set: { is_active: true } });
        Printer.notify("So luong tai lieu bi anh huongw: ", numOfMaterialEffected);
        res.json({ message: "ok" , "data":[]});
    }catch(err){
        console.error("error:", err);
        res.status(500).json({ message: err });
    }
};

const deactivateUser = async (req, res) =>{
    try{
        const user_id = req.params.id;
        Printer.notify("call api deactivate user id:", user_id);

        //update 
        const user = await User.findById(user_id);
        await Account.updateOne({_id:user.account._id}, {$set:{is_active:false}});

        const numOfMaterialEffected = await Material.updateMany({ user_id: user_id }, { $set: { is_active: false } });
        Printer.notify("So luong tai lieu bi anh huongw: ", numOfMaterialEffected);
        res.json({ message: "ok" , "data":[]});
    }catch(err){
        Printer.error("error:", err);
        res.status(500).json({ message: err });
    }
};

module.exports = {getAllUser, deactivateUser, activateUser};