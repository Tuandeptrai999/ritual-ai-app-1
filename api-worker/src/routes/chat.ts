import { Env } from "../index";
import { verifyPrivyToken } from "../middleware/privyAuth";
import { checkOrCreateUser, createConversation, saveMessage } from "../db/d1Client";
import { getAiResponse } from "../services/aiService";

export async function handleChatRoutes(request: Request, env: Env): Promise<Response> {
	if (request.method !== "POST" && request.method !== "OPTIONS") {
		return new Response("Method not allowed", { status: 405 });
	}

    const CORS_HEADERS = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };

    if (request.method === "OPTIONS") {
        return new Response(null, { headers: CORS_HEADERS });
    }

	const did = await verifyPrivyToken(request, env);
	const user: any = await checkOrCreateUser(env.DB, did);

	const body = await request.json() as any;
	if (!body || !body.message) {
		return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
	}

	let conversationId = body.conversationId;
	if (!conversationId) {
		const title = body.message.substring(0, 30) || "New Conversation";
		conversationId = await createConversation(env.DB, user.id, title);
	}

	await saveMessage(env.DB, conversationId, "user", body.message);

    const historyResult = await env.DB.prepare("SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC").bind(conversationId).all();
    const history = historyResult.results.map((r: any) => ({ role: r.role, content: r.content }));

	const aiResponseText = await getAiResponse(env.LLM_API_KEY, history, env.DB);

	await saveMessage(env.DB, conversationId, "assistant", aiResponseText);

	return new Response(JSON.stringify({ 
        conversationId,
        message: aiResponseText 
    }), {
        headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS
        }
    });
}
