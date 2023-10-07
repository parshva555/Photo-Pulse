
import mongoose,{Schema} from "mongoose";

const PasswordResetSchema = Schema(
    {
        userId:{type:String,unique:true},
        email:{type:String,unique:true},
        token:String,
        createdAt:Date,
        expiresAt:Date,
    }
)
const PasswordReset = mongoose.model("PasswordReset",PasswordResetSchema);
export default PasswordReset;