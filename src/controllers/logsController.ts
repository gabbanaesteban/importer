import { User } from "@prisma/client"
import { Request, Response } from "express"
import { ContactService } from "../services/ContactService"
import container from "../IoC/inversify.config"
import { LOGS_SERVICE } from "../IoC/types"
import { formatDate, stringify } from "../helpers/hbs"
import { LogService } from "../services/LogService"
import { validateParams } from "../helpers/utils"
import { listLogsSchema } from "../schemas/schemas"

export async function listLogs(req: Request, res: Response) {
  const logsService = container.get<LogService>(LOGS_SERVICE)
  // add pagination
  const { importId } = validateParams(req.query, listLogsSchema)
  const logs = await logsService.listLogs(importId)

  res.render("logs", {
    data: { logs},
    helpers: {
      formatDate,
      stringify
    },
  })
}
