import { prismaMock } from "@tests/dbMock"
import { Conflict } from "http-errors"
import container from "@src/IoC/inversify.config"
import { AUTH_SERVICE } from "@src/IoC/types"
import { AuthService } from "@src/services/AuthService"
import { buildUser } from "@tests/generate"
import { hashPassword } from "@src/helpers/utils"

describe("AuthService test suite", () => {
  describe("#register", () => {
    it("show throw an Conflict error if user already exists", async () => {
      const user = buildUser()

      prismaMock.user.findUnique.mockResolvedValueOnce(user)

      const authService = container.get<AuthService>(AUTH_SERVICE)

      await expect(authService.register(user.username, user.password)).rejects.toThrowError(Conflict)

      expect(prismaMock.user.create).not.toHaveBeenCalled()
    })

    it("should create an user", async () => {
      const user = buildUser()

      prismaMock.user.findUnique.mockResolvedValueOnce(null)
      prismaMock.user.create.mockResolvedValueOnce(user)

      const authService = container.get<AuthService>(AUTH_SERVICE)

      await authService.register(user.username, user.password)

      expect(prismaMock.user.create).toHaveBeenCalledWith({ data: { username: user.username, password: expect.any(String) } })
    })
  })

  describe("#login", () => {
    it("should throw an error if user does not exist", async () => {
      const user = buildUser()

      prismaMock.user.findUnique.mockResolvedValueOnce(null)

      const authService = container.get<AuthService>(AUTH_SERVICE)

      await expect(authService.login(user.username, user.password)).rejects.toThrowError()

      expect(prismaMock.user.create).not.toHaveBeenCalled()
    })

    it("should throw an error if password is incorrect", async () => {
      const user = buildUser()

      prismaMock.user.findUnique.mockResolvedValueOnce(user)

      const authService = container.get<AuthService>(AUTH_SERVICE)

      await expect(authService.login(user.username, "wrong password")).rejects.toThrowError()

      expect(prismaMock.user.create).not.toHaveBeenCalled()
    })

    it("should return an user", async () => {
      const user = buildUser()
      const hashedPassword = await hashPassword(user.password)

      prismaMock.user.findUnique.mockResolvedValueOnce({
        ...user,
        password: hashedPassword,
      })

      const authService = container.get<AuthService>(AUTH_SERVICE)

      const foundUser = await authService.login(user.username, user.password)

      expect(foundUser.id).toEqual(user.id)
      expect(foundUser.username).toEqual(user.username)
    })
  })
})
