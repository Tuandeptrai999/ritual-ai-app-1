import { PrivyClient } from "@privy-io/server-auth";
import { Env } from "../index";
import { checkOrCreateUser } from "../db/d1Client";

export async function verifyPrivyToken(request: Request, env: Env) {
	const authHeader = request.headers.get("Authorization");
	if (!authHeader?.startsWith("Bearer ")) {
		const err: any = new Error("Missing or invalid Authorization header");
		err.status = 401;
		throw err;
	}

	const token = authHeader.split(" ")[1];
	if (!token) {
		const err: any = new Error("Missing token");
		err.status = 401;
        throw err;
    }

	const privy = new PrivyClient(env.PRIVY_APP_ID, env.PRIVY_APP_SECRET);
	
	try {
		const verifiedClaims = await privy.verifyAuthToken(token);
		const did = verifiedClaims.userId;
		await checkOrCreateUser(env.DB, did);
		return did;
	} catch (error: any) {
        console.error("Privy Verification Error:", error.message, error.stack);
        const err: any = new Error(`Invalid token: ${error.message}`);
		err.status = 401;
		throw err;
	}
}
