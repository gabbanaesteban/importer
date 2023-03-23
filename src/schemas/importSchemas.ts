import { parseDate } from "../utils/helpers";
import z from "zod"

export const importMappingSchema = z.object({
  name: z.string().nonempty(),
  date_of_birth: z.string().nonempty(),
  phone: z.string().nonempty(),
  address: z.string().nonempty(),
  credit_card_number: z.string().nonempty(),
  email: z.string().nonempty(),
})

const dateSchema = z.preprocess((value) => parseDate(value as string), z.date());

  const phoneSchema = z.union([
    z.string().regex(/^\(\+\d{2}\)\s\d{3}\s\d{3}\s\d{2}\s\d{2}$/), // matches (+00) 000 000 00 00 00 format
    z.string().regex(/^\(\+\d{2}\)\s\d{3}-\d{3}-\d{2}-\d{2}$/), // matches (+00) 000-000-00-00 format
  ]);

export const contactSchema = z.object({
  name: z.string().nonempty(),// TODO add regex for name: only - and letters
  date_of_birth: dateSchema,
  phone: phoneSchema,
  address: z.string().nonempty(),
  credit_card_number: z.string().regex(/^\d{13,19}$/),
  email: z.string().email(),
})
