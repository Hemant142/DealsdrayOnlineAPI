const express = require("express");
const { EmployeeModel } = require("../Models/EmployeeModel");
const { auth } = require("../Middleware/auth.middleware");
const multer = require("multer");

const employeeRoutes = express.Router();



// Set up multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
// const upload = multer({
//     storage: storage,
//     fileFilter: function (req, file, cb) {
//         const fileTypes = /jpeg|jpg|png/;
//         const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
//         const mimetype = fileTypes.test(file.mimetype);
        
//         if (mimetype && extname) {
//             return cb(null, true);
//         } else {
//             cb('Error: Images Only!');
//         }
//     }
// });

employeeRoutes.use(auth);

employeeRoutes.post('/create', async (req, res) => {
    const newEmployeeData = req.body;
    newEmployeeData.userId = req.body.userId; // Add the userId to the employee data

    try {
        // Check if the email already exists
        const existingEmployee = await EmployeeModel.findOne({ email: newEmployeeData.email });
        if (existingEmployee) {
            return res.status(400).send({ message: 'Email already exists' });
        }

        // Create a new employee document
        const newEmployee = new EmployeeModel(newEmployeeData);

        // Save the new employee document, triggering schema validations
        await newEmployee.save();

        res.status(201).send({ message: 'Employee Created Successfully!', newEmployee });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// Serve static files from the "uploads" directory

// employeeRoutes.use('/uploads', express.static('uploads'));

// employeeRoutes.post('/create', upload.single('image'), async (req, res) => {
//     const newEmployeeData = req.body;
//     newEmployeeData.userId = req.body.userId; // Add the userId to the employee data

//     if (req.file) {
//         newEmployeeData.image = req.file.path; // Add the file path to the employee data
//     } else {
//         return res.status(400).send({ message: 'Image is required' });
//     }

//     try {
//         // Check if the email already exists
//         const existingEmployee = await EmployeeModel.findOne({ email: newEmployeeData.email });
//         if (existingEmployee) {
//             return res.status(400).send({ message: 'Email already exists' });
//         }

//         // Create a new employee document
//         const newEmployee = new EmployeeModel(newEmployeeData);

//         // Save the new employee document, triggering schema validations
//         await newEmployee.save();

//         res.status(201).send({ message: 'Employee Created Successfully!', newEmployee });
//     } catch (err) {
//         res.status(400).send({ error: err.message });
//     }
// });

// employeeRoutes.get("/get", async (req, res) => {
//     const { name } = req.query;
//     const userId = req.body.userId;
//    console.log(name,"name")
//     try {
//         const query = {}
//         if (name) {
//             query.name = { $regex: name, $options: "i" }; // Case-insensitive search
//             console.log(query.name,"quarry")
//             const employees = await EmployeeModel.find({query,userId });
//             res.status(200).send(employees);
//         }else{
//             const employees = await EmployeeModel.find({userId });
//             res.status(200).send(employees);

//         }
   
//     } catch (err) {
//         res.status(400).send({ error: err.message });
//     }
// });

employeeRoutes.get("/get", async (req, res) => {
    const { name } = req.query;
    const userId = req.body.userId;

    try {
        const query = { userId };

        if (name) {
            query.name = { $regex: name, $options: "i" }; // Case-insensitive search
        }

        const employees = await EmployeeModel.find(query);
        res.status(200).send(employees);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});


employeeRoutes.get("/get/:id", async (req, res) => {
    const { id } = req.params;
    const userId = req.body.userId;
console.log(id,userId)
    try {
        // Find the employee by ID and userId to ensure the employee belongs to the user
        const employee = await EmployeeModel.findOne({ _id: id, userId });

        if (!employee) {
            return res.status(404).send({ message: 'Employee not found or you do not have permission to view this employee' });
        }

        res.status(200).send(employee);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});


employeeRoutes.patch('/update/:id', async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    const userId = req.body.userId;

    try {
        // Check if the employee belongs to the user
        const employee = await EmployeeModel.findOne({ _id: id, userId });
        if (!employee) {
            return res.status(404).send({ message: 'Employee not found or you do not have permission to update this employee' });
        }

        // Check if the email is being updated and if it already exists for another employee
        if (updatedData.email) {
            const existingEmployee = await EmployeeModel.findOne({ email: updatedData.email });
            if (existingEmployee && existingEmployee._id.toString() !== id) {
                return res.status(400).send({ message: 'Email already exists' });
            }
        }

        const updatedEmployee = await EmployeeModel.findOneAndUpdate(
            { _id: id },
            updatedData,
            { new: true, runValidators: true, context: 'query' }
        );

        res.status(200).send({ message: 'Employee Updated Successfully!', updatedEmployee });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});


employeeRoutes.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    const userId = req.body.userId;

    try {
        // Check if the employee belongs to the user
        const employee = await EmployeeModel.findOne({ _id: id, userId });
        if (!employee) {
            return res.status(404).send({ message: 'Employee not found or you do not have permission to delete this employee' });
        }

        await EmployeeModel.findByIdAndDelete(id);
        res.status(200).send({ message: 'Employee Deleted', employee });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

module.exports = {
    employeeRoutes
};
