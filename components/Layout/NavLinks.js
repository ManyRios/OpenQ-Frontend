import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
const NavLinks = () => {
  const router = useRouter();
  return (
    <>
      <Link href={'/'}>
        <a className={`nav-link $ ${router.asPath === '/' && 'text-white'}`}>Explore</a>
      </Link>

      <Link href={'/fixed-price'}>
        <a className={`nav-link $ ${router.asPath === '/fixed-price' && 'text-white'}`}>Fixed Price</a>
      </Link>

      <Link href={'/contests'}>
        <a className={`nav-link $ ${router.asPath === '/contests' && 'text-white'}`}>Contests</a>
      </Link>
    </>
  );
};
export default NavLinks;
