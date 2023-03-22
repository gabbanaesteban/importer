import { Response, Router } from "express"
import asyncHandler from "express-async-handler"
import { register, login } from "../controllers/authController"

const router = Router({ mergeParams: true })

router.get("/register", (_, res: Response) => res.render("register"))
router.post("/register", asyncHandler(register))

router.get("/login", (_, res: Response) => res.render("login"))
router.post("/login/password", asyncHandler(login))

export default router
