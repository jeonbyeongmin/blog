import { format } from 'date-fns';

import Link from 'next/link';

import Content from '@/app/_components/content';
import { PostWithBlocks } from '@/lib/notion';

interface PostListProps {
  posts: PostWithBlocks[];
}

export default function PostList({ posts }: PostListProps) {
  return (
    <div className="mx-auto border-x border-zinc-800">
      {posts.map((post, index) => (
        <div key={post.id} className="relative">
          <article className="relative border-zinc-800 bg-zinc-900 p-8">
            <div className="absolute top-0 -right-[18px] -left-[18px] z-10 border-t border-zinc-800 not-first-of-type:hidden" />
            <div className="absolute -right-[18px] bottom-0 -left-[18px] z-10 border-t border-zinc-800" />
            <header className="relative pb-6">
              <Link href={`/posts/${post.id}`}>
                <h2 className="my-4 text-2xl font-bold text-zinc-100 transition-colors hover:text-zinc-300">
                  {post.title}
                </h2>
              </Link>
              <div className="mb-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="bg-zinc-800 px-2 py-1 text-xs text-zinc-400"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
              <div className="relative flex items-center justify-between py-1 text-zinc-500">
                <time className="text-xs">
                  {format(new Date(post.createdTime), 'MMMM d, yyyy')}
                </time>
                <div className="flex gap-2">
                  <Link
                    href={`/?category=${post.category}`}
                    className="text-xs hover:text-zinc-300"
                  >
                    {post.category}
                  </Link>
                </div>
              </div>
              <hr className="absolute -right-4 bottom-0 -left-4 border-zinc-800" />
            </header>

            <div className="pt-6">
              <Content blocks={post.blocks} />
              <Link
                href={`/posts/${post.id}`}
                className="group mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-400 transition-all hover:bg-zinc-700 hover:text-zinc-300"
              >
                <span>더 보기</span>
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </article>
          {index < posts.length - 1 && (
            <div className="h-10 bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] [--pattern-fg:var(--color-zinc-800)]" />
          )}
        </div>
      ))}
    </div>
  );
}
