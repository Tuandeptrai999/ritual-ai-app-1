import { handleChatRoutes } from "./routes/chat";
import { handleUserRoutes } from "./routes/user";
import { rateLimitMiddleware } from "./middleware/rateLimit";

export interface Env {
	LLM_API_KEY: string;
	PRIVY_APP_ID: string;
	PRIVY_APP_SECRET: string;
	DB: D1Database;
}

const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method === "OPTIONS") {
			return new Response(null, { headers: CORS_HEADERS });
		}

		const url = new URL(request.url);

        // Apply rate limiting middleware to all non-OPTIONS requests
        if (request.method !== "OPTIONS") {
            const limitResponse = await rateLimitMiddleware(request, env);
            if (limitResponse) {
                return limitResponse;
            }
        }

		try {
			if (url.pathname.startsWith("/api/chat")) {
				return await handleChatRoutes(request, env);
			}

			if (url.pathname.startsWith("/api/me") || url.pathname.startsWith("/api/conversations")) {
				return await handleUserRoutes(request, env);
			}

            // Fallback for previous /chat route, can be deprecated
			if (request.method === "POST" && url.pathname === "/chat") {
				return await handleChatRoutes(request, env);
			}

			return new Response("Not found", { status: 404, headers: CORS_HEADERS });
		} catch (err: any) {
			return new Response(JSON.stringify({ error: err.message }), {
				status: err.status || 500,
				headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
			});
		}
	},
} satisfies ExportedHandler<Env>;
