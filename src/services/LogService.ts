import { Import, User } from "@prisma/client"
import { inject, injectable } from "inversify"
import { CURRENT_USER } from "../IoC/types"
import prisma from "../db"

@injectable()
export class LogService {
  private user: User

  constructor(@inject(CURRENT_USER) user: User) {
    this.user = user
  }
  
  async listLogs(importId: Import["id"] | undefined) {

    const logs = await prisma.log.findMany({
      where: { importId, ownerId: this.user.id },
      include: { Import: true },
      orderBy: { createdAt: "desc" },
    })

    return logs
  }
}
