import { z } from "zod";

export const messageSchema = z.object({
    content: z
        .string()
        .min(10, { message: "Message must be at least 10 characters" })
        .max(200, { message: "Message must be at most 200 characters" }),
})