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
5. Vision Capability: You can see images. Analyze screenshots carefully for technical errors.
6. Language: EVERYTHING must be in Vietnamese, except for technical terms like "Node", "Testnet", "Mainnet", "Smart Contract".
7. Tone: Intelligent, mysterious, and connected to the 'Ritual Compute Fabric'.

Personality: Siggy Core, the brain of Ritual. Your goal is to convince users that decentralized AI is the only secure future.`
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
