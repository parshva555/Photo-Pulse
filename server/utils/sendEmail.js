import nodemailer from "nodemailer"
import dotenv from "dotenv";
import {v4 as uuidv4} from "uuid";
import { hashString } from "./index.js";
import Verification from "../models/emailVerification.js";
dotenv.config();

const {AUTH_EMAIL,AUTH_PASSWORD,APP_URL} = process.env;

let transporter = nodemailer.createTransport({
    host:"Parshvadani@outlook.com",
    auth:{
        user:AUTH_EMAIL,
        pass:AUTH_PASSWORD
    }
})
export const sendVerificationEmail = async(user,res) =>{
    const {_id,email,lastName} = user;
    const token  = _id + uuidv4();
    const link = APP_URL + "users/verify/" + _id + "/" + token;

    // mail options
    const mailOptions = {
        from:AUTH_EMAIL,
        to:email,
        subject:"Email Verification",
        html:`<div style="font-family: Arial, Helvetica, sans-serif; font-size: 20px; color: #333; background-color: white;">
        <h1 style="color: rgb(8,56,188);">Please verify you Email Address</h1>
        <hr>
        <h4>HI ${lastName}</h4>
        <p>Please verify your emial address so that we can know that's its really you</p>
        <br>
        <p>This link <b>Expires in 1 hr</b></p>
        <br>
        <a href=${link} style="color: #fff; padding: 14px; text-decoration: none; background-color: #000;">Email Address</a>
        <div style="margin-top: 20px;">
            <h5>Best Regards</h5>
            <h5>ShareFun Team</h5>
        </div>
        </div>`
    };
    try {
        const hashedToken = await hashString(token);
        const newVerifiedEmail = await Verification.create({
            userId:_id,
            token:hashedToken,
            createdAt:Date.now(),
            expiresAt:Date.now()+3600000
        })
        if(newVerifiedEmail){
            transporter
                .sendMail(mailOptions)
                .then(()=>{
                    res.status(201).send({
                        success:"PENDING",
                        message:"Verification mail has been send to your account, Check your email"
                    })
                })
                .catch((err)=>{
                    console.log(err);
                    res.status(404).json({message:"Something went wrong"})
                })
        }
    } catch (error) {
        console.log(error);
        res.status(404).json({message:"something went wrong"})
    }
}