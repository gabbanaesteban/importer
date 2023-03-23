import { User } from "@prisma/client"
import { Request, Response } from "express"
import container from "../IoC/inversify.config"
import { IMPORT_SERVICE } from "../IoC/types"
import { importMappingSchema } from "../schemas/importSchemas"
import { validateParams } from "../utils/helpers"
import { ImportService } from "../services/ImportService"
import { ImportMappingType } from "../types"

// export async function importView(req: Request, res: Response) {
//   res.render("import")
// }

export async function importFile(req: Request, res: Response) {
  const file = req.file as Express.Multer.File
    // TODO: Use mapping to process file
  const mapping = {} as ImportMappingType //validateParams(, importMappingSchema)
  const importService = container.get<ImportService>(IMPORT_SERVICE)

  await importService.scheduleImportFile(file, mapping)

  res.redirect("/import")
}
