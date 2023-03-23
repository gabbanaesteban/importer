import { User } from "@prisma/client"
import { inject, injectable } from "inversify"
import { CURRENT_USER } from "../IoC/types"
import prisma from "../db"

@injectable()
export class ContactService {
  private user: User

  constructor(@inject(CURRENT_USER) user: User) {
    this.user = user
  }
  
  async listContacts() {
    const contacts = await prisma.contact.findMany({
      where: { ownerId:  this.user.id },
    })
    
    return contacts
  }
}
