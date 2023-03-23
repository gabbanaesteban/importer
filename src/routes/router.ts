import { Response, Request, Router } from "express"
import multer from "multer"
import asyncHandler from "express-async-handler"
import { sessionChecker } from "../middlewares/auth"
import { csvGuard } from "../middlewares/file"
import { errorHandler, notFound } from "../middlewares/error"
import { register, login } from "../controllers/authController"
import { importFile, listImports } from "../controllers/importController"
import { listContacts } from "../controllers/contactsController"
import { listLogs } from "../controllers/logsController"

const router = Router()
const upload = multer({ dest: "./uploads" })

router.get("/register", (_, res: Response) => res.render("register", { layout: "auth" }))
router.post("/register", asyncHandler(register))

router.get("/login", (_, res: Response) => res.render("login", { layout: "auth" }))
router.post("/login/password", asyncHandler(login))

router.use(sessionChecker)

router.get("/imports", asyncHandler(listImports))
router.get("/imports/new", (_, res: Response) => res.render("new-import"))
router.post("/import", upload.single("file"), asyncHandler(csvGuard), asyncHandler(importFile))

router.get("/logs", asyncHandler(listLogs))
router.get("/", asyncHandler(listContacts))

router.get("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/login")
    }

    res.redirect("/login")
  })
})

router.use(notFound)
router.use(errorHandler)

export default router
