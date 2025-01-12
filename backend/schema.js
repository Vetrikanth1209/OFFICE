const mongoose = require('mongoose');

// DEPARTMENT SCHEMA
var departmentSchema = new mongoose.Schema({
    dept_id: { type: Number },
    dept_full_name: { type: String },
    dept_short_name: { type: String },
    spl_id: { type: Number },
});
const department = mongoose.model('department', departmentSchema);

// VEHICLE SCHEMA
var vehicleSchema = new mongoose.Schema({
    vehicle_id: { type: Number },
    vehicle_name: { type: String },
    vehicle_nmber: { type: String },
    vehicle_reg_number: { type: String },
    spl_id: { type: Number },
});
const vehicle = mongoose.model('vehicle', vehicleSchema);

// EMPLOYEE SCHEMA
var employeeSchema = new mongoose.Schema({
    emp_id: { type: Number },
    emp_name: { type: String },
    emp_status: { type: String },
});
const employee = mongoose.model('employee', employeeSchema);

// FY_YEAR SCHEMA
var fy_yearSchema = new mongoose.Schema({
    fy_id: { type: Boolean },
    fy_name: { type: Number },
});
const fy_year = mongoose.model('fy_year', fy_yearSchema);

// HEAD CAT SCHEMA
var head_catSchema = new mongoose.Schema({
    head_cat_id: { type: Number },
    head_cat_name: { type: String },
    head_cat_status: { type: Boolean }
});
const head_cat = mongoose.model('head_cat', head_catSchema);

// SUB CAT SCHEMA
var sub_catSchema = new mongoose.Schema({
    sub_cat_id: { type: Number },
    head_cat_id: { type: Number },
    spl_id: { type: Number },
    sub_cat_name: { type: String },
    sub_cat_status: { type: Boolean }
});
const sub_cat = mongoose.model('sub_cat', sub_catSchema);

// MONTH SCHEMA
var monthSchema = new mongoose.Schema({
    month_id: { type: Boolean },
    month_name: { type: String },
});
const month = mongoose.model('month', monthSchema);

// SIGNIN SCHEMA
var signinSchema = new mongoose.Schema({
    username: { type: String },
    password: { type: String },
    admin:{type:Boolean}
});
const signin = mongoose.model('signin', signinSchema);

// FORM SCHEMA
var formSchema = new mongoose.Schema({
    fy_year: { type: Object },
    month: { type: Object },
    head_cat: { type: Object },
    sub_cat: { type: Object },
    date: { type: String },
    received_by: { type: Array },
    particulars: { type: String },
    bill_no: { type: String },
    departments: { type: Object },
    amount: { type: String },
    vehicles: { type: Object },
    files:{type:String},
    uploads:{type:Array}
});
const form = mongoose.model('form', formSchema);

module.exports = {
    department,
    vehicle,
    employee,
    fy_year,
    head_cat,
    sub_cat,
    month,
    signin,
    form
};
