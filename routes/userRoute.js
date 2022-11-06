import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import userModel from "../models/userModel.js";
import isAuthenticated from "../middleware/authMiddleware.js";

const route = express.Router();

//###############MULTER STORAGE###############
const boxImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/images");
    },
    filename: (req, file, cb) => {
        const filetype = file.mimetype.split("/").at(-1);
        cb(null, `${file.fieldname}_${Date.now()}.${filetype}`);
    },
});

const boxImageUpload = multer({
    storage: boxImageStorage,
});

//###############ROUTES###############
route.post("/signup", async (req, res) => {
    try {
        const {
            signupUsername,
            signupPassword,
            signupCurrentUserLocation,
        } = req.body;
        if (
            !signupUsername ||
            !signupPassword ||
            !signupCurrentUserLocation
        ) {
            return res.json({ error: "All fields are required!" });
        }
        const userExist = await userModel.findOne({
            userName: signupUsername,
        });
        if (userExist) {
            return res.json({
                error: `User "${signupUsername}" already exists!`,
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(signupPassword, salt);
        const encryptedSignupPassword = hashPassword;

        const newUser = await userModel.create({
            userName: signupUsername,
            userPassword: encryptedSignupPassword,
            userLocation: signupCurrentUserLocation,
            userBoxes: [],
        });

        const token = await jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_EXPIRE },
        );

        return res.cookie("token", token).json({
            success: true,
            message: "User signup was successful",
            data: newUser,
        });
    } catch (error) {
        return res.json({ error: error });
    }
});

route.post("/login", async (req, res) => {
    try {
        const { loginUsername, loginPassword } = req.body;
        if (!loginUsername || !loginPassword) {
            return res.json({ error: "All fields are required!" });
        }
        const userExist = await userModel.findOne({
            userName: loginUsername,
        });
        if (!userExist) return res.json({ message: "No such user!" });
        const isPasswordCorrect = await bcrypt.compare(
            loginPassword,
            userExist.userPassword,
        );
        if (!isPasswordCorrect) {
            return res.json({ error: "Wrong password!" });
        }
        const token = await jwt.sign(
            { id: userExist._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_EXPIRE },
        );
        return res.json({
            token,
            success: true,
            message: "Login was successful!",
            data: userExist,
        });
    } catch (error) {
        return res.json({ error: error });
    }
});

route.get("/user", isAuthenticated, (req, res) => {
    return res.json({ user: req.user });
});

route.put(
    "/addbox",
    boxImageUpload.single("box_image"),
    async (req, res) => {
        const {
            boxLocationCity,
            boxLocationX,
            boxLocationY,
            books,
            cloths,
            dishes,
            toys,
            shoes,
            decoration,
            gadgets,
            tools,
            dvd,
            videogames,
            currentUser,
        } = req.body;

        await userModel.updateOne(
            { _id: currentUser },
            {
                $push: {
                    userBoxes: {
                        x: parseFloat(boxLocationX),
                        y: parseFloat(boxLocationY),
                        boxImagePath: req.file ? req.file.filename : null,
                        boxLocationCity: boxLocationCity,
                    },
                },
            },
        );
        res.json({ success: true, user: currentUser });
    },
);

route.delete("/delete", isAuthenticated, async (req, res) => {
    try {
        await userModel.findByIdAndDelete(req.user._id);
        res.json({ msg: "User Deleted Successfully!" });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({
            err: error.message || "Error while deleting user",
        });
    }
});

export default route;
