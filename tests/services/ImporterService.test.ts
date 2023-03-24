import { prismaMock } from "@tests/dbMock"
import { buildImport, buildRawContact } from "@tests/generate"
import ImporterService from "@src/services/ImporterService"
import { ImportStatus } from "@src/types"
import { setTimeout } from "timers/promises"

describe("ImportService test suite", () => {
  describe("#processImport", () => {
    it("should return and not update the import if the import is not on hold", async () => {
      const importedFile = buildImport({
        status: ImportStatus.PROCESSING,
      })

      prismaMock.import.findFirst.mockResolvedValueOnce(null)

      const importerService = new ImporterService(importedFile)
      await importerService.processImport()

      expect(prismaMock.import.findFirst).toBeCalledWith(
        expect.objectContaining({
          where: {
            id: importedFile.id,
            status: ImportStatus.ON_HOLD,
          },
        })
      )

      expect(prismaMock.import.update).not.toHaveBeenCalled()
    })

    it("should update the import to processing and process the import", async () => {
      const importedFile = buildImport({
        status: ImportStatus.ON_HOLD,
      })

      prismaMock.import.findFirst.mockResolvedValueOnce(importedFile)
      prismaMock.import.update.mockResolvedValue(importedFile)
      const processFileSpy = jest.spyOn(ImporterService.prototype, "processFile")
        .mockResolvedValueOnce()

      const importerService = new ImporterService(importedFile)
      await importerService.processImport()

      expect(prismaMock.import.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: importedFile.id },
          data: { status: ImportStatus.PROCESSING },
        })
      )

      expect(processFileSpy).toHaveBeenCalledTimes(1)
      expect(prismaMock.import.update).toHaveBeenCalledTimes(2)
    })

    it("should update the import to failed if no contact was imported and there were errors", async () => {
      const importedFile = buildImport({
        status: ImportStatus.ON_HOLD,
      })

      prismaMock.import.findFirst.mockResolvedValueOnce(importedFile)
      prismaMock.import.update.mockResolvedValue(importedFile)

      const importerService = new ImporterService(importedFile)

      jest.spyOn(ImporterService.prototype, "processFile").mockImplementation(
        async function (this: any) {
          this.failedRowsCount = 1
          this.successRowsCount = 0
        }.bind(importerService)
      )

      await importerService.processImport()

      expect(prismaMock.import.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: importedFile.id },
          data: { status: ImportStatus.FAILED },
        })
      )
    })

    it("should update the import to finished if at least one contact was imported", async () => {
      const importedFile = buildImport({
        status: ImportStatus.ON_HOLD,
      })

      prismaMock.import.findFirst.mockResolvedValueOnce(importedFile)
      prismaMock.import.update.mockResolvedValue(importedFile)

      const importerService = new ImporterService(importedFile)

      jest.spyOn(ImporterService.prototype, "processFile").mockImplementation(
        async function (this: any) {
          this.failedRowsCount = 1
          this.successRowsCount = 1
        }.bind(importerService)
      )

      await importerService.processImport()

      expect(prismaMock.import.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: importedFile.id },
          data: { status: ImportStatus.FINISHED },
        })
      )
    })
  })

  describe("#processRow", () => {
    it("should create a log if the row is not valid", async () => {
      const importedFile = buildImport({
        status: ImportStatus.PROCESSING,
      })

      const rowNumber = 5
      const row = buildRawContact({ name: "John Doe" })

      const importerService = new ImporterService(importedFile)

      await importerService.processRow(row, rowNumber)

      expect(prismaMock.log.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            importId: importedFile.id,
            rowData: JSON.stringify(row),
            rowNumber,
            error: "name: Invalid",
            ownerId: importedFile.userId,
            createdAt: expect.any(Date),
          },
        })
      )
      expect(prismaMock.contact.upsert).not.toHaveBeenCalled()
      expect(importerService.getFailedRowsCount()).toBe(1)
      expect(importerService.getSuccessRowsCount()).toBe(0)
    })

    it("should create a contact if the row is valid", async () => {
      const importedFile = buildImport({
        status: ImportStatus.PROCESSING,
      })

      const creditCardNumber = "4111111111111111"
      const rowNumber = 10
      const row = buildRawContact({ credit_card_number: creditCardNumber })

      const importerService = new ImporterService(importedFile)

      await importerService.processRow(row, rowNumber)

      const fieldsToBeUpdated = {
        name: row.name,
        dateOfBirth: expect.any(Date),
        phone: row.phone,
        address: row.address,
        creditCardNumber: expect.any(String),
        creditCardNetwork: "Visa",
        creditCardLast4: creditCardNumber.slice(-4),
        updatedAt: expect.any(Date),
      }

      const fieldsToBeCreated = {
        ...fieldsToBeUpdated,
        email: row.email,
        createdAt: expect.any(Date),
        ownerId: importedFile.userId,
      }

      expect(prismaMock.contact.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email_ownerId: { email: row.email, ownerId: importedFile.userId } },
          update: fieldsToBeUpdated,
          create: fieldsToBeCreated,
        })
      )
      expect(prismaMock.log.create).not.toHaveBeenCalled()
      expect(importerService.getSuccessRowsCount()).toBe(1)
      expect(importerService.getFailedRowsCount()).toBe(0)
    })
  })

  describe("#markImportAsFailed", () => {
    it("should update the import to failed", async () => {
      const importedFile = buildImport({
        status: ImportStatus.PROCESSING,
      })

      prismaMock.import.update.mockResolvedValue(importedFile)

      await ImporterService.markImportAsFailed(importedFile.id)

      expect(prismaMock.import.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: importedFile.id },
          data: { status: ImportStatus.FAILED },
        })
      )
    })
  })

  describe("#processFile", () => {
    beforeEach(() => {
      jest.restoreAllMocks()
    })

    it("should process a file with a custom mapping and with multiple rows", async () => {
      const importedFile = buildImport({
        status: ImportStatus.PROCESSING,
        filePath: "tests/fixtures/test.csv",
        mapping: {
          fecha_de_nacimiento: "date_of_birth",
          nombre: "name",
          correo: "email",
          telefono: "phone",
          direccion: "address",
          tarjeta: "credit_card_number",
        },
      })

      const importerService = new ImporterService(importedFile)

      const processRowSpy = jest.spyOn(ImporterService.prototype, "processRow")
      const createLogForInvalidContactSpy = jest
        .spyOn(ImporterService.prototype, "createLogForInvalidContact")
        .mockResolvedValue()
      const createOrUpdateContactSpy = jest
        .spyOn(ImporterService.prototype, "createOrUpdateContact")
        .mockResolvedValue()

      await importerService.processFile()

      expect(processRowSpy).toHaveBeenCalledTimes(2)
      expect(createLogForInvalidContactSpy).toHaveBeenCalledTimes(1)
      expect(createOrUpdateContactSpy).toHaveBeenCalledTimes(1)
    })
  })
})
