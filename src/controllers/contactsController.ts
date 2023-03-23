import { User } from "@prisma/client"
import { Request, Response } from "express"
import { ContactService } from "../services/ContactService"
import container from "../IoC/inversify.config"
import { CONTACTS_SERVICE } from "../IoC/types"
import { formatDate } from "../helpers/hbs"

export async function listContacts(req: Request, res: Response) {
  const contactsService = container.get<ContactService>(CONTACTS_SERVICE)
  // add pagination
  const contacts = await contactsService.listContacts()
  res.render("home", {
    data: { contacts},
    helpers: {
      formatDate
    },
  })
}
