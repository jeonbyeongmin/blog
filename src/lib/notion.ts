import { Client } from '@notionhq/client';
import type { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';

import { getCachedData, isCacheStale, setCachedData } from './cache';

if (!process.env.NOTION_API_KEY) {
  throw new Error('Missing NOTION_API_KEY environment variable');
}

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID;

// Types
export interface Post {
  id: string;
  title: string;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  createdTime: string;
  updatedTime: string;
  category: string;
  status: string;
}

export interface PostWithBlocks extends Post {
  blocks: Block[];
}

export interface PostsResponse {
  posts: PostWithBlocks[];
  nextCursor: string | null;
  hasMore: boolean;
}

type BlockType =
  | 'paragraph'
  | 'heading_1'
  | 'heading_2'
  | 'heading_3'
  | 'image'
  | 'quote';

interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface Paragraph extends BaseBlock {
  type: 'paragraph';
  paragraph: string;
}

export interface Heading1 extends BaseBlock {
  type: 'heading_1';
  h1: string;
}

export interface Heading2 extends BaseBlock {
  type: 'heading_2';
  h2: string;
}

export interface Heading3 extends BaseBlock {
  type: 'heading_3';
  h3: string;
}

export interface Image extends BaseBlock {
  type: 'image';
  image: string;
  alt?: string;
}

export interface Quote extends BaseBlock {
  type: 'quote';
  quote: string;
}

export type Block = Paragraph | Heading1 | Heading2 | Heading3 | Image | Quote;

interface NotionPost {
  id: string;
  properties: {
    title: {
      id: string;
      type: string;
      title: Array<{
        type: string;
        text: {
          content: string;
          link: string | null;
        };
        annotations: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          code: boolean;
          color: string;
        };
        plain_text: string;
        href: string | null;
      }>;
    };
    tag: {
      id: string;
      type: string;
      multi_select: Array<{
        id: string;
        name: string;
        color: string;
      }>;
    };
    category: {
      id: string;
      type: string;
      select: {
        id: string;
        name: string;
        color: string;
      };
    };
    status: {
      id: string;
      type: string;
      status: {
        id: string;
        name: string;
        color: string;
      };
    };
    created_time: {
      id: string;
      type: string;
      created_time: string;
    };
    updated_time: {
      id: string;
      type: string;
      last_edited_time: string;
    };
  };
}

interface NotionBlock {
  id: string;
  type: string;
  paragraph?: {
    rich_text: Array<{
      plain_text: string;
    }>;
  };
  heading_1?: {
    rich_text: Array<{
      plain_text: string;
    }>;
  };
  heading_2?: {
    rich_text: Array<{
      plain_text: string;
    }>;
  };
  heading_3?: {
    rich_text: Array<{
      plain_text: string;
    }>;
  };
  quote?: {
    rich_text: Array<{
      plain_text: string;
    }>;
  };
  image?: {
    file: {
      url: string;
    };
    alt: string;
  };
}

// Helper functions
function convertNotionBlockToBlock(block: NotionBlock): Block {
  switch (block.type) {
    case 'paragraph':
      return {
        id: block.id,
        type: 'paragraph',
        paragraph:
          block.paragraph?.rich_text.map((text) => text.plain_text).join('') ||
          '',
      };
    case 'heading_1':
      return {
        id: block.id,
        type: 'heading_1',
        h1:
          block.heading_1?.rich_text.map((text) => text.plain_text).join('') ||
          '',
      };
    case 'heading_2':
      return {
        id: block.id,
        type: 'heading_2',
        h2:
          block.heading_2?.rich_text.map((text) => text.plain_text).join('') ||
          '',
      };
    case 'heading_3':
      return {
        id: block.id,
        type: 'heading_3',
        h3:
          block.heading_3?.rich_text.map((text) => text.plain_text).join('') ||
          '',
      };
    case 'quote':
      return {
        id: block.id,
        type: 'quote',
        quote:
          block.quote?.rich_text.map((text) => text.plain_text).join('') || '',
      };
    case 'image':
      return {
        id: block.id,
        type: 'image',
        image: block.image?.file.url || '',
        alt: block.image?.alt || '',
      };
    default:
      return {
        id: block.id,
        type: 'paragraph',
        paragraph: '',
      };
  }
}

function convertNotionPostToPost(post: NotionPost): Post {
  return {
    id: post.id,
    title: post.properties.title.title[0]?.plain_text,
    tags: post.properties.tag.multi_select,
    createdTime: post.properties.created_time.created_time,
    updatedTime: post.properties.updated_time.last_edited_time,
    category: post.properties.category.select.name,
    status: post.properties.status.status.name,
  };
}

// Main functions
export async function getPosts(
  pageSize: number = 10,
  startCursor?: string,
  category?: string
): Promise<PostsResponse> {
  if (!databaseId) {
    throw new Error('Missing NOTION_DATABASE_ID environment variable');
  }

  const filter: QueryDatabaseParameters['filter'] = {
    and: [
      {
        property: 'status',
        status: {
          equals: 'published',
        },
      },
    ],
  };

  // 카테고리가 지정된 경우 필터에 추가
  if (category) {
    filter.and.push({
      property: 'category',
      select: {
        equals: category,
      },
    });
  }

  const response = await notion.databases.query({
    database_id: databaseId,
    page_size: pageSize,
    start_cursor: startCursor,
    filter,
    sorts: [
      {
        property: 'created_time',
        direction: 'descending',
      },
    ],
  });

  const blocksPromises = response.results.map((result) => {
    const post = result as unknown as NotionPost;
    return notion.blocks.children.list({
      block_id: post.id,
    });
  });

  const blocksResponses = await Promise.all(blocksPromises);

  const postsWithBlocks: PostWithBlocks[] = response.results.map(
    (result, index) => {
      const post = result as unknown as NotionPost;
      const blocksResponse = blocksResponses[index];

      return {
        ...convertNotionPostToPost(post),
        blocks: blocksResponse.results.map((blockResult) =>
          convertNotionBlockToBlock(blockResult as unknown as NotionBlock)
        ),
      };
    }
  );

  return {
    posts: postsWithBlocks,
    nextCursor: response.next_cursor,
    hasMore: response.has_more,
  };
}

export async function getPost(
  pageId: string
): Promise<{ post: Post; blocks: Block[] }> {
  const cacheKey = `post-${pageId}`;
  const cached = getCachedData<{ post: Post; blocks: Block[] }>(cacheKey);

  if (cached) {
    if (isCacheStale(cacheKey)) {
      refreshPostCache(pageId, cacheKey);
    }
    return cached;
  }

  return await refreshPostCache(pageId, cacheKey);
}

// Helper function to refresh post cache
async function refreshPostCache(
  pageId: string,
  cacheKey: string
): Promise<{ post: Post; blocks: Block[] }> {
  const postResponse = (await notion.pages.retrieve({
    page_id: pageId,
  })) as unknown as NotionPost;

  const blocksResponse = await notion.blocks.children.list({
    block_id: pageId,
  });

  const result = {
    post: convertNotionPostToPost(postResponse),
    blocks: blocksResponse.results.map((result) =>
      convertNotionBlockToBlock(result as unknown as NotionBlock)
    ),
  };

  setCachedData(cacheKey, result);
  return result;
}

export function getCategories() {
  return ['weekly-magazine', 'movies', 'books', 'tech', 'life'];
}

async function getPostBlocks(pageId: string): Promise<Block[]> {
  try {
    const blocksResponse = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });

    return blocksResponse.results.map((block) =>
      convertNotionBlockToBlock(block as unknown as NotionBlock)
    );
  } catch (error) {
    console.error(`Error fetching blocks for post ${pageId}:`, error);
    return [];
  }
}

export async function getHomePosts(
  category?: string
): Promise<PostWithBlocks[]> {
  const cacheKey = `home-posts-${category || 'all'}`;
  const cached = getCachedData<PostWithBlocks[]>(cacheKey);

  if (cached) {
    if (isCacheStale(cacheKey)) {
      refreshHomePostsCache(category, cacheKey);
    }
    return cached;
  }

  return await refreshHomePostsCache(category, cacheKey);
}

async function refreshHomePostsCache(
  category?: string,
  cacheKey?: string
): Promise<PostWithBlocks[]> {
  const key = cacheKey || `home-posts-${category || 'all'}`;

  const filter: QueryDatabaseParameters['filter'] = {
    and: [
      {
        property: 'status',
        status: {
          equals: 'Published',
        },
      },
    ],
  };

  if (category) {
    filter.and.push({
      property: 'category',
      select: {
        equals: category,
      },
    });
  }

  let allPosts: PostWithBlocks[] = [];
  let hasMore = true;
  let nextCursor: string | undefined;

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: databaseId!,
      page_size: 20,
      start_cursor: nextCursor,
      filter,
      sorts: [
        {
          property: 'created_time',
          direction: 'descending',
        },
      ],
    });

    const posts = response.results.map((page) => {
      const notionPost = page as unknown as NotionPost;
      return convertNotionPostToPost(notionPost);
    });

    const postsWithBlocks = await Promise.all(
      posts.map(async (post) => {
        const blocks = await getPostBlocks(post.id);
        return {
          ...post,
          blocks: blocks.slice(0, 5),
        };
      })
    );

    allPosts = [...allPosts, ...postsWithBlocks];

    // 다음 페이지가 있는지 확인
    hasMore = response.has_more;
    nextCursor = response.next_cursor || undefined;
  }

  setCachedData(key, allPosts, 3600);
  return allPosts;
}
