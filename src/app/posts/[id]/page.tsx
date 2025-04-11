import { format } from 'date-fns';

import { Metadata } from 'next';
import Link from 'next/link';

import Content from '@/app/_components/content';
import { Block, getPost } from '@/lib/notion';

export const revalidate = 3600 * 24; // 1일

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function isParagraph(
  block: Block
): block is Block & { type: 'paragraph'; paragraph: string } {
  return block.type === 'paragraph';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const paramsObj = await params;
  const { post, blocks } = await getPost(paramsObj.id);
  const firstParagraph = blocks.find(isParagraph);
  const description = firstParagraph?.paragraph || post.title;
  const url = `https://monolog.vercel.app/posts/${paramsObj.id}`;
  const publishedTime = new Date(post.createdTime).toISOString();
  const modifiedTime = new Date(post.updatedTime).toISOString();

  return {
    title: post.title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description,
      url,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: ['monolog'],
      tags: post.tags.map((tag) => tag.name),
      siteName: 'monolog',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      creator: '@monolog',
    },
    other: {
      'article:published_time': publishedTime,
      'article:modified_time': modifiedTime,
      'article:author': 'monolog',
      'article:section': post.category,
      'article:tag': post.tags.map((tag) => tag.name).join(','),
    },
  };
}

export default async function PostPage({ params }: Props) {
  const paramsObj = await params;
  const { post, blocks } = await getPost(paramsObj.id);
  const publishedTime = new Date(post.createdTime).toISOString();
  const modifiedTime = new Date(post.updatedTime).toISOString();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: blocks.find(isParagraph)?.paragraph || post.title,
    image: '',
    datePublished: publishedTime,
    dateModified: modifiedTime,
    author: {
      '@type': 'Person',
      name: 'monolog',
    },
    publisher: {
      '@type': 'Organization',
      name: 'monolog',
      logo: {
        '@type': 'ImageObject',
        url: 'https://monolog.vercel.app/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://monolog.vercel.app/posts/${paramsObj.id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen flex-1">
        <div className="border-x border-zinc-800">
          <div className="relative">
            <article className="relative border-zinc-800 bg-zinc-900 p-8">
              <div className="absolute top-0 -right-[18px] -left-[18px] z-10 border-t border-zinc-800" />
              <div className="absolute -right-[18px] bottom-0 -left-[18px] z-10 border-t border-zinc-800" />

              <Link
                href="/"
                className="mb-8 inline-block text-zinc-400 transition-colors hover:text-zinc-300"
              >
                ← Back
              </Link>

              <header className="relative pb-6">
                <h1 className="my-4 text-4xl font-bold text-zinc-100">
                  {post.title}
                </h1>
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
                  <time dateTime={post.createdTime} className="text-xs">
                    {format(new Date(post.createdTime), 'MMMM d, yyyy')}
                  </time>
                  <div className="flex gap-2">
                    <span className="text-xs">{post.category}</span>
                    <span className="text-xs">{post.status}</span>
                  </div>
                </div>
                <hr className="absolute -right-4 bottom-0 -left-4 border-zinc-800" />
              </header>

              <div className="pt-6">
                <Content blocks={blocks} />
              </div>
            </article>
          </div>
        </div>
      </main>
    </>
  );
}
