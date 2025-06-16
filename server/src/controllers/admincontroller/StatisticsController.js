

const getStatistic = async (req, res) =>{
    try{
        res.json({ message: "ok" , "data":[]});
    }catch(err){
        console.error("error:", err);
        res.status(500).json({ message: err });
    }
};

module.exports = {getStatistic};