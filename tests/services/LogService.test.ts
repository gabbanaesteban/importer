import { prismaMock } from "@tests/dbMock"
import container from "@src/IoC/inversify.config"
import { buildLog, buildUser } from "@tests/generate"
import { User } from "@prisma/client"
import { LOGS_SERVICE, CURRENT_USER } from "@src/IoC/types"
import { LogService } from "@src/services/LogService"

describe("LogService test suite", () => {
  describe("#listLogs", () => {
    it("should return a list of logs filtered by the given importId", async () => {
      const user = buildUser({ id: 45 })
      const log = buildLog({ ownerId: user.id })
      const importId = 45

      container.rebind<User>(CURRENT_USER).toConstantValue(user)

      prismaMock.log.findMany.mockResolvedValueOnce([log])

      const logService = container.get<LogService>(LOGS_SERVICE)

      const logs = await logService.listLogs(importId)

      expect(prismaMock.log.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { importId, ownerId: user.id },
        include: { Import: true },
        orderBy: { createdAt: "desc" },
      }))

      expect(logs).toEqual([log])
    })
  })
})