import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        const userToken = req.headers.authorization?.split(" ")[1];
        if (!userToken) {
            return next("You need to be logged in!");
        }
        const verify = await jwt.verify(
            userToken,
            process.env.JWT_SECRET_KEY,
        );
        const user = await userModel.findById(verify.id);
        req.user = user;
        next();
    } catch (error) {
        return next(error);
    }
};

export default isAuthenticated;
