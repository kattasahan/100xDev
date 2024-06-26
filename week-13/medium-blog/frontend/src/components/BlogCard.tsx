import { Link } from "react-router-dom";
import { BlogType } from "../types";

const BlogCard = (blog: BlogType) => {
  const authorName = blog?.author?.name || "Annonemos";
  return (
    <Link
      to={`/blog/${blog.id}`}
      className="m-2 rounded-xl border p-4 w-2/4 cursor-pointer"
    >
      <div className="flex flex-col gap-1">
        <div className="flex gap-2 items-center">
          <div className="h-8 w-8 bg-slate-400 rounded-full flex items-center justify-center text-white font-semibold">
            {authorName[0].toUpperCase()}
          </div>
          <div>{blog.author.name}</div>
          <div className="h-1 w-1 bg-slate-600 rounded-full"></div>
          <div className="text-slate-600">
            {new Date(blog.postedOn).toString()}
          </div>
        </div>
        <div className="font-bold text-2xl">{blog.title}</div>
        <div>{blog.content}</div>
      </div>
      <div className="flex items-center justify-between py-6">
        <div className="text-slate-600">3 min read</div>
        <div className="flex gap-px">
          <div className="h-1 w-1 bg-slate-400 rounded-full"></div>
          <div className="h-1 w-1 bg-slate-400 rounded-full"></div>
          <div className="h-1 w-1 bg-slate-400 rounded-full"></div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
