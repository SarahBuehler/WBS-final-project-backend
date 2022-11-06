import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import mongoose from "mongoose";
// import multer from "multer";
import cors from "cors";
import userModel from "./models/userModel.js";
import route from "./routes/userRoute.js";

//###############EXPRESS SERVER SETUP###############

// bilder nur als name abspeichern und die adresse mit backsticks mit dem namen erweitern
// localhost:8080/images/{name_of_image}
const server = express();
server.use("/images", express.static("public/images"));
server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use(
    cors({
        credentials: true,
        origin: true,
    }),
);
server.options("*", cors());
server.use(cookieParser());
server.use("/box", route);

//###############MONGODB CONNECTION###############
const mongoDB = process.env.MONGO_CONNECTION;
mongoose.connect(mongoDB);
mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB!");
});

//###############TEST ROUTES###############
server.get("/", (req, res) => {
    res.send("ok");
});

server.get("/finduser", async (req, res) => {
    const findUser = await userModel.find({});
    res.send(findUser);
});

server.all("*", (req, res) => {
    res.status(404).send("<h1>Resource was not found</h1>");
});

server.listen(process.env.PORT || 3001, () => {
    console.log("Server is online");
});
