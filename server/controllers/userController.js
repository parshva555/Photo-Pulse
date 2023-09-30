import mongoose from "mongoose";
import Verification from "../models/emailVerification.js";
import Users from "../models/userModel.js";
import PasswordReset from "../models/PasswordReset.js";
import { compareString, hashString } from "../utils/index.js";
import { resetPasswordLink } from "../utils/sendEmail.js";

export const verifyEmail = async (req, res) => {
    const {userId,token} = req.params;
    try{
        const result = await Verification.findOne({userId});
        if(result){
            const {expiresAt,token:hashedToken} = result;

            //TOKEN HAS EXPIRED
            if(expiresAt < Date.now()){
                Verification.findOneAndDelete({userId})
                    .then(() => {
                        Users.findOneAndDelete({_id: userId})
                        .then(() => {
                            const message = "Verification link has expired. Please register again"
                            res.redirect(`/users/verified?status=error&message=${message}`)
                        })
                        .catch((error) => {
                            console.log(error + " " + "error1")
                            res.redirect(`/users/verified?status=error&message=`);
                        }); 
                })
                .catch((error) => {
                    console.log(error + " " + "error2")
                    res.redirect(`/users/verified?message=`);
                });
            }
            else{
                // token valid 
                compareString(token, hashedToken)
                .then((isMatch) => {
                    console.log(isMatch);
                    if(isMatch){
                        Users.findOneAndUpdate({_id: userId}, {verified: true})
                        .then(() => {
                            Verification.findOneAndDelete({userId})
                            .then(() => {
                                const message = "Your email has been verified successfully"
                                res.redirect(`/users/verified?status=success&message=${message}`)
                            })
                        })
                        .catch((error) => {
                            console.log(error + " " + "error3")
                            const message = "Verification failed or link is invalid"
                            res.redirect(`/users/verified?status=error&message=${message}`)
                        })
                    } else{
                        //invalid token 
                        const message = "Verification failed or link is invalid"
                        res.redirect(`/users/verified?status=error&message=${message}`)
                    }
                }).catch((err) => {
                    console.log(err + " " + "error4");
                    res.redirect(`/users/verified?status=error&message=`);
                })
            }
        }else{
            const message = "Verification failed or link is invalid"
            res.redirect(`/users/verified?status=error&message=${message}`)
        }
    }
    catch(error){
        console.log(error+ " " + " error 5")
        res.redirect(`/users/verified?status=error&message=`);
    }
}
export const requestPasswordReset = async (req,res) => {
    try {
        const {email} = req.body;
        const user = await Users.findOne({email})
        if(!user){
            return res
                .status(404)
                .json({
                    status:"failed",
                    message:"email address not found."
                })
            }
            const existingRequest = await PasswordReset.findOne({email})

            if(existingRequest){
                if(existingRequest.expiresAt > Date.now()){
                    res.status(201).json({
                        status: "PENDING",
                        message: "Password reset link already sent, please check your email"
                    })
                }
                await PasswordReset.findOneAndDelete({email})
            }
            await resetPasswordLink(user, res)
    } catch (error) {
        console.log(error);
        res.status(404).json({message : error.message})
    }
}
export const resetPassword = async(req,res) => {
    const {userId, token} = req.params;
    try {
        const user = await Users.findById(userId);
        if(!user){
            const message = "Invalid password reset link!. Try again"
            res.redirect(`/users/resetpassword?status=error&message=${message}`)
        }
        const resetPassword = await PasswordReset.findOne({userId});
        if(!resetPassword){
            const message = "Invalid password reset link!. Try again"
            res.redirect(`/users/resetpassword?status=error&message=${message}`)
        }
        const { expiresAt, token: resetToken } = resetPassword;
        if(expiresAt < Date.now()){
            const message = "Password reset link has expired. Try again"
            res.redirect(`/users/resetpassword?status=error&message=${message}`)
        }else{
            const isMatch = await compareString(token,resetToken);
            if(!isMatch){
                const message = "Invalid reset password link. Please try again";
                res.redirect(`/users/resetpassword?status=error&message=${message}`)
            }else{
                res.redirect(`/users/resetpassword?type=reset&id=${userId}`)
            }
        }
        
    } catch (error) {
        console.log(error);
        res.status(404).json({message:error.message})
    }
}
export const changePassword = async(req,res) => {
    try {
        const { userId, password } = req.body;
        console.log(userId + " " + password);
        const hashedPassword = await hashString(password);


        const user = await Users.findByIdAndUpdate({_id: userId}, {password: hashedPassword})

        if(user){
            await PasswordReset.findOneAndDelete({userId})
            const message = "Password reset successful."
            res.redirect(`/users/resetpassword?status=success&message=${message}`)
            return
        }
        
    } catch (error) {
        console.log(error);
        res.status(404).json({message: error.message});
    }
}

