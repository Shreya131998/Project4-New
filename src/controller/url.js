const validUrl=require("valid-url")
const urlModel=require("../model/urlModel")
const shortid=require("shortid")



const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
  14106,
  "redis-14106.c245.us-east-1-3.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("au7aJhYZ51gLOEiCRSR0UNqWvtyauhVq", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

 const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
 const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



const isValid = function (value) {
    if (typeof value == "undefined" || value == null) return false;
    if (typeof value == "string" && value.trim().length == 0) return false;
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
    
    longUrl.toLowerCase().trim()
    if(!validUrl.isUri(longUrl)){
        return res.status(400).send({status:false,message:"Invalid longUrl"})
    }
    
    if(!validUrl.isUri(baseUrl)){
        return res.status(400).send({status:false,message:"Invalid base URL"})
    }
    const urlCode=shortid.generate()
    
    
    const uniqueUrlCode=await urlModel.findOne({urlCode:urlCode})
    if(uniqueUrlCode){
        return res.status(400).send({status:false,message:"urlCode already registered"})
    }
    
    const shortUrl=baseUrl+'/'+urlCode.toLowerCase()
    const validShortUrl=await urlModel.findOne({shortUrl:shortUrl})
    if(validShortUrl){
        return res.status(400).send({status:false,message:"Short Url is already registered"})
    }
    body.shortUrl=shortUrl
    body.urlCode=urlCode
    await SET_ASYNC(`${urlCode}`,longUrl)
    let data=await urlModel.create(body)
    return res.status(201).send({status:true,message:"created Successfully",data:data})

    }
    catch(err){
        return res.status(500).send({status:false,message:err.message})
    }

}

const getUrl=async function(req,res){
    try{
        if(Object.keys(req.query).length>0){
            return res.status(400).send({status:false,message:"Filtering not allowed"})
        }
    
        let {urlCode}=req.params 
        let cachedData=await GET_ASYNC(`${urlCode}`)
        if(cachedData){
            return res.status(302).redirect(cachedData)
        }
        let url =await urlModel.findOne({urlCode:urlCode})
        console.log(url)
        if(!url){
            
            
            return res.status(404).send({status:false,message:"urlCode not found"})
        }
        else{
            return res.status(302).redirect(url.longUrl)
        }

    }
    catch(err){
        return res.status(500).send({status:false,message:err.message})
        
    }
}



module.exports={createUrl,getUrl}