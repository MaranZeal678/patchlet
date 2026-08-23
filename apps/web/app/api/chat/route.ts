/** Streams one support turn to the widget as server-sent events. */
import { preflight, withCors } from "@/lib/cors";
import { serviceClient } from "@/lib/supabase";
import { runTurn } from "@/lib/agent/turn";
import type { ChatRequest } from "@patchlet/shared";

export const runtime = "nodejs";
export const maxDuration = 300;

export function OPTIONS(): Response {
  return preflight();
}

type Body = Partial<ChatRequest>;

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => ({}))) as Body;
  const { key, question, page } = body;
  if (!key || !question || !page) {
    return withCors(Response.json({ error: "key, question and page are required" }, { status: 400 }));
  }

  const { data: project } = await serviceClient()
    .from("project")
    .select("id, repo_full_name, repo_default_branch")
    .eq("embed_key", key)
    .maybeSingle();
  if (!project) {
    return withCors(Response.json({ error: "unknown key" }, { status: 403 }));
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: { type: string } & Record<string, unknown>): void => {
        controller.enqueue(encoder.encode(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`));
      };
      try {
        for await (const event of runTurn({
          projectId: project.id as string,
          repoFullName: (project.repo_full_name as string) ?? null,
          defaultBranch: (project.repo_default_branch as string) ?? "main",
          question,
          page,
          conversationId: body.conversationId,
          continueFrom: body.continueFrom,
          visitorId: typeof body.visitorId === "string" ? body.visitorId.slice(0, 64) : undefined,
        })) {
          send(event);
        }
      } catch (error) {
        send({ type: "error", message: (error as Error).message });
      } finally {
        controller.close();
      }
    },
  });

  return withCors(
    new Response(stream, {
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive",
      },
    }),
  );
}
