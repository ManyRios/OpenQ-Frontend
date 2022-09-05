// Third Party
import React from 'react';

// Custom
import MiniBountyCard from './MiniBountyCard';

const MiniBountyList = ({ type, payouts }) => {
  return (
    <div className='px-8 py-6 pb border-t border-web-gray'>
      <h2 className='font-semibold text-lg'>Claimed Bounties {type}</h2>
      <div>
        {payouts.length != 0 ? (
          <ul>
            {payouts.map((payout, index) => {
              return <MiniBountyCard key={index} payout={payout} />;
            })}
          </ul>
        ) : (
          <span className='pt-2'>No Bounties {type}</span>
        )}
      </div>
    </div>
  );
};
export default MiniBountyList;
