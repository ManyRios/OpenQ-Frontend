// Third party
import React, { useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import nookies from 'nookies';

// Custom
import AboutFreelancer from '../../components/User/AboutFreelancer';
import UnexpectedErrorModal from '../../components/Utils/UnexpectedErrorModal';
import WrappedGithubClient from '../../services/github/WrappedGithubClient';
import WrappedOpenQSubgraphClient from '../../services/subgraph/WrappedOpenQSubgraphClient';
import WrappedOpenQPrismaClient from '../../services/openq-api/WrappedOpenQPrismaClient';
import useAuth from '../../hooks/useAuth';
import StoreContext from '../../store/Store/StoreContext';
import Logger from '../../services/logger/Logger';

const userId = ({ user, organizations, renderError }) => {
  const [authState] = useAuth();
  const { signedAccount } = authState;
  const [appState] = useContext(StoreContext);
  const [starredOrganizations, setStarredOrganizations] = useState([]);
  const [watchedBounties, setwatchedBounties] = useState([]);

  const [publicPrivateUserData, setPublicPrivateUserData] = useState(user);

  useEffect(() => {
    const getOffChainData = async () => {
      let privateUserData;
      try {
        privateUserData = await appState.openQPrismaClient.getUser(user.id);
        setPublicPrivateUserData({ ...user, ...privateUserData });
      } catch (error) {
        appState.logger.info('Viewing user not owner');
      }
      let starredOrganizations = [];
      setwatchedBounties(privateUserData?.watchedBounties.nodes);
      //get starred organizations.
      try {
        if (user.starredOrganizationIds) {
          const subgraphOrgs = await appState.openQSubgraphClient.getOrganizationsByIds(user.starredOrganizationIds);
          const githubOrgIds = subgraphOrgs.map((bounty) => bounty.id);
          const githubOrganizations = await appState.githubRepository.fetchOrganizationsByIds(githubOrgIds);
          starredOrganizations = githubOrganizations.map((organization) => {
            const subgraphOrg = subgraphOrgs.find((org) => {
              return org.id === organization.id;
            });

            return { ...organization, ...subgraphOrg, starred: true };
          });
          setStarredOrganizations(starredOrganizations);
        }
      } catch (err) {
        appState.logger.error(err);
      }
    };
    getOffChainData();
  }, []);

  return (
    <div className=' gap-4 justify-center pt-6'>
      {user?.email || user?.github ? (
        <AboutFreelancer
          showWatched={user.id === signedAccount}
          starredOrganizations={starredOrganizations}
          watchedBounties={watchedBounties}
          user={publicPrivateUserData}
          userId={user.id}
          organizations={organizations}
        />
      ) : (
        <UnexpectedErrorModal error={renderError} />
      )}
    </div>
  );
};

export const getServerSideProps = async (context) => {
  const githubRepository = new WrappedGithubClient();
  const cookies = nookies.get(context);
  const { github_oauth_token_unsigned } = cookies;
  const logger = new Logger();
  const oauthToken = github_oauth_token_unsigned ? github_oauth_token_unsigned : null;
  githubRepository.instance.setGraphqlHeaders(oauthToken);

  let userId = context.params.userId;
  let renderError = '';

  const openQSubgraphClient = new WrappedOpenQSubgraphClient();
  const openQPrismaClient = new WrappedOpenQPrismaClient();

  let user = {
    bountiesClosed: [],
    bountiesCreated: [],
    deposits: [],
    fundedTokenBalances: [],
    id: userId,
    payoutTokenBalances: [],
    payouts: [],
    renderError,
    avatarUrl: 'https://avatars.githubusercontent.com/u/77402538?s=200&v=4',
  };

  let organizations = [];
  let starredOrganizations = [];
  let userOffChainData = {};
  let userGithubData = {};
  let userOnChainData = {};

  try {
    // 1. We fetch the API user using the userId we get from the URL
    userOffChainData = await openQPrismaClient.instance.getPublicUserById(userId);
    if (!userOffChainData) {
      // This is where we should throw a 404
      return { props: { renderError: `User with id ${userId} not found.` } };
    }
  } catch (err) {
    logger.error(err);
  }

  const userHasAssociatedGithub = userOffChainData.github;
  if (userHasAssociatedGithub) {
    try {
      // 2. We fetch the Github user using the userId we get from the URL (IF IT'S A GITHUB USER!)
      userGithubData = await githubRepository.instance.fetchUserById(userOffChainData.github);
    } catch (err) {
      logger.error(err);
      const stringifiedErr = JSON.stringify(err);
      if (stringifiedErr.includes('401')) {
        return { props: { renderError: stringifiedErr } };
      }
      return { props: { renderError: `${userOffChainData.github} is not a valid GitHub ID.` } };
    }

    try {
      // 3. We fetch the on-chain user address if they have registered using the externalUserId (AKA githubId)
      // userOnChainData.id is the address of the user
      userOnChainData = await openQSubgraphClient.instance.getUserByGithubId(userOffChainData.github);
      try {
        let provider = new ethers.providers.InfuraProvider('homestead', process.env.INFURA_PROJECT_ID);

        // 4. We use the address to resolve the ENS name
        userId = await provider.resolveName(userOnChainData.id);
      } catch (err) {
        logger.error(err);
      }

      // 5. If user closed issues, get relevant issueIds and organizations
      try {
        const issueIds = userOnChainData.bountiesClosed?.map((bounty) => bounty.bountyId);
        if (issueIds) organizations = await githubRepository.instance.parseOrgIssues(issueIds);
      } catch (err) {
        console.error('could not fetch organizations');
      }
      // NOTE: The order of the spread is important here. We want to override the Github user avatarUrl with the one from the database
      // For email users, they get an auto-assigned anonymous profile picture for email
      // For Github users, we want to default to their Github profile picture
      // For other users, they may want to set their own profile picture in the database
    } catch (err) {
      logger.error(err);
    }
  }

  user = { ...user, ...userGithubData, ...userOffChainData, ...userOnChainData };

  return {
    props: { user, organizations, renderError, starredOrganizations, oauthToken },
  };
};

export default userId;
