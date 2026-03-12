import { Env } from "../index";
import { verifyPrivyToken } from "../middleware/privyAuth";
import { checkOrCreateUser } from "../db/d1Client";

export async function handleUserRoutes(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);

    const CORS_HEADERS = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
        return new Response(null, { headers: CORS_HEADERS });
    }

	const did = await verifyPrivyToken(request, env);
	const user: any = await checkOrCreateUser(env.DB, did);


	if (url.pathname === "/api/me" && request.method === "GET") {
		return new Response(JSON.stringify({ user }), { headers: CORS_HEADERS });
	}

	if (url.pathname === "/api/conversations" && request.method === "GET") {
		const convos = await env.DB.prepare("SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC").bind(user.id).all();
		return new Response(JSON.stringify(convos.results), { headers: CORS_HEADERS });
	}

	if (url.pathname.match(/^\/api\/conversations\/[a-zA-Z0-9-]+$/)) {
		const parts = url.pathname.split("/");
		const conversationId = parts[parts.length - 1];

		if (request.method === "GET") {
			// Verify ownership
			const convo = await env.DB.prepare("SELECT * FROM conversations WHERE id = ? AND user_id = ?").bind(conversationId, user.id).first();
			if (!convo) return new Response("Not found", { status: 404, headers: CORS_HEADERS });

			const msgs = await env.DB.prepare("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC").bind(conversationId).all();
			return new Response(JSON.stringify({ conversation: convo, messages: msgs.results }), { headers: CORS_HEADERS });
		}

		if (request.method === "DELETE") {
			const convo = await env.DB.prepare("SELECT * FROM conversations WHERE id = ? AND user_id = ?").bind(conversationId, user.id).first();
			if (!convo) return new Response("Not found", { status: 404, headers: CORS_HEADERS });

			await env.DB.prepare("DELETE FROM messages WHERE conversation_id = ?").bind(conversationId).run();
			await env.DB.prepare("DELETE FROM conversations WHERE id = ?").bind(conversationId).run();
			return new Response(JSON.stringify({ success: true }), { headers: CORS_HEADERS });
		}
	}

	return new Response("Method/Route not allowed", { status: 405, headers: CORS_HEADERS });
}
