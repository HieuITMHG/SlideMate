const Report = require("../../models/Report");


const controller = async (req, res) =>{
    try{
        res.json({ message: "ok" , "data":[]});
    }catch(err){
        console.error("error:", err);
        res.status(500).json({ message: err });
    }
};

const getAllReports = async (req, res) =>{
    try{
        res.json({ message: "ok" , "data":[]});
    }catch(err){
        console.error("error:", err);
        res.status(500).json({ message: err });
    }
};

module.exports = {getAllReports};