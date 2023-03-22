import { authSchema } from "../schemas/authSechemas"
import { validateParams } from "../utils/helpers"
import { register as registerUser, login as logUserIn } from "../services/authService"
import { Request, Response } from "express"

export async function register(req: Request, res: Response) {
  const { username, password } = validateParams(req.body, authSchema)

  await registerUser(username, password)

  res.redirect('/login')
}

export async function login(req: Request, res: Response) {
  const { username, password } = validateParams(req.body, authSchema)

  const user = await logUserIn(username, password)

  req.session.user = user

  res.redirect('/')
}