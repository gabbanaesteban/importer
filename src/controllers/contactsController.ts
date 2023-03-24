import { Request, Response } from "express"
import { ContactService } from "../services/ContactService"
import container from "../IoC/inversify.config"
import { CONTACTS_SERVICE } from "../IoC/types"
import { formatDate } from "../helpers/hbs"
import { composePaginationParams, paginateResults, validateParams } from "../helpers/utils"
import { listContactsSchema } from "../schemas/schemas"
import { ListContactsType } from "../types"

export async function listContacts(req: Request, res: Response) {

  const { page, limit }: ListContactsType = validateParams(req.query, listContactsSchema);

  const params = composePaginationParams(page, limit)

  const contactsService = container.get<ContactService>(CONTACTS_SERVICE)

  const contacts = await contactsService.listContacts(params)

  const { items, ...pagination } = paginateResults(contacts, page, limit)

  res.render("home", {
    data: { pagination, contacts: items },
    helpers: {
      formatDate
    },
  })
}
