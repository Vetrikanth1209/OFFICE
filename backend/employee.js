const mongoose = require('mongoose')

var departmentSchema=new mongoose.Schema({
    
dept_id:{type:Number},
dept_full_name:{type:String},
dept_short_name:{type:String},
spl_id:{type:Number},
})

const department = mongoose.model('department',departmentSchema)
module.exports=department