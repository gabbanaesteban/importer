import { Import, User } from "@prisma/client"
import { importMappingType, ImportStatus } from "../types"
import csv from "csv-parser"
import { createReadStream } from "fs"
import { inject, injectable } from "inversify"
import { CURRENT_USER } from "../IoC/types"
import prisma from "../db"
import { contactSchema } from "../schemas/importSchemas"
import ImporterWorker from "./importerWorker"

@injectable()
export class ImportService {
  private user: User

  constructor(@inject(CURRENT_USER) user: User) {
    this.user = user
  }

  async scheduleImportFile(file: Express.Multer.File, mapping: importMappingType) {
    const importedFile = await prisma.import.create({
      data: {
        filePath: file.path,
        status: ImportStatus.ON_HOLD,
        mapping: mapping,
        userId: this.user.id,
        createdAt: new Date(),
      },
    })

    // TODO add to queue
    const importerWorker = new ImporterWorker(importedFile)
    await importerWorker.processImport()
  }
}
