const validUrl=require("valid-url")
const urlModel=require("../model/urlModel")
const shortid=require("shortid")


const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
  };
  const isValidRequestBody = function (body) {
    return Object.keys(body).length > 0;
  };
  

const baseUrl='http://localhost:4000'
const createUrl=async function(req,res){
    try{

    let body=req.body  
    if(!isValidRequestBody(body)){
        return res.status(400).send({status:false,message:"Please provide details"})
    } 

    const {longUrl}=req.body 
    if(!isValid(longUrl)){
        return res.status(400).send({status:false,message:"Please provide longUrl"})
    }
    longUrl.toLowerCase()
    if(!validUrl.isUri(longUrl)){
        return res.status(400).send({status:false,message:"Invalid longUrl"})
    }
    let url=await urlModel.findOne({longUrl:longUrl})
    if(url){
        return res.status(400).send({status:false,message:"Url already registered"})
    }
    if(!validUrl.isUri(baseUrl)){
        return res.status(400).send({status:false,message:"Invalid base URL"})
    }
    const urlCode=shortid.generate()
    urlCode.toLowerCase()
    console.log(urlCode)
    const uniqueUrlCode=await urlModel.findOne({urlCode:urlCode})
    if(uniqueUrlCode){
        return res.status(400).send({status:false,message:"urlCode already registered"})
    }
    
    const shortUrl=baseUrl+'/'+urlCode
    const validShortUrl=await urlModel.findOne({shortUrl:shortUrl})
    if(validShortUrl){
        return res.status(400).send({status:false,message:"Short Url is already registered"})
    }
    body.shortUrl=shortUrl
    body.urlCode=urlCode
    let data=await urlModel.create(body)
    return res.status(201).send({status:true,message:"created Successfully",data:data})

    }
    catch(err){
        return res.status(500).send({status:false,message:err.message})
    }

}



module.exports={createUrl}