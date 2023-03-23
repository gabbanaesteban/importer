import { Import } from "@prisma/client"
import { contactPayloadType, ImportStatus } from "../types"
import csv from "csv-parser"
import { createReadStream } from "fs"
import prisma from "../db"
import { contactSchema } from "../schemas/importSchemas"
import creditCardType from "credit-card-type"

export default class ImporterWorker {
  private importedFile: Import

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
      where: {
        id: this.importedFile.id,
      },
      data: {
        status: ImportStatus.PROCESSING,
      },
    })

    await this.processFile()
  }

  async processFile() {
    // TODO: Use mapping to process file
    const mapping = {
      Name: "name",
      "Date of Birth": "date_of_birth",
      Phone: "phone",
      Address: "address",
      "Credit Card Number": "credit_card_number",
      Email: "email",
    } as Record<string, string>

    const mapHeaders = (params: { header: string }) => {
      const { header } = params
      return mapping[header] ? mapping[header] : header
    }

    const parser = csv({ mapHeaders })

    return new Promise<void>((resolve, reject) => {
      let rowCount = 1

      const readStream = createReadStream(this.importedFile.filePath)

      readStream.on("error", (error) => {
        reject(error)
      })

      readStream
        .pipe(parser)
        .on("data", async (row) => {
          rowCount++
          await this.processRow(row, rowCount)
        })
        .on("end", () => {
          resolve()
        })
    })
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

  async createOrUpdateContact(contact: contactPayloadType) {
    const creditCardNetwork = creditCardType(contact.credit_card_number)[0].niceType
    const lastFourDigits = contact.credit_card_number.slice(-4)

    const updatableFields = {
      name: contact.name,
      dateOfBirth: contact.date_of_birth,
      phone: contact.phone,
      address: contact.address,
      creditCardNumber: contact.credit_card_number,
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
    } catch (error) {
      console.error(error)
    }
  }
}
