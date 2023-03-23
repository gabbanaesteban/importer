import { authSchema } from "../schemas/schemas"
import { validateParams } from "../helpers/utils"
import { Request, Response } from "express"
import container from "../IoC/inversify.config"
import { AuthService } from "../services/AuthService"
import { AUTH_SERVICE } from "../IoC/types"

export async function register(req: Request, res: Response) {
  const { username, password } = validateParams(req.body, authSchema)
  
  const authService = container.get<AuthService>(AUTH_SERVICE)

  await authService.register(username, password)

  res.redirect('/login')
}

export async function login(req: Request, res: Response) {
  const { username, password } = validateParams(req.body, authSchema)

  const authService = container.get<AuthService>(AUTH_SERVICE)

  const user = await authService.login(username, password)

  req.session.user = user

  res.redirect('/')
}