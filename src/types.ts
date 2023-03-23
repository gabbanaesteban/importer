import { Import } from "@prisma/client";
import { z } from "zod";
import { contactSchema, importMappingSchema } from "./schemas/importSchemas";

export enum ImportStatus {
  ON_HOLD = 'On Hold',
  PROCESSING = 'Processing',
  FAILED = 'Failed',
  FINISHED = 'Finished',
}

export type ImportMappingType = z.infer<typeof importMappingSchema>;

export type ContactPayloadType = z.infer<typeof contactSchema>;