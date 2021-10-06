import React, { useState } from "react";

const Blog = ({ blog, likeBlog }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: "solid",
    borderWidth: 1,
    marginBottom: 5,
  };

  const [showDetail, setShowDetail] = useState(false);
  const handleShowDetail = () => setShowDetail(!showDetail);

  return (
    <div style={blogStyle}>
      {blog.title}
      <button onClick={handleShowDetail}>{showDetail ? "hide" : "view"}</button>
      {showDetail && (
        <>
          <div>{blog.url}</div>
          <div>
            likes: {blog.likes}
            <button onClick={() => likeBlog(blog)}>like</button>
          </div>
          <div>{blog.author}</div>
        </>
      )}
    </div>
  );
};
export default Blog;
