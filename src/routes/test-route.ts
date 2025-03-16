import express from "express";
import { getStatus, notify } from "@/controller/test-socket-controller";

const testRouter = express.Router();

testRouter.post("/notify", notify);

testRouter.get("/status", getStatus);

export default testRouter;
