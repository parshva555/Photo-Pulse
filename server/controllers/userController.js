import mongoose from "mongoose";
import Verification from "../models/emailVerification.js";
import Users from "../models/userModel.js";

import { compareString, hashString } from "../utils/index.js";
import PasswordReset from "../models/PasswordReset.js";
import { resetPasswordLink } from "../utils/sendEmail.js";

export const verifyEmail = async(req, res) => {
    const { userId, token  } = req.params;
    
    
    try {
        const result = await Verification.findOne({ userId });
        
        if(result){

            const { expiresAt, token: hashedToken } = result; 

            //token has expire
            if(expiresAt < Date.now()){
                await Verification.findOneAndDelete({ userId })
                .then(()=>{
                    Users.findOneAndDelete({ _id: userId }).then(()=>{
                        const message = "Verification token has expired.";
                        res.redirect(
                            `/users/verified?status=error&message=${message}`
                        );
                    }).catch((err)=>{
                        res.redirect(`/users/verified?status=error&message=`);
                    });
                }).catch((error)=>{
                    console.log(error);
                    res.redirect(`/users/verified?message=`);
                });
            }else {
                //token valid 

                compareString(token, hashedToken)
                .then((isMatch)=> {
                    if(isMatch){
                        Users.findOneAndUpdate({ _id: userId }, { verified: true })
                        .then(() => {
                            Verification.findOneAndDelete({ userId }).then(()=>{
                                const message = "Email Verified Successfully";
                                res.redirect(
                                    `/users/verified?status=success&message=${message}`
                                );
                            });
                        }).catch((err)=>{
                            console.log(err);
                            const message = "Verification failed or link is invalid";
                            res.redirect(
                                `/users/verified?status=error&message=${message}`
                            );
                        });
                    }else{
                        //invalid token 
                        const message = "Verification failed or link is invalid";
                        res.redirect(`/users/verified?status=error&message=${message}`);
                    }
                })
                .catch((err)=> {
                    console.log(err);
                    res.redirect(`/users/verified?message=`);
                });
            }
        }else{
            const message = "Invalid verificaton link. Try again later.";
            res.redirect(`/users/verified?status=error&message=${message}`);
        }

    } catch (error) {
        console.log(error);
        res.redirect(`/users/verified?message=`)
    }
};

export const requestPasswordReset = async(req,res) => {
    try {
        const { userId, email } =req.body;

        const user = await Users.findOne({ email });
        if(!user){
            return res.status(404).json({
                status: "FAILED",
                message: "Email address not found.",
            });
        }

        const existingRequest = await PasswordReset.findOne({ email });
        if(existingRequest){
            if(existingRequest.expiresAt > Date.now()){
                return res.status(201).json({
                    status: "PENDING",
                    message: "Reset password link has already been sent to your email.",
                });
            }
            await PasswordReset.findOneAndDelete({ userId, email });
        }
        await resetPasswordLink(user, res);

    } catch (error) {
        console.log(error);
        res.status(404).json({message: error.message});
    }
};

export const resetPassword = async(req, res) => {
    const { userId, token } = req.params; 

    try {

        //find record
        const user= await Users.findById(userId);

        if(!user){
            const message = "Invalid password link. Try again";
            res.redirect(`/users/resetpassword?status=error&message=${message}`);
        }

        const resetPassword = await PasswordReset.findOne({ userId });
        if(!resetPassword){
            const message = "Invalid password reset link. Try again.";
            res.redirect(`/users/resetpassword?status=error&message=${message}`)
        }

        const { expiresAt, token: resetToken } = resetPassword;
        if(expiresAt < Date.now()){
            const message = "Reset Password link has expired. Please try again.";
            res.redirect(`/users/resetpassword?status=error&message=${message}`)
        }else{
            const isMatch = await compareString(token, resetToken);

            if(!isMatch){
                const message = "Invalid password reset link. Try again.";
                res.redirect(`/users/resetpassword?status=error&message=${message}`)
            }else{
                res.redirect(`/users/resetpassword?type=reset&id=${userId}`);
            }
        }


        
    } catch (error) {
        console.log(error);
        res.status(404).json({message: error.message});
    }
};

export const changePassword = async(req, res) =>{
    try {
        const { userId, password }= req.body;

        const hashedpassword = await hashString(password);
        const user = await Users.findByIdAndUpdate(
            { _id: userId },
            { password: hashedpassword } 
        );

        if(user){
            await PasswordReset.findOneAndDelete({ userId });

            const message = "Password successfully reset.";
            res.redirect(`/users/resetpassword?status=success&message=${message}`)
            return;
        }


    } catch (error) {
        console.log(error);
        res.status(404).json({message: error.message});
    }
};




