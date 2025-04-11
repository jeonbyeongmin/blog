import PostList from '@/app/_components/post-list';
import { getHomePosts } from '@/lib/notion';

export const revalidate = 3600 * 12;
export const dynamicParams = true;

interface Props {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
    category?: string;
  }>;
}

export default async function Home({ searchParams }: Props) {
  const searchParamsObj = await searchParams;
  const category = searchParamsObj.category as string | undefined;
  const defaultCategory = 'weekly-magazine';
  const categoryToUse = category || defaultCategory;

  const posts = await getHomePosts(categoryToUse);

  return (
    <main className="min-h-screen flex-1">
      <PostList posts={posts} />
    </main>
  );
}
