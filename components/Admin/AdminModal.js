import React, { useContext, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import StoreContext from '../../store/Store/StoreContext';
import { ethers } from 'ethers';
import LinkText from '../svg/linktext';
import ModalDefault from '../Utils/ModalDefault';

const AdminModal = ({ setModal, modal, bounty, payoutTokenAddress }) => {
  const [token, setToken] = useState();
  const [volume, setVolume] = useState();
  const [appState] = useContext(StoreContext);

  useEffect(() => {
    if (modal.transaction && (modal.type === 'Budget' || modal.type === 'Payout')) {
      const tokenAddress = modal.transaction.events[0].args[1];
      const token = appState.tokenClient.getToken(tokenAddress);
      setToken(token);
      const volume = modal.transaction.events[0].args[2];
      let bigNumberVolume = ethers.BigNumber.from(volume.toString());
      let decimals = parseInt(token.decimals) || 18;
      let formattedVolume = ethers.utils.formatUnits(bigNumberVolume, decimals);
      setVolume(formattedVolume);
    }

    if (modal.transaction && modal.type === 'PayoutSchedule') {
      // do something?
    }
  }, []);

  const modalRef = useRef();
  useEffect(() => {
    // Courtesy of https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModal();
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modal, modalRef]);

  const closeModal = () => {
    setModal(false);
  };

  const title = {
    ['Closed Contest']: 'Contest Closed!',
    ['Closed Split Price']: 'Split Price Contract Closed!',
    Budget: 'Budget Updated!',
    Payout: 'Payout Updated!',
    PayoutSchedule: 'Payout Schedule Updated!',
    Error: modal.title,
  };
  const content = {
    ['Closed Split Price']:
      'Split Price contract closed, no further claims will be available through this contract. Check out the closing transaction with the link below:',
    ['Closed Contest']:
      'Contest closed, now contestants can cash out. Check out the closing transaction with the link below:',
    Budget: 'Budget has been updated. Check out your transaction with the link below:',
    Payout: 'Payout has been updated. Check out your transaction with the link below:',
    PayoutSchedule: 'Payout Schedule has been updated. Check out your transaction with the link below:',
    Error: modal.message,
  };
  const getVolumeSuffix = (bountyType, tokenAddress) => {
    if (bountyType === '2') return '%';
    return appState.tokenClient.getToken(tokenAddress).symbol;
  };
  const btn = (
    <button onClick={closeModal} className='btn-default'>
      <span>Close</span>
    </button>
  );

  return (
    <div ref={modalRef}>
      <ModalDefault
        title={title[modal.type]}
        footerRight={btn}
        setShowModal={setModal}
        /* resetState={resetState} */
      >
        {(modal.type === 'Payout' || modal.type === 'Budget') && token && (
          <>
            <p className='pb-4'>{content[modal.type]}</p>
            <div className='flex justify-between w-full gap-2 pb-4'>
              <div className='w-28 flex-1'>{modal.type} set to:</div>
              <div className='flex flex-wrap flex-1 justify-start w-[120px] gap-8'>
                <Image
                  width={24}
                  className='inline'
                  height={24}
                  src={token.path || token.logoURI || '/crypto-logos/ERC20.svg'}
                />
                <span>
                  {volume} {token.symbol}
                </span>
              </div>
            </div>
            <div className='flex justify-between pb-4'>
              <div className='flex-1' href={modal.transaction.transactionHash}>
                Transaction:{' '}
              </div>
              <a
                className='break-all flex-1 underline cursor-pointer'
                target='_blank'
                rel='noopener noreferrer'
                href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_BASE_URL}/${modal.transaction.transactionHash}`}
              >
                {modal.transaction.transactionHash.slice(0, 3)}...
                {modal.transaction.transactionHash.slice(-3)}
                <LinkText />
              </a>
            </div>
          </>
        )}

        {modal.type === 'PayoutSchedule' && (
          <>
            <p className='pb-4'>{content[modal.type]}</p>
            <div className='flex justify-between w-full gap-2 pb-4'>
              <div className='w-28 flex-1'>Payout Schedule set to</div>
              <div className='flex flex-wrap flex-1 justify-start w-[120px] '>
                <div className='flex items-center gap-4 pt-2 text-primary'>
                  <div className='text-xs font-semibold leading-loose'>Number of tiers: </div>
                  <div className='text-xs font-semibold'>{modal.finalTierVolume.length}</div>
                </div>
                <div className='flex flex-col max-h-40 w-full overflow-y-auto overflow-x-hidden'>
                  {modal.finalTierVolume.map((t, index) => {
                    return (
                      <div key={index} className='flex items-center gap-4 text-primary'>
                        <div className='text-xs font-semibold leading-loose'>{`${appState.utils.handleSuffix(
                          index + 1
                        )} winner:`}</div>
                        <div className='text-xs font-semibold'>
                          {t} {getVolumeSuffix(bounty.bountyType, payoutTokenAddress)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className='flex justify-between pb-4'>
              <div className='flex-1' href={modal.transaction.transactionHash}>
                Transaction:{' '}
              </div>
              <a
                className='break-all flex-1 underline cursor-pointer'
                target='_blank'
                rel='noopener noreferrer'
                href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_BASE_URL}/${modal.transaction.transactionHash}`}
              >
                {modal.transaction.transactionHash.slice(0, 3)}...
                {modal.transaction.transactionHash.slice(-3)}
                <LinkText />
              </a>
            </div>
          </>
        )}

        {(modal.type.includes('Closed') || modal.type === 'Error') && (
          <>
            <p>{content[modal.type]}</p>
            {modal.type !== 'Error' && (
              <a className='break-all underline cursor-pointer'>
                {' '}
                {process.env.NEXT_PUBLIC_BLOCK_EXPLORER_BASE_URL}/{modal.transaction.transactionHash}
              </a>
            )}
          </>
        )}
      </ModalDefault>
    </div>
  );
};

export default AdminModal;
