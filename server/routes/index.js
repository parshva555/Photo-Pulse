import express from "express"
import userRoute from "./userRoutes.js"
import authRoute from "./authRoutes.js";
import postRoute from "./postRoutes.js"
const router = express.Router();
router.use("/auth",authRoute); // auth / register
router.use("/users",userRoute); // auth / register
router.use("/posts",postRoute); // auth / register
export default router;