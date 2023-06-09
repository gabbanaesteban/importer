import { Contact, Import, Log, User } from "@prisma/client"
import { ImportStatus } from "@src/types"

export function buildUser(userData: Partial<User> = {}): User {
  return {
    id: 1,
    username: "user",
    password: "password",
    ...userData,
  }
}

export function buildContact(contactData: Partial<Contact> = {}): Contact {
  return {
    id: 1,
    name: "Esteban",
    dateOfBirth: new Date("1990-01-01"),
    phone: "123456789",
    address: "Fake St 123",
    creditCardNumber: "123456789",
    creditCardNetwork: "Mastercard",
    creditCardLast4: "6789",
    email: "foo@bar.com",
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: 1,
    ...contactData,
  }
}

export function buildRawContact(data: any = {}) {
  return {
    name: "John-Doe",
    date_of_birth: "1990-01-01",
    phone: "(+01) 555-123-45-67",
    address: "123 Main St",
    credit_card_number: "4111111111111111",
    email: "john.doe@example.com",
    ...data,
  }
}

export function buildLog(logData: Partial<Log> = {}): Log {
  return {
    id: 1,
    importId: 1,
    ownerId: 1,
    rowData: { foo: "bar" },
    rowNumber: 5,
    error: "Error",
    createdAt: new Date(),
    ...logData,
  }
}

export function buildImport(importData: Partial<Import> = {}): Import {
  return {
    id: 1,
    originalName: "mixed.csv",
    filePath: "/tmp/123456789.csv",
    status: ImportStatus.ON_HOLD,
    createdAt: new Date(),
    userId: 1,
    mapping: {},
    ...importData,
  }
}

export function buildFile(fileData: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    originalname: "mixed.csv",
    path: "/tmp/123456789.csv",
    ...fileData,
  } as Express.Multer.File
}
