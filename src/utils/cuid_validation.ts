import { z } from "zod";
import { isCuid } from "@paralleldrive/cuid2";

const cuidSchema = z.string().refine((value) => isCuid(value), {
  message: "Format ID tidak valid (harus CUID)",
});

export default cuidSchema;
