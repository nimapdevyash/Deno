const tasks: { id: number, title: string, completed: boolean }[] = [];
let currentId = 1;

Deno.serve({ port: 3000 }, async (req) => {
  const url = new URL(req.url);
  const method = req.method;

  if (url.pathname === "/tasks" && method === "POST") {
    // Create a new task
    const body = await req.json().catch(() => null);
    if (!body || !body.title) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const newTask = { id: currentId++, title: body.title, completed: false };
    tasks.push(newTask);
    return new Response(JSON.stringify(newTask), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.pathname === "/tasks" && method === "GET") {
    // Get all tasks
    return new Response(JSON.stringify(tasks), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.pathname.startsWith("/tasks/") && method === "GET") {
    // Get a single task by ID
    const id = parseInt(url.pathname.split("/")[2]);
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      return new Response(JSON.stringify({ error: "Task not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(task), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.pathname.startsWith("/tasks/") && method === "PUT") {
    // Update a task
    const id = parseInt(url.pathname.split("/")[2]);
    const body = await req.json().catch(() => null);
    const task = tasks.find((t) => t.id === id);

    if (!task || !body || body.completed === undefined) {
      return new Response(
        JSON.stringify({ error: "Invalid input or task not found" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    task.completed = body.completed;
    return new Response(JSON.stringify(task), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.pathname.startsWith("/tasks/") && method === "DELETE") {
    // Delete a task
    const id = parseInt(url.pathname.split("/")[2]);
    const index = tasks.findIndex((t) => t.id === id);

    if (index === -1) {
      return new Response(JSON.stringify({ error: "Task not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    tasks.splice(index, 1);
    return new Response(JSON.stringify({ message: "Task deleted" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
});
