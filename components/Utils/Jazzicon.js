import React, { useRef, useEffect } from 'react';
import jazzicon from '@metamask/jazzicon';
import ToolTipNew from './ToolTipNew';
import Link from 'next/link';

const Jazzicon = ({ address, size, tooltipPosition, name }) => {
  const iconWrapper = useRef();
  useEffect(() => {
    if (address && iconWrapper.current) {
      iconWrapper.current.innerHTML = '';
      iconWrapper.current.appendChild(jazzicon(size, parseInt(address.slice(2, 10), 16)));
    }
  }, [address]);
  return (
    <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/user/${address}`}>
      <div data-testid='link' className={`cursor-pointer ${!address && 'w-9 h-9 mr-px'}`}>
        <ToolTipNew toolTipText={name || address} outerStyles={'relative bottom-2'} relativePosition={tooltipPosition}>
          <div ref={iconWrapper}>{address}</div>
        </ToolTipNew>
      </div>
    </Link>
  );
};
export default Jazzicon;
