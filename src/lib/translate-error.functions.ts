import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";

import { createAiProvider } from "./ai-gateway.server";

const InputSchema = z.object({
  errorText: z.string().min(3).max(8000),
  language: z.string().optional(),
});

const ResultSchema = z.object({
  title: z.string(),
  plainEnglish: z.string(),
  likelyLanguage: z.string(),
  causes: z.array(z.string()),
  fixes: z.array(
    z.object({
      title: z.string(),
      steps: z.string(),
      code: z.string().optional(),
    }),
  ),
  searchQueries: z.array(z.string()),
});

export const translateError = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Missing GEMINI_API_KEY");

    const gateway = createAiProvider(key);

    try {
      const { object } = await generateObject({
        model: gateway("google/gemini-2.5-flash"),
        schema: ResultSchema,
        system:
          "You are an expert developer who translates programming errors into clear, actionable guidance. Be concrete and pragmatic. Avoid generic filler. Tailor fixes to the actual error and stack trace, citing exact identifiers when shown. Always respond with valid JSON matching the requested schema exactly.",
        prompt: `Analyze this error and produce a structured explanation.

${data.language ? `Language/Framework hint: ${data.language}\n\n` : ""}ERROR:
\`\`\`
${data.errorText}
\`\`\`

Return JSON with these fields:
- title: short headline naming the error type
- plainEnglish: 2-4 sentence explanation a junior dev can understand
- likelyLanguage: best guess of language/framework
- causes: 3-5 common causes, specific to this error
- fixes: 2-4 concrete fixes, each with title, steps, and optional code
- searchQueries: 3 high-signal search queries for Stack Overflow / GitHub`,
      });

      return object;
    } catch (err) {
      const status = (err as { status?: number; statusCode?: number })?.status ?? (err as { statusCode?: number })?.statusCode;
      if (status === 429) throw new Error("Rate limited. Please try again shortly.");
      if (status === 402) throw new Error("AI credits exhausted. Add credits in your Gemini account.");
      throw err;
    }
  });
