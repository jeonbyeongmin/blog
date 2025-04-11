import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function GlobalNavbar() {
  return (
    <div>
      <div>
        <Link href="/">
          <Image src="/logo.png" alt="logo" width={100} height={100} />
        </Link>
      </div>
    </div>
  );
}
