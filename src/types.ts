import { z } from "zod";
import { contactSchema, importMappingSchema } from "./schemas/importSchemas";

export enum ImportStatus {
  ON_HOLD = 'On Hold',
  PROCESSING = 'Processing',
  FAILED = 'Failed',
  FINISHED = 'Finished',
}

export type importMappingType = z.infer<typeof importMappingSchema>;

export type contactPayloadType = z.infer<typeof contactSchema>;