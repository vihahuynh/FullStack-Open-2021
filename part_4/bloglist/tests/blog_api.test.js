const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");
const request = require("superagent");
const { response } = require("express");

beforeEach(async () => {
  await Blog.deleteMany({});
  for (let blog of helper.initBlogs) {
    let blogObject = new Blog(blog);
    await blogObject.save();
  }
});

describe("when there is initially some notes saved", () => {
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all notes are returned", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body).toHaveLength(helper.initBlogs.length);
  });

  test("a specific note is within the returned notes", async () => {
    const response = await api.get("/api/blogs");
    const authors = response.body.map((blog) => blog.author);
    expect(authors).toContain("Nemo");
  });

  test("id should be defined", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body[0].id).toBeDefined();
  });
});

describe("addition of new blog", () => {
  test("success with valid data", async () => {
    const newBlog = {
      author: "Nemo",
      title: "Learning fullstack",
      url: "learning.com",
      likes: 13,
    };
    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    const titles = blogsAtEnd.map((blog) => blog.title);

    expect(blogsAtEnd).toHaveLength(helper.initBlogs.length + 1);
    expect(titles).toContain("Learning fullstack");
  });

  test("add new blog without the likes property, default likes should be 0", async () => {
    const newBlog = {
      author: "Nemo",
      title: "Do not have likes property",
      url: "likes.com",
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    const newAddedBlog = blogsAtEnd.find(
      (blog) => blog.title === "Do not have likes property"
    );

    expect(blogsAtEnd).toHaveLength(helper.initBlogs.length + 1);
    expect(newAddedBlog.likes).toBe(0);
  });

  test("fails with status 400 if data invalid", async () => {
    const newBlog = {
      author: "Nemo",
      url: "notitle.com",
    };

    await api.post("/api/blogs").send(newBlog).expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initBlogs.length);
  });

  test("add new blog without url, return status 400", async () => {
    const newBlog = {
      author: "Nemo",
      title: "No URL",
    };

    await api.post("/api/blogs").send(newBlog).expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initBlogs.length);
  });
});

describe("deletion of a blog", () => {
  test("succeeds with status code 204 if id is valid", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    const titles = blogsAtEnd.map((blog) => blog.title);

    expect(blogsAtEnd).toHaveLength(helper.initBlogs.length - 1);
    expect(titles).not.toContain(blogToDelete.title);
  });
});

describe("viewing a specific blog", () => {
  test("succeeds with a valid id", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToView = blogsAtStart[0];

    const returnedBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const processedBlogToView = JSON.parse(JSON.stringify(blogToView));
    expect(returnedBlog.body).toEqual(processedBlogToView);
  });

  test("fails with statuscode 404 if blog does not exist", async () => {
    const validNonexistingId = await helper.nonExistingId();
    await api.get(`/api/blogs/${validNonexistingId}`).expect(404);
  });

  test("fails with statuscode 400 id is invalid", async () => {
    const invalidId = "5a3d5da59070081a82a344";
    const response = await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toEqual({ error: "malformatted id" });
  });
});

describe("updating likes property", () => {
  test("succeeds updating likes", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];
    const updatedBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: 1000 })
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(updatedBlog.body.likes).toEqual(1000);
    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initBlogs.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
