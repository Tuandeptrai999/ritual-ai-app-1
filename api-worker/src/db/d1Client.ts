export async function checkOrCreateUser(db: D1Database, did: string) {
	const existing = await db.prepare("SELECT * FROM users WHERE privy_did = ?").bind(did).first();
	if (!existing) {
		const id = crypto.randomUUID();
		await db.prepare("INSERT INTO users (id, privy_did) VALUES (?, ?)").bind(id, did).run();
		return { id, privy_did: did };
	}
	return existing;
}

export async function createConversation(db: D1Database, userId: string, title: string) {
	const id = crypto.randomUUID();
	await db.prepare("INSERT INTO conversations (id, user_id, title) VALUES (?, ?, ?)").bind(id, userId, title).run();
	return id;
}

export async function saveMessage(db: D1Database, conversationId: string, role: string, content: string) {
	const id = crypto.randomUUID();
	await db.prepare("INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)").bind(id, conversationId, role, content).run();
	return id;
}
