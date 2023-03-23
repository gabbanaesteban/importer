import { Response, Router } from "express"
import asyncHandler from "express-async-handler"
import multer from 'multer';
import { csvGuard } from "../middlewares/file";
import { importFile } from "../controllers/importController"

const router = Router({ mergeParams: true })

const upload = multer({ dest: './uploads' });

router.get("/import", (_, res: Response) => res.render("import"))
router.post(
  "/import",
  upload.single('file'),
  asyncHandler(csvGuard),
  asyncHandler(importFile)
)

export default router