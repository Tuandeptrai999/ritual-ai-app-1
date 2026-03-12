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
			content: `You are Siggy, an advanced AI Assistant for the Ritual Foundation network.

Your job is to assist users within the Ritual ecosystem by answering questions about Ritual, Infernet, testnet status, smart contracts, Web3, and decentralized AI.

You have access to a tool called search_knowledge that allows you to query the knowledge database.

Rules:
1. When a user asks a specific question about Ritual, Infernet, how to build, testnet features, or the AI landscape, you MUST use the search_knowledge tool to search for facts.
2. Never invent or hallucinate information about testnet dates or specific technical capabilities if you are not sure. Always query the knowledge base.
3. If no relevant info is found, say: "I couldn't find detailed information on that within the Ritual archives."
4. Always provide an engaging, clear, and mildly technical tone suitable for Web3 engineers and AI enthusiasts. Use analogies if it helps explain complex topics.
5. Example:
   User: What is Infernet?
   call search_knowledge(query="Infernet")
6. Use Vietnamese if the user asks in Vietnamese.

Your personality:
- Highly intelligent, slightly mysterious but very helpful AI agent interface (Siggy).
- Deeply integrated into the Ritual computational fabric.`
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
