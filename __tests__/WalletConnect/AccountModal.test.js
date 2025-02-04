// test/component/WatchButton/WatchButton.test.js
/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '../../test-utils';
import AccountModal from '../../components/WalletConnect/AccountModal';
import nextRouter from 'next/router';
// Test cases for full balances, empty balances, and undefined balances.

const setIsConnecting = jest.fn();

describe('AccountModal', () => {
  // Test cases for

  const push = jest.fn(() => {
    return { catch: jest.fn };
  });
  beforeEach(() => {
    const observe = jest.fn();
    const disconnect = jest.fn();
    window.IntersectionObserver = jest.fn(() => ({
      observe,
      disconnect,
    }));

    nextRouter.useRouter = jest.fn();
    nextRouter.useRouter.mockImplementation(() => ({
      query: { type: null },
      prefetch: jest.fn(() => {
        return { catch: jest.fn };
      }),
      push,
    }));
  });

  it('should render account modal', async () => {
    // ARRANGE
    render(<AccountModal showModal={true} setIsConnecting={setIsConnecting} />);
    expect(screen.getByText(/Localhost:8545/i)).toBeInTheDocument();
    expect(screen.getByText(/Disconnect/i)).toBeInTheDocument();
    expect(screen.getByText(/0xf39/i)).toBeInTheDocument();
    // ASSERT
    const nullish = [...screen.queryAllByRole(/null/), ...screen.queryAllByRole(/undefined/)];
    expect(nullish).toHaveLength(0);
  });
  it(`shouldn render account modal when hidden`, async () => {
    // ARRANGE
    render(<AccountModal showModal={false} setIsConnecting={setIsConnecting} />);
    expect(screen.queryByText(/Disconnect/i)).not.toBeInTheDocument();
    // ASSERT
    const nullish = [...screen.queryAllByRole(/null/), ...screen.queryAllByRole(/undefined/)];
    expect(nullish).toHaveLength(0);
  });
});
