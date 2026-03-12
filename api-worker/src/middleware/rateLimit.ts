import { Env } from "../index";
import { verifyPrivyToken } from "./privyAuth";

interface RateLimitRule {
    limit: number;
    windowSeconds: number;
}

export async function rateLimitMiddleware(request: Request, env: Env): Promise<Response | null> {
    const url = new URL(request.url);
    // 1. Detect user IP address securely from Cloudflare headers
    const ip = request.headers.get("CF-Connecting-IP") || "127.0.0.1";
    
    // 2. Detect authenticated user ID if available
    let userId = "";
    if (request.headers.get("Authorization")) {
        try {
            userId = await verifyPrivyToken(request, env);
        } catch (e) {
            // If the token is invalid, let the main endpoint throw the 401 later. Focus on IP limiting here.
        }
    }

    // Settings for endpoint limits (User request: 25 requests per 30 minutes)
    let ipRule: RateLimitRule | null = null;
    let userRule: RateLimitRule | null = null;
    const GLOBAL_LIMIT = 25;
    const GLOBAL_WINDOW = 30 * 60; // 1800 seconds

    if (url.pathname.startsWith("/api/")) {
        ipRule = { limit: GLOBAL_LIMIT, windowSeconds: GLOBAL_WINDOW };
        if (userId) userRule = { limit: GLOBAL_LIMIT, windowSeconds: GLOBAL_WINDOW };
    }

    // No limit required for this route
    if (!ipRule && !userRule) return null; 

    // Current timestamp 
    const now = Math.floor(Date.now() / 1000);

    const checkLimit = async (identifier: string, endpoint: string, rule: RateLimitRule) => {
        // 4. Check the database for existing rate limit record
        let record = await env.DB.prepare("SELECT * FROM rate_limits WHERE identifier = ? AND endpoint = ?")
                                 .bind(identifier, endpoint).first();
        
        if (record) {
            // EXTRA SECURITY: 10 minute penalty for repeated attacks
            if ((record.blocked_until as number) > now) {
                const waitTime = (record.blocked_until as number) - now;
                console.log(`[RateLimit] Blocked ${identifier} on ${endpoint} (penalty box)`);
                return { blocked: true, retryAfter: waitTime };
            }

            // 5. If window expired -> reset counter
            if (now - (record.window_start as number) > rule.windowSeconds) {
                await env.DB.prepare("UPDATE rate_limits SET request_count = 1, window_start = ?, blocked_until = 0 WHERE identifier = ? AND endpoint = ?")
                    .bind(now, identifier, endpoint).run();
                return { blocked: false };
            } else {
                // 6. If request_count exceeds limit -> block request
                if ((record.request_count as number) >= rule.limit) {
                    const penaltySeconds = 600; // Block IP for 10 minutes
                    const blockedUntil = now + penaltySeconds;
                    
                    // Ban in database
                    await env.DB.prepare("UPDATE rate_limits SET blocked_until = ? WHERE identifier = ? AND endpoint = ?")
                        .bind(blockedUntil, identifier, endpoint).run();
                        
                    // Log blocked requests for monitoring
                    if (identifier.startsWith("ip:")) {
                        console.log(`[RateLimit] Blocked IP ${identifier.replace('ip:', '')} on ${endpoint}`);
                    } else {
                        console.log(`[RateLimit] Blocked User ${identifier.replace('user:', '')} on ${endpoint}`);
                    }
                    return { blocked: true, retryAfter: rule.windowSeconds }; 
                } else {
                    // 7. Otherwise increment counter
                    await env.DB.prepare("UPDATE rate_limits SET request_count = request_count + 1 WHERE identifier = ? AND endpoint = ?")
                        .bind(identifier, endpoint).run();
                    return { blocked: false };
                }
            }
        } else {
            // First time requesting in a window, insert record
            const id = crypto.randomUUID();
            await env.DB.prepare("INSERT INTO rate_limits (id, identifier, endpoint, request_count, window_start, blocked_until) VALUES (?, ?, ?, 1, ?, 0)")
                .bind(id, identifier, endpoint, now).run();
            return { blocked: false };
        }
    };

    // Apply rule: Rate limit per IP address
    if (ipRule) {
        // 3. Generate identifier e.g. ip:1.2.3.4
        const ipIdentifier = `ip:${ip}`;
        const res = await checkLimit(ipIdentifier, url.pathname, ipRule);
        if (res.blocked) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Too many requests", 
                retry_after: res.retryAfter || 30 
            }), { 
                status: 429, 
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
            });
        }
    }

    // Apply rule: Rate limit per authenticated user
    if (userRule && userId) {
        // 3. Generate identifier e.g. user:user_123
        const userIdentifier = `user:${userId}`;
        const res = await checkLimit(userIdentifier, url.pathname, userRule);
        if (res.blocked) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Too many requests", 
                retry_after: res.retryAfter || 30
            }), { 
                status: 429, 
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
            });
        }
    }

    return null;
}
