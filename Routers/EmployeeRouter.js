const express = require("express");
const { EmployeeModel } = require("../Models/EmployeeModel");
const { auth } = require("../Middleware/auth.middleware");

const employeeRoutes = express.Router();

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

employeeRoutes.get("/get", async (req, res) => {
    const userId = req.body.userId;
    try {
        const employees = await EmployeeModel.find({ userId });
        res.status(200).send(employees);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

employeeRoutes.get("/get/:id", async (req, res) => {
    const { id } = req.params;
    const userId = req.body.userId;

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
