import { TaskProcessor } from "../task-processor";

async function handler(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const processor = new TaskProcessor();
  await processor.processQueue();
  return Response.json({ success: true });
}

export async function GET(request: Request) {
  return await handler(request);
}

export async function POST(request: Request) {
  return await handler(request);
}
