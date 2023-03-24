import { prismaMock } from "@tests/dbMock"
import container from "@src/IoC/inversify.config"
import { buildFile, buildImport, buildUser } from "@tests/generate"
import { Import, User } from "@prisma/client"
import { CURRENT_USER, IMPORTER_QUEUE, IMPORT_SERVICE } from "@src/IoC/types"
import { ImportService } from "@src/services/ImportService"
import { mockDeep } from "jest-mock-extended"
import Bull from "bull"
import { ImportMappingType, ImportStatus } from "@src/types"


describe("ImportService test suite", () => {
  describe("#listImports", () => {
    it("should return a list of imports", async () => {
      const user = buildUser({ id: 45 })
      const importedFile = buildImport({ userId: user.id })

      container.rebind<User>(CURRENT_USER).toConstantValue(user)
      container.rebind<Bull.Queue<Import>>(IMPORTER_QUEUE).toConstantValue(mockDeep<Bull.Queue<Import>>())

      prismaMock.import.findMany.mockResolvedValueOnce([importedFile])

      const importService = container.get<ImportService>(IMPORT_SERVICE)

      const imports = await importService.listImports()

      expect(prismaMock.import.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: user.id },
        include: { _count: { select: { Log: true }} }, 
      }))

      expect(imports).toEqual([importedFile])
    })
  })

  describe("#createImport", () => {
    it("should create an import", async () => {
      const file = buildFile()
      const mapping = { date_of_birth: "fecha de nacimiento" } as ImportMappingType

      const user = buildUser({ id: 30 })
      const importedFile = buildImport({ userId: user.id })

      const mockQueue = mockDeep<Bull.Queue<Import>>()

      container.rebind<User>(CURRENT_USER).toConstantValue(user)
      container.rebind<Bull.Queue<Import>>(IMPORTER_QUEUE).toConstantValue(mockQueue)

      prismaMock.import.create.mockResolvedValueOnce(importedFile)

      const importService = container.get<ImportService>(IMPORT_SERVICE)

      await importService.scheduleImportFile(file, mapping)

      expect(prismaMock.import.create).toHaveBeenCalledWith({
        data: {
          filePath: file.path,
          originalName: file.originalname,
          status: ImportStatus.ON_HOLD,
          mapping: { "fecha de nacimiento": "date_of_birth" },
          userId: user.id,
          createdAt: expect.any(Date),
        }
      })

      const createdImportFile = await prismaMock.import.create.mock.results[0].value

      expect(mockQueue.add).toHaveBeenCalledWith(createdImportFile)
    })
  })
})