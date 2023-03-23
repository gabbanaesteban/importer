import { User } from "@prisma/client"
import { Request, Response } from "express"
import container from "../IoC/inversify.config"
import { IMPORT_SERVICE } from "../IoC/types"
import { importMappingSchema } from "../schemas/schemas"
import { validateParams } from "../helpers/utils"
import { ImportService } from "../services/ImportService"
import { ImportMappingType } from "../types"
import { formatDate } from "../helpers/hbs"

export async function listImports(req: Request, res: Response) {
  // add pagination

  const importService = container.get<ImportService>(IMPORT_SERVICE)
  const imports = await importService.listImports()


  res.render("imports", { 
    data: { imports },
    helpers: {
      formatDate
    }
  })
}

export async function importFile(req: Request, res: Response) {
  const file = req.file as Express.Multer.File
  const mapping: ImportMappingType = validateParams(req.body, importMappingSchema)
  const importService = container.get<ImportService>(IMPORT_SERVICE)

  await importService.scheduleImportFile(file, mapping)

  res.redirect("/imports")
}
