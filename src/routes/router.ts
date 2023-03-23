import { Router } from "express";
import { sessionChecker } from "../middlewares/auth";
import authRoutes from "../routes/authRoutes";
import importRoutes from "../routes/importRoutes";
import { errorHandler, notFound } from "../middlewares/error";


const router = Router();

router.use(authRoutes);
router.use(sessionChecker)
router.use(importRoutes);
router.get("/", async (_, res) => res.render('home'));

router.use(errorHandler);
router.use(notFound);

export default router;