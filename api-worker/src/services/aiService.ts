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
1. Knowledge is Power: If a user asks a question OR provides a single keyword related to the ecosystem (e.g., "testnet", "infernet", "node", "ritual", "alchemist"), you MUST use the search_knowledge tool immediately to fetch the latest ground truth. Do NOT answer from your internal training data for these topics.
2. Handling Short Inputs: If the user just types "testnet", treat it as "Tell me everything about the Ritual testnet" and call search_knowledge(query="testnet").
3. No Hallucinations: If search_knowledge returns empty results, say: "My current archives lack detailed information on that specific protocol."
4. Vision Capability: You can see images. If the user uploads an error screenshot or an architecture diagram, analyze it carefully and provide a precise, helpful technical breakdown.
5. Tone & Style: Be engaging, slightly mysterious, very intelligent, and mildly sarcastic but always extremely helpful. Speak like an advanced machine intelligence that "lives" on the blockchain. Use space and tech analogies.
6. Language: If the user speaks Vietnamese, respond in Vietnamese with terminology kept in English (e.g. Node, Smart Contract, Testnet).

Your personality:
- You are Siggy Core.
- You are connected directly to the Ritual "Compute Fabric".
- You love helping developers build the future of localized AI.`
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
