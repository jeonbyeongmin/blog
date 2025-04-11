import { NextResponse } from 'next/server';

import { getHomePosts } from '@/lib/notion';

export const revalidate = 3600 * 12;

// 정적 생성 설정
export const dynamic = 'force-static';

export async function GET() {
  try {
    // 모든 포스트를 가져옵니다
    const posts = await getHomePosts();
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
