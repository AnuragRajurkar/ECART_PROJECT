//In this we will create a user in database

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';


//creating a function to regiter user in database so we will get /api/user/register

export const register = async (req,res) => {
    try {

        const {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.json({
                success : false,
                message : "Missing details"
            })
        }

        const existingUser = await User.findOne({email});

        //if existing user is already available then we will not create a new user
        if(existingUser){
            return res.json({
                success : false,
                message : "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password : hashedPassword
        })

        //token will be sent in response
        const token = jwt.sign({id : user._id}, process.env.JWT_SECRET,{expiresIn : '7d'})
        
        //now we have to sent tooken inreponse as a cookie
        res.cookie('token', token, {
            httpOnly : true, //prevent javascript to access cookie
            secure : process.env.NODE_ENV === "production", //use secure cookie in production
            sameSite : process.env.NODE_ENV === "production" ? 'none' : 'strict', //CSRF PROTECTION
            maxAge : 7 * 24 * 60 * 60 *1000 //cookie expiration time
        })

        //we are sending response to user 
        return res.json({
                success : true,
                user : {
                    email : user.email,
                    name : user.name,
                }
            })
    } catch (error) {
        console.log(error.message);
        res.json({
            success : false,
            message : error.message
        })
    }
}

// Login User : /api/user/login

export const login = async (req, res)=>{
    try {
        const { email, password } = req.body;

        if(!email || !password)
            return res.json({success: false, message: 'Email and password are required'});

        //we will find user by email in database
        const user = await User.findOne({email});

        if(!user){
            return res.json({success: false, message: 'Invalid email or password'});
        }

        const isMatch = await bcrypt.compare(password, user.password)
        //password getting from the req.body and the password store in database

        if(!isMatch)
            return res.json({success: false, message: 'Invalid email or password'});

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return res.json({success: true, user: {email: user.email, name: user.name}})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//it will check user is authenticated or not

//check auth :- /api/user/is-auth

export const isAuth = async (req, res)=>{
    try {
        const userId  = req.user;
        const user = await User.findById(userId).select("-password")
        return res.json({success: true, user})

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}


//logout user : /api/user/logout

export const logout = async (req, res)=>{
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({ success: true, message: "Logged Out" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}