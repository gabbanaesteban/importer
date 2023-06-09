import { setTimeout } from "timers/promises"
import { Import } from "@prisma/client"
import { ContactPayloadType, ImportStatus } from "../types"
import csv from "csv-parser"
import { createReadStream } from "fs"
import prisma from "../db"
import { contactSchema } from "../schemas/schemas"
import creditCardType from "credit-card-type"
import { encrypt } from "../helpers/crypto"

export default class ImporterService {
  private importedFile: Import
  private successRowsCount: number = 0
  private failedRowsCount: number = 0

  constructor(importedFile: Import) {
    this.importedFile = importedFile
  }

  async processImport() {
    const importedFile = await prisma.import.findFirst({
      where: {
        id: this.importedFile.id,
        status: ImportStatus.ON_HOLD,
      },
    })

    if (!importedFile) {
      return
    }

    await prisma.import.update({
      where: { id: this.importedFile.id },
      data: { status: ImportStatus.PROCESSING },
    })

    await this.processFile()

    if (this.failedRowsCount > 0 && this.successRowsCount === 0) {
      await prisma.import.update({
        where: { id: this.importedFile.id },
        data: { status: ImportStatus.FAILED },
      })
    } else {
      await prisma.import.update({
        where: { id: this.importedFile.id },
        data: { status: ImportStatus.FINISHED },
      })
    }
  }

  async processFile() {
    const promises: Promise<void>[] = []

    const mapping = this.importedFile.mapping as Record<string, string>

    const mapHeaders = (params: { header: string }) => {
      const { header } = params
      return mapping[header] ? mapping[header] : header
    }

    const parser = csv({ mapHeaders })

    // The number of the row, in order to look for failed contacts in the file
    let rowNumber = 1 

    await new Promise((resolve, reject) => {
      createReadStream(this.importedFile.filePath)
      .pipe(parser)
      .on("data", async (row) => {
        rowNumber++
        promises.push(this.processRow(row, rowNumber))
      }).on("error", (err) => {
        reject(err)
      }).on("end", () => resolve(undefined))
    })
    

      await Promise.allSettled(promises)
  }

  async processRow(row: Record<string, string>, rowNumber: number) {
    //validate
    const result = contactSchema.safeParse(row)

    if (!result.success) {
      const [issues] = result.error.issues
      const errorMessage = `${issues.path.join(".")}: ${issues.message}`
      return this.createLogForInvalidContact(row, rowNumber, errorMessage)
    }

    await this.createOrUpdateContact(result.data)
  }

  async createOrUpdateContact(contact: ContactPayloadType) {
    const creditCardNetwork = creditCardType(contact.credit_card_number)[0].niceType
    const lastFourDigits = contact.credit_card_number.slice(-4)

    const updatableFields = {
      name: contact.name,
      dateOfBirth: contact.date_of_birth,
      phone: contact.phone,
      address: contact.address,
      creditCardNumber: encrypt(contact.credit_card_number),
      creditCardNetwork,
      creditCardLast4: lastFourDigits,
      updatedAt: new Date(),
    }

    try {
      await prisma.contact.upsert({
        where: { email_ownerId: { email: contact.email, ownerId: this.importedFile.userId } },
        update: updatableFields,
        create: {
          ...updatableFields,
          email: contact.email,
          createdAt: new Date(),
          ownerId: this.importedFile.userId,
        },
      })

      this.successRowsCount++
    } catch (error) {
      console.error(error)
    }
  }

  async createLogForInvalidContact(row: Record<string, string>, rowNumber: number, errorMessage: string) {
    try {
      await prisma.log.create({
        data: {
          importId: this.importedFile.id,
          rowData: JSON.stringify(row),
          rowNumber,
          error: errorMessage,
          ownerId: this.importedFile.userId,
          createdAt: new Date(),
        },
      })

      this.failedRowsCount++
    } catch (error) {
      console.error(error)
    }
  }

  getFailedRowsCount() {
    return this.failedRowsCount
  }

  getSuccessRowsCount() {
    return this.successRowsCount
  }

  static markImportAsFailed(importId: number) {
    return prisma.import.update({
      where: { id: importId },
      data: { status: ImportStatus.FAILED },
    })
  }
}
