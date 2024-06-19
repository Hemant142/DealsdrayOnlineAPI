const mongoose = require('mongoose');
const validator = require('validator'); // Requiring the validator package

const employeeSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email'
        },
        unique: true, // Ensures email uniqueness at the database level
    },
    mobile: {
        type: String,
        required: [true, 'Mobile number is required'],
        validate: {
            validator: function(v) {
                return /^\d+$/.test(v); // Validates that the mobile number contains only digits
            },
            message: 'Mobile number must be numeric'
        }
    },
    designation: {
        type: String,
        required: [true, 'Designation is required'],
        enum: ['HR', 'Manager', 'Sales'], 
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['Male', 'Female'], 
    },
    course: {
        type: String,
        required: [true, 'Course is required'],
        enum: ['MCA', 'BCA', 'BSC','B.tech'], 
    },
    image: {
        type: String,
        required: [true, 'Image is required'],
        validate: {
            validator: function(v) {
                return /\.(jpg|jpeg|png)$/.test(v); 
            },
            message: 'Only jpg and png files are allowed'
        }
    },
});

employeeSchema.pre('save', async function(next) {
    const employee = this;
    const existingEmployee = await mongoose.models.Employee.findOne({ email: employee.email });
    if (existingEmployee && existingEmployee._id.toString() !== employee._id.toString()) {
        throw new Error('Email already exists');
    }
    next();
});

const EmployeeModel = mongoose.model('Employee', employeeSchema);

module.exports = { EmployeeModel };
