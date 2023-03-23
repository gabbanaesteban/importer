import { User } from "@prisma/client"
import { ImportMappingType, ImportStatus } from "../types"
import { inject, injectable } from "inversify"
import { CURRENT_USER } from "../IoC/types"
import prisma from "../db"
import { importerQueue } from "../tasks/queue"
import { swapObjectProps } from "../helpers/utils"

@injectable()
export class ImportService {
  private user: User

  constructor(@inject(CURRENT_USER) user: User) {
    this.user = user
  }

  async listImports() {
    const imports = await prisma.import.findMany({
      where: { userId: this.user.id },
      include: { _count: { select: { Log: true } } },
    })

    return imports
  }

  async scheduleImportFile(file: Express.Multer.File, mapping: ImportMappingType) {
    const swappedMapping = swapObjectProps(mapping)

    const importedFile = await prisma.import.create({
      data: {
        filePath: file.path,
        originalName: file.originalname,
        status: ImportStatus.ON_HOLD,
        mapping: swappedMapping,
        userId: this.user.id,
        createdAt: new Date(),
      },
    })

    await importerQueue.add(importedFile)
  }
}
