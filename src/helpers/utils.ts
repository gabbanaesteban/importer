import { PaginationParams } from "../types"
import bcrypt from "bcrypt"
import { BadRequest } from "http-errors"
import { z, ZodType, ZodTypeDef } from "zod"

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

export const validateParams = (data: unknown, schema: ZodType<any, ZodTypeDef, any>): z.infer<typeof schema> => {
  const validation = schema.safeParse(data)

  if (validation.success) {
    return validation.data
  }

  const [error] = validation.error.issues

  throw new BadRequest(`Validation Error - ${error.path.join(".")}: ${error.message}`)
}

export function swapObjectProps(obj: Record<string, string | number>) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[value] = key
    return acc
  }, {} as Record<string, string | number>)
}

export function composePaginationParams(page: number, limit: number): PaginationParams {
  return {
    skip: (page - 1) * limit,
    take: limit + 1,
  }
}

export function paginateResults<T>(results: T[], page:number, limit: number) {
  const hasMore = results.length > limit
  const items = hasMore ? results.slice(0, -1) : results
  return { 
    items,
    nextPage: hasMore ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
    limit,
  }
}
