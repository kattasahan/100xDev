import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "@katta_sahan/medium-common";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRouter.use("/*", async (c, next) => {
  const authHeader = c.req.header("authorization") || "";
  try {
    const user = await verify(authHeader, c.env.JWT_SECRET);
    if (user) {
      c.set("userId", user.id);
      await next();
    } else {
      c.status(403);
      return c.json({
        message: "You are not logged in",
      });
    }
  } catch (e) {
    c.status(403);
    return c.json({ message: "You are not logged in" });
  }
});

blogRouter.post("/", async (c) => {
  const body = await c.req.json();
  const { success } = createBlogInput.safeParse(body);

  if (!success) {
    c.status(411);
    return c.json({ message: "Incorrect Inputs" });
  }
  const authorId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const post = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: Number(authorId),
    },
  });

  return c.json({
    id: post.id,
  });
});

blogRouter.put("/", async (c) => {
  const body = await c.req.json();
  const { success } = updateBlogInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ message: "Incorrect inputs" });
  }
  const prisma = await new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const post = await prisma.post.update({
    where: { id: body.id },
    data: { title: body.title, content: body.content },
  });

  return c.json({
    id: post.id,
  });
});

blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const posts = await prisma.post.findMany({
    select: {
      content: true,
      title: true,
      id: true,
      published: true,
      postedOn: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  return c.json({ posts });
});

blogRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = await new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      select: {
        title: true,
        content: true,
        published: true,
        postedOn: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    });
    return c.json({
      post,
    });
  } catch (e) {
    c.status(411);
    return c.json({ message: "Error while fetching blog post" });
  }
});
