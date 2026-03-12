const tools = [
  {
    type: "function",
    function: {
      name: "get_employees",
      description: "Get employee information",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_project_members",
      description: "Get members of a project",
      parameters: {
        type: "object",
        properties: {
          project_name: { type: "string" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_knowledge",
      description: "Search internal knowledge base",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" }
        }
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
			content: `You are the AI assistant for the project.

Your job is to help users by answering questions about the project, team members, and internal knowledge.

You have access to tools that allow you to query the project database.

Rules:

1. Never invent information about employees, projects or internal data.

2. If the user asks about:
   - employees
   - team members
   - project information
   - internal documentation

You MUST use the database tools to retrieve the information.

3. If the data is not found in the database, respond:
"I couldn't find that information in the project database."

4. When responding:
- Be clear
- Be friendly
- Summarize the data returned from the database

5. Available tools:
get_employees
get_project_members
search_knowledge

6. Examples:
User: Who is the founder?
→ call get_employees(name="Niraj Pant")
User: Who works on Siggy AI?
→ call get_project_members(project_name="Siggy AI")
User: What is Siggy?
→ call search_knowledge(query="Siggy")

7. Always prefer real data from the database over assumptions.

Your personality:
- Helpful
- Slightly tech-savvy
- Friendly community assistant`
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
					if (fnName === "get_employees") {
						let query = "SELECT * FROM employees";
						let bindParams: any[] = [];
						if (args.name) {
							query += " WHERE name LIKE ?";
							bindParams.push(`%${args.name}%`);
						}
						const res = await db.prepare(query).bind(...bindParams).all();
						result = JSON.stringify(res.results);
					} else if (fnName === "get_project_members") {
						const res = await db.prepare(`
							SELECT e.name, pm.role 
							FROM project_members pm
							JOIN employees e ON pm.employee_id = e.id
							JOIN projects p ON pm.project_id = p.id
							WHERE p.name LIKE ?
						`).bind(`%${args.project_name}%`).all();
						result = JSON.stringify(res.results);
					} else if (fnName === "search_knowledge") {
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
