/** Streams one support turn to the widget as server-sent events. */
import { preflight, withCors } from "@/lib/cors";
import { serviceClient } from "@/lib/supabase";
import { runTurn } from "@/lib/agent/turn";
import type { PageContext } from "@patchlet/shared";

export const runtime = "nodejs";
export const maxDuration = 300;

export function OPTIONS(): Response {
  return preflight();
}

type Body = {
  key?: string;
  question?: string;
  page?: PageContext;
  conversationId?: string;
  continueFrom?: number;
};

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => ({}))) as Body;
  if (!body.key || !body.question || !body.page) {
    return withCors(Response.json({ error: "key, question and page are required" }, { status: 400 }));
  }

  const { data: project } = await serviceClient()
    .from("project")
    .select("id, repo_full_name, repo_default_branch")
    .eq("embed_key", body.key)
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
          question: body.question as string,
          page: body.page as PageContext,
          conversationId: body.conversationId,
          continueFrom: body.continueFrom,
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
