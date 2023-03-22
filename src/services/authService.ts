import { comparePassword, hashPassword } from "../utils/helpers"
import { PrismaClient } from "@prisma/client"
import createError from "http-errors"

const prisma = new PrismaClient()

export async function register(username: string, password: string) {
  const foundUser = await prisma.user.findUnique({ where: { username } })

  if (foundUser) {
    throw new createError.Conflict("User already exists")
  }

  const hashedPassword = await hashPassword(password)

  await prisma.user.create({
    data: { username, password: hashedPassword },
  })
}

export async function login(username: string, password: string) {
  const foundUser = await prisma.user.findUnique({ where: { username } })

  if (!foundUser) {
    throw new createError.NotFound("User does not exist")
  }

  const isPasswordCorrect = await comparePassword(password, foundUser.password)

  if (!isPasswordCorrect) {
    throw new createError.Unauthorized("Incorrect password")
  }

  return foundUser
}
