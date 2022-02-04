import { formatUnixDate } from '../utils/Utils';

/**
	 * Each method contains a tuple of { CONTRACT_THROWN_REVERT_STRING : USER_FRIENDLY ERROR MESSAGE }
	 */
const jsonRpcErrors =
	[
		// MINT
		{},
		// FUND
		{
			'FUNDING_CLOSED_BOUNTY': {
				title: 'Cannot fund a closed bounty',
				message: ({ bounty }) => {
					return `Bounty was closed on ${bounty.bountyClosedTime}`;
				}
			}
		},
		{
			'ERC20: transfer amount exceeds balance': {
				title: 'Transfer amount exceeds balance',
				message: () => {
					return 'Transfer amount exceeds balance';
				}
			}
		},
		{
			'NONCE_TO_HIGH': {
				title: 'Nonce Too High',
				message: () => {
					return 'Nonce too high. If developing locally, Go to MetaMask -> Accounts -> Settings -> Advanced -> Reset Account';
				}
			}
		},
		// REFUND
		{
			'PREMATURE_REFUND_REQUEST': {
				title: 'Too early to withdraw funds',
				message: ({ bounty }) => {
					return `Bounty was minted on ${formatUnixDate(bounty.bountyMintTime)}`;
				}
			}
		},
		{
			'ONLY_FUNDERS_CAN_REQUEST_REFUND': {
				title: 'Not a Funder',
				message: ({ account }) => `Only funders can request refunds on this issue. Your address ${account} has not funded this issue.`
			}
		},
		{
			'REFUNDING_CLOSED_BOUNTY': {
				title: 'Cannot request refund on a closed bounty',
				message: () => 'You are requesting on a closed bounty'
			}
		},
		// CLAIM
		{
			'CLAIMING_CLOSED_BOUNTY': {
				title: 'Cannot claim a closed bounty',
				message: () => 'You are attempting to claim a closed bounty'
			}
		}
	];


export default jsonRpcErrors;