'use client';

import { Fragment, Suspense } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import CatLottie from '@/app/_components/cat-lottie';
import CategoryUtils from '@/app/_utils/category-utils';
import { cn } from '@/lib/utils';

interface SidebarProps {
  categories: string[];
}

export default function Sidebar({ categories }: SidebarProps) {
  return (
    <div className="sticky top-0 mr-4 h-full min-h-screen w-64 border-r border-zinc-800 px-4 py-10">
      <div className="flex h-full flex-col">
        <div className="relative flex items-center select-none">
          <CatLottie />
          <h1 className="-ml-3 pb-4 text-3xl font-bold tracking-[-0.1em] text-zinc-300">
            monolog
          </h1>
        </div>

        <nav className="mt-4 flex flex-col border-x border-zinc-800 py-3 text-zinc-300">
          {categories.map((category, index) => (
            <Fragment key={category}>
              <Suspense fallback={<div>Loading...</div>}>
                <CategoryLink category={category} />
              </Suspense>
              {index < categories.length - 1 && (
                <div className="h-3 bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] [--pattern-fg:var(--color-zinc-900)]" />
              )}
            </Fragment>
          ))}
        </nav>
      </div>
    </div>
  );
}

function CategoryLink({ category }: { category: string }) {
  const searchParams = useSearchParams();
  const currentCategory = searchParams?.get('category');

  return (
    <Link
      href={`/?category=${category}`}
      className={cn(
        'relative px-4 py-3',
        currentCategory === category ||
          (!currentCategory && category === 'weekly-magazine')
          ? 'bg-zinc-900'
          : 'text-zinc-500 hover:bg-zinc-800'
      )}
    >
      <span>{CategoryUtils.getFriendlyName(category)}</span>
      <div className="absolute -right-2 bottom-0 -left-2 border-t border-zinc-800" />
      <div className="absolute top-0 -right-2 -left-2 border-t border-zinc-800" />
    </Link>
  );
}
