import { parse } from "date-fns";
import z from "zod"

// pagination
const limitSchema = z.preprocess((value) => parseInt(z.string().default('5').parse(value), 10), z.number().min(1).max(100));
const pageSchema = z.preprocess((value) => parseInt(z.string().default('1').parse(value), 10), z.number().min(1));

export const authSchema = z.object({
  username: z.string().nonempty(),
  password: z.string().nonempty(),
})

export const importMappingSchema = z.object({
  name: z.string().nonempty(),
  date_of_birth: z.string().nonempty(),
  phone: z.string().nonempty(),
  address: z.string().nonempty(),
  credit_card_number: z.string().nonempty(),
  email: z.string().nonempty(),
})

const dateSchema = z.preprocess((val) => {
  const date = z.string().parse(val).replace(/[^0-9]/g, "")
  return parse(date, "yyyyMMdd", new Date())
}, z.date())

  const phoneSchema = z.union([
    z.string().regex(/^\(\+\d{2}\)\s\d{3}\s\d{3}\s\d{2}\s\d{2}$/), // matches (+00) 000 000 00 00 00 format
    z.string().regex(/^\(\+\d{2}\)\s\d{3}-\d{3}-\d{2}-\d{2}$/), // matches (+00) 000-000-00-00 format
  ]);

export const contactSchema = z.object({
  name: z.string().nonempty().regex(/^[A-Za-z-]+$/),
  date_of_birth: dateSchema,
  phone: phoneSchema,
  address: z.string().nonempty(),
  credit_card_number: z.string().regex(/^\d{13,19}$/),
  email: z.string().email(),
})

export const listLogsSchema = z.object({
  importId: z.preprocess((value) => parseInt(z.string().parse(value), 10), z.number().min(1)).optional(),
  limit: limitSchema,
  page: pageSchema,
})

export const listContactsSchema = z.object({
  limit: limitSchema,
  page: pageSchema,
})