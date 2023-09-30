import express from "express"
import path from "path"


import { changePassword, requestPasswordReset, resetPassword, verifyEmail} from '../controllers/userController.js';

const router = express.Router();
const __dirname = path.resolve(path.dirname(""));

router.get("/verify/:userId/:token", verifyEmail)
// //Password route
router.post("/request-passwordreset", requestPasswordReset)
router.get("/reset-password/:userId/:token", resetPassword)
router.post('/reset-password', changePassword)

router.get("/verified", (req, res) => {
    res.sendFile(path.join(__dirname,"./view/build","index.html"))
})

router.get("/resetpassword", (req, res) => {
    res.sendFile(path.join(__dirname, "./view/build", "index.html"))
})

export default router;