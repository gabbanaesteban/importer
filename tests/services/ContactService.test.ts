import { prismaMock } from "@tests/dbMock"
import container from "@src/IoC/inversify.config"
import { buildContact, buildUser } from "@tests/generate"
import { User } from "@prisma/client"
import { CONTACTS_SERVICE, CURRENT_USER } from "@src/IoC/types"
import { ContactService } from "@src/services/ContactService"

describe("ContactService test suite", () => {
  describe("#listContacts", () => {
    it("should return a list of contacts", async () => {
      const user = buildUser({ id: 45 })
      const contact = buildContact({ ownerId: user.id })

      container.rebind<User>(CURRENT_USER).toConstantValue(user)

      prismaMock.contact.findMany.mockResolvedValueOnce([contact])

      const contactService = container.get<ContactService>(CONTACTS_SERVICE)

      const contacts = await contactService.listContacts()

      expect(prismaMock.contact.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { ownerId: user.id } }))

      expect(contacts).toEqual([contact])
    })
  })
})