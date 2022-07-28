
// Third party
import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';

// Custom
import StoreContext from '../../store/Store/StoreContext';
import useGetTokenValues from '../../hooks/useGetTokenValues';
import TokenBalances from '../TokenBalances/TokenBalances';

const MiniDepositCard = ({ deposit, showLink }) => {
	// Context
	const [appState] = useContext(StoreContext);

	// State
	const [title, updateTitle] = useState('');
	const [tokenValues] = useGetTokenValues(deposit);

	// Hooks
	useEffect(async () => {
		if (showLink) {
			try {
				const fetchedTitle = await appState.githubRepository.fetchIssueById(deposit.bounty.bountyId);
				updateTitle(fetchedTitle.title);
			}
			catch (error) {
				console.log(error);
			}
		}
	});

	// render
	return (
		<div key={deposit.id} className={'bg-web-gray/20  border-web-gray border px-4 pb-1 h-min rounded-sm max-w-[280px] lg:col-span-2 justify-self-center'}>
			{showLink && <Link href={`/bounty/${deposit.bounty.bountyId}/${deposit.bounty.id}`}>
				<h3 className='text-xl font-semibold leading-none underline cursor-pointer pb-2'>{title}</h3>
			</Link>}
			<TokenBalances
				tokenBalances={[deposit]}
				tokenValues={tokenValues}
				lean={true}
				singleCurrency={true}
			/>
		</div>
	);
};

export default MiniDepositCard;