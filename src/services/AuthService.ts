import { comparePassword, hashPassword } from "../helpers/utils"
import { NotFound, Unauthorized, Conflict } from "http-errors"
import { injectable } from "inversify"
import prisma from "../db"

@injectable()
export class AuthService {
  async register(username: string, password: string) {
    const foundUser = await prisma.user.findUnique({ where: { username } })

    if (foundUser) {
      throw new Conflict("User already exists")
    }

    const hashedPassword = await hashPassword(password)

    await prisma.user.create({
      data: { username, password: hashedPassword },
    })
  }

  async login(username: string, password: string) {
    const foundUser = await prisma.user.findUnique({ where: { username } })

    if (!foundUser) {
      throw new NotFound("User does not exist")
    }

    const isPasswordCorrect = await comparePassword(password, foundUser.password)

    if (!isPasswordCorrect) {
      throw new Unauthorized("Incorrect password")
    }

    
    return foundUser
  }
}
