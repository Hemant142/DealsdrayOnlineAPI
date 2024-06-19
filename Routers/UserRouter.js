const express = require("express");
const { UserModel } = require("../Models/UserModel");
require('dotenv').config()
const saltRounds = parseInt(process.env.saltrounds) || 10;
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");
const { BlacklistModel } = require("../Models/Blacklist");
const { auth } = require("../Middleware/auth.middleware");
const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
    console.log(req.body)
  const { username, password } = req.body;

  try {
    if ( !username || !password) {
      res.status(200).send({ message: "Input fields are required!" });
    } else {
      const existingUser = await UserModel.findOne({ username });

      if (existingUser) {
        res
          .status(200)
          .send({ message: "User with this Username Already Exists!" });
      } else {
        bcrypt.hash(password, saltRounds, async function (err, hash) {
          if (err) {
            console.log(err.message);
            res.status(500).send({ message: "An Error Occured", error: err });
          } else {
            const newUser = new UserModel({
              username,
              password: hash,
            });
            await newUser.save();
            res.status(201).send({ message: "User created successfully!" });
          }
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal Server Error", error: err.message  });
  }
});

userRouter.post("/login",async (req, res) => {
    try{
        const {username,password} = req.body

        if(!username || !password){
            res.status(200).send({message:"All Input fields are required!"}) 
         }else{
            const user = await UserModel.findOne({username})
            if(!user){
                res.status(202).send({message:"User Does Not Exist!"})
            }else{
                const passwordMatch = await bcrypt.compare(password, user.password);
    
                if (passwordMatch) {
                    const token = jwt.sign({userId:user._id}, process.env.SecretKey,{ expiresIn: 7*600 });
                    res.status(200).send({ message: "Login successful!", token , user });
                } else {
                    res.status(200).send({ message: "Incorrect password!" });
                }
            }

          }
    
      }
      catch(err){
        console.log(err)
        res.status(500).send({ message: "Internal Server Error", error: err.message  });
    } 
})

userRouter.patch('/update/:userID',auth, async (req, res) => {
    try {
      const userID = req.params.userID;
      const { name, username, email, password } = req.body;
  
      const updateFields = {};
      if (name) updateFields.name = name;
      if (username) updateFields.username = username;
      if (email) updateFields.email = email;
      if (password) {
        updateFields.password = await bcrypt.hash(password, saltRounds);
      }
  
      const user = await UserModel.findOneAndUpdate(
        { _id: userID },
        updateFields,
        { new: true }
      );
  
      if (!user) {
        res.status(404).send({ message: "User Not found!" });
      } else {
        res.status(200).send({ message: "User updated successfully!", user });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Internal Server Error", error: err.message });
    }
  });
  


userRouter.get("/logout", async (req, res) => {
  const token = req.headers.authorization;
  
  try {
      if (token) {
          // Use findOneAndUpdate to ensure only one document is updated
          await BlacklistModel.findOneAndUpdate({}, { $addToSet: { blacklist: token } }, { upsert: true });
          res.status(200).json({ msg: "User has been logged out" });
      } else {
          res.status(400).json({ error: "Token is not coming" });
      }
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

module.exports = {
  userRouter,
};
