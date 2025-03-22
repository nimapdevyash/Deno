const arr = [];
let id = 0;

Deno.serve({ port: 3000 }, async (req) => {
  const method = req.method;
  const url = new URL(req.url);
  const idParam = url.pathname.split("/")[1];
  const taskId = idParam ? parseInt(idParam) : null;

  // POST - Create a new task
  if (method === "POST") {
    const body = await req.json().catch(() => null);

    if (!body?.data) {
      return new Response(JSON.stringify({ error: "Data is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const newTask = { id: id++, data: body.data };
    arr.push(newTask);

    return new Response(
      JSON.stringify({ message: "Task added successfully", task: newTask }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // GET - Fetch a task (or all tasks)
  if (method === "GET") {
    if (taskId !== null && isNaN(taskId)) {
      return new Response(JSON.stringify({ error: "Invalid task ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (taskId !== null) {
      const task = arr.find((task) => task.id === taskId);
      if (!task) {
        return new Response(JSON.stringify({ error: "Task not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ task }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ tasks: arr }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // PUT - Update a task
  if (method === "PUT") {
    const body = await req.json().catch(() => null);

    if (!body?.id || !body?.data) {
      return new Response(
        JSON.stringify({ error: "ID and data are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const taskIndex = arr.findIndex((task) => task.id === body.id);
    if (taskIndex === -1) {
      return new Response(
        JSON.stringify({ error: "Task with that ID does not exist" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    arr[taskIndex].data = body.data;

    return new Response(
      JSON.stringify({
        message: "Task updated successfully",
        task: arr[taskIndex],
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // DELETE - Remove a task
  if (method === "DELETE") {
    if (taskId === null || isNaN(taskId)) {
      return new Response(JSON.stringify({ error: "Invalid task ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const taskIndex = arr.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
      return new Response(JSON.stringify({ error: "Task not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    arr.splice(taskIndex, 1);

    return new Response(
      JSON.stringify({ message: "Task deleted successfully" }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // Return 405 for unsupported methods
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
});
