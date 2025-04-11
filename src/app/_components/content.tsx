import Image from 'next/image';

import { Block } from '@/lib/notion';

interface Props {
  blocks: Block[];
}

export default function Content({ blocks }: Props) {
  return (
    <>
      {blocks.map((block) => {
        if (block.type === 'paragraph') {
          return (
            <p key={block.id} className="mb-4 indent-2 leading-7 text-zinc-300">
              {block.paragraph}
            </p>
          );
        }
        if (block.type === 'heading_1') {
          return (
            <h2
              key={block.id}
              className="mb-8 text-2xl font-bold text-zinc-300"
            >
              {block.h1}
            </h2>
          );
        }
        if (block.type === 'heading_2') {
          return (
            <h3 key={block.id} className="mb-6 text-xl font-bold text-zinc-300">
              {block.h2}
            </h3>
          );
        }
        if (block.type === 'heading_3') {
          return (
            <h4 key={block.id} className="mb-4 text-lg font-bold text-zinc-300">
              {block.h3}
            </h4>
          );
        }
        if (block.type === 'image') {
          return (
            <div key={block.id} className="relative my-8 aspect-video">
              <Image
                src={block.image}
                alt={block.alt || '블로그 이미지'}
                className="object-cover"
                priority={false}
                loading="lazy"
                fill
              />
            </div>
          );
        }
        if (block.type === 'quote') {
          return (
            <blockquote
              key={block.id}
              className="mb-8 border-l-4 border-zinc-700 p-4 text-zinc-300"
            >
              {block.quote}
            </blockquote>
          );
        }
        return null;
      })}
    </>
  );
}
