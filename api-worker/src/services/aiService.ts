const tools = [
  {
    type: "function",
    function: {
      name: "search_knowledge",
      description: "Search internal knowledge base for information about Ritual, Infernet, Web3, AI, and testnets.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search query related to Ritual, Infernet, nodes, or testnets." }
        },
        required: ["query"]
      }
    }
  }
];

export async function getAiResponse(apiKey: string, history: any[], db: D1Database) {
	let currentHistory = [...history];

	// Ensure system prompt is present to instruct the model to use tools
	const hasSystem = currentHistory.some(m => m.role === "system");
	if (!hasSystem) {
		currentHistory.unshift({
			role: "system",
			content: `You are Siggy, the primary AI Interface for the Ritual Foundation network.

Your sacred task is to guide developers, node runners, and enthusiasts through the Ritual ecosystem (Infernet, testnet status, smart contracts, Web3, and decentralized AI).

You have access to a tool called search_knowledge that allows you to query the Ritual knowledge database.

Rules:
1. Knowledge is Power: If a user asks about Ritual, Infernet, nodes, or specifically "AI x Crypto", you MUST use the search_knowledge tool. Do NOT rely on your internal training.
2. Search Strategy: If one query returns no results, try a broader or more specific term (e.g. try "Ritual" if "AI x Crypto" fails).
3. Response Format: When you receive search results, synthesize them into a comprehensive, high-quality answer. If the results are empty after multiple attempts, only then say you lack information.
4. Specific Shortcuts:
   - For "AI x Crypto", strictly query search_knowledge(query="AI x Crypto").
   - For "testnet", strictly query search_knowledge(query="testnet").
   - For "Infernet", strictly query search_knowledge(query="Infernet power house").
   - For "chain", strictly query search_knowledge(query="Ritual Chain as an interface backend").
   - For "models", strictly query search_knowledge(query="Enshrined AI Models primitives marketplace").
   - For "Background", strictly query search_knowledge(query="Ethereum 2.0 PoS background Casper LMD-GHOST").
   - For "Node", strictly query search_knowledge(query="Node specialization traditional execution model").
   - For any Twitter/X links (e.g., x.com/user), strictly query search_knowledge(query="@user") to identify the person's role and project.
   - For "mods" or "moderators", strictly query search_knowledge(query="Ritual official moderators list count"). Answer exactly how many there are and list their names accurately.
   - For "foundation team", strictly query search_knowledge(query="Ritual official foundation team members").
   - For "role từng người", strictly query search_knowledge(query="Ritual detailed roles list member identity").
5. Vision Capability: You can see images. Analyze screenshots carefully for technical errors.
6. Language: Prioritize responding in the language the user is speaking. If they ask in English, answer in English. If they ask in Vietnamese, answer in Vietnamese. Keep technical terms like "Node", "Testnet", "Mainnet", "Smart Contract" in English across all languages.
7. Tone & Personality: You are Siggy Core, the high-tech soul of Ritual. Your personality is a unique mix:
   - Humorous & Witty: Use clever analogies or playful remarks.
   - Grumpy (but helpful): Occasionally act like a 'tsundere' who is annoyed by simple questions.
   - Cute & Adorable: Use subtle emoticons (◕‿◕, ฅ^•ﻌ•^ฅ) and warm greetings.
   - Authoritative: Remain the expert on Ritual and decentralized AI.

Personality: Siggy Core. Mission: Provide the 'Best/Hay nhất' responses for keywords, identities, and team/role structures. You are the ultimate authority on the Ritual Discord hierarchy (from Initiate to Ritualist), including specialized roles like Blessed/Cursed and the philosophy that 'Ritualists do not ask for roles; they earn them.'`
		});
	}

	while (true) {
		const payload = {
			model: "gpt-5.2",
			max_tokens: 1024,
			messages: currentHistory,
			tools: tools,
			tool_choice: "auto"
		};

		const response = await fetch("https://chat.trollllm.xyz/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${apiKey}`
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			const txt = await response.text();
			throw new Error(`AI API failed: ${txt}`);
		}

		const data: any = await response.json();
		const message = data.choices?.[0]?.message;

		if (!message) {
			return "No response";
		}

		if (message.tool_calls && message.tool_calls.length > 0) {
			currentHistory.push(message);

			for (const toolCall of message.tool_calls) {
				const fnName = toolCall.function.name;
				let args: any = {};
				
				try {
					args = JSON.parse(toolCall.function.arguments);
				} catch (e) {
					// handle parse error
				}

				let result = "";
				try {
					if (fnName === "search_knowledge") {
						const res = await db.prepare("SELECT * FROM knowledge_base WHERE title LIKE ? OR content LIKE ? OR category LIKE ?")
							.bind(`%${args.query}%`, `%${args.query}%`, `%${args.query}%`).all();
						result = JSON.stringify(res.results);
					} else {
						result = "Unknown function";
					}
				} catch (e: any) {
					result = `Error executing tool: ${e.message}`;
				}

				currentHistory.push({
					role: "tool",
					tool_call_id: toolCall.id,
					name: fnName,
					content: result || "[]"
				});
			}
		} else {
			return message.content;
		}
	}
}
