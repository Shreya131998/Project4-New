const express = require('express');
const router = express.Router();
const {createUrl}=require("../controller/url")
const {getUrl}=require("../controller/redirect")

router.post("/url/shorten",createUrl)
router.get("/:urlCode",getUrl)






module.exports = router;