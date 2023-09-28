import Users from "../models/userModel.js"
import { hashString } from "../utils/index.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

export const regsiter = async (req,res,next) =>{
    const {firstName,lastName,email,password} = req.body;

    //validate Fields
    if(!(firstName || lastName || email || password)){
        next("Provide required fields");
        return 
    }
    try{
        const userExist= await Users.findOne({email});
        if(userExist){
            next("Email Already exists");
            return;
        }
        const hashedPassword = await hashString(password)
        const user = await Users.create({
            firstName,
            lastName,
            email,
            password:hashedPassword,
        })
        //send email verification to the user
        sendVerificationEmail(user,res);
    
    } catch(error){
        console.log(error);
        res.status(404).json({message:error.message})
    }
}