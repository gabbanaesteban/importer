import { Router } from "express";
import { sessionChecker } from "../middlewares/auth";
import authRoutes from "../routes/authRoutes";
import asyncHandler from "express-async-handler"


const router = Router();

router.use(authRoutes);
router.use(sessionChecker)
router.get("/", async (_, res) => res.render('home'));

export default router;