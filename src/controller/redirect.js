const validUrl=require("valid-url")
const urlModel=require("../model/urlModel")
const shortid=require("shortid")


const getUrl=async function(req,res){
    try{
    
        let {urlCode}=req.params 
        let url =await urlModel.findOne({urlCode:urlCode})
        console.log(url)
        if(!url){
            
            
            return res.status(404).send({status:false,message:"urlCode not found"})
        }
        else{
            return res.status(200).send(url.longUrl)
        }

    }
    catch(err){
        return res.status(500).send({status:false,message:err.message})
        
    }
}

module.exports={getUrl}