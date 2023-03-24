import { Import, User } from "@prisma/client"
import { ImportMappingType, ImportStatus } from "../types"
import { inject, injectable } from "inversify"
import { CURRENT_USER, IMPORTER_QUEUE } from "../IoC/types"
import prisma from "../db"
import { swapObjectProps } from "../helpers/utils"
import Bull from "bull"

@injectable()
export class ImportService {
  private user: User
  private queue: Bull.Queue<Import>

  constructor(@inject(CURRENT_USER) user: User, @inject(IMPORTER_QUEUE) queue: Bull.Queue<Import>) {
    this.user = user
    this.queue = queue
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

    await this.queue.add(importedFile)
  }
}
