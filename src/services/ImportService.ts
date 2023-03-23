import { User } from "@prisma/client"
import { ImportMappingType, ImportStatus } from "../types"
import { inject, injectable } from "inversify"
import { CURRENT_USER } from "../IoC/types"
import prisma from "../db"
import { importerQueue } from "../tasks/queue"

@injectable()
export class ImportService {
  private user: User

  constructor(@inject(CURRENT_USER) user: User) {
    this.user = user
  }

  async scheduleImportFile(file: Express.Multer.File, mapping: ImportMappingType) {
    const importedFile = await prisma.import.create({
      data: {
        filePath: file.path,
        status: ImportStatus.ON_HOLD,
        mapping: mapping,
        userId: this.user.id,
        createdAt: new Date(),
      },
    })

    await importerQueue.add(importedFile)
  }
}
