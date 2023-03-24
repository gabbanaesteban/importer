import { Import } from "@prisma/client";
import { z } from "zod";
import { contactSchema, importMappingSchema, listContactsSchema } from "./schemas/schemas";

export enum ImportStatus {
  ON_HOLD = 'On Hold',
  PROCESSING = 'Processing',
  FAILED = 'Failed',
  FINISHED = 'Finished',
}

export type PaginationParams = {
  skip: number;
  take: number;
}

export type ImportMappingType = z.infer<typeof importMappingSchema>;

export type ContactPayloadType = z.infer<typeof contactSchema>;

export type ListContactsType = z.infer<typeof listContactsSchema>;