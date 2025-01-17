///////////////////////////
// Modules
///////////////////////////

import React from 'react';
import { RootState } from 'state/store';
import IVaultState from 'state/vault/types';

///////////////////////////
// Hooks
///////////////////////////

import { useSelector } from 'react-redux';

///////////////////////////
// Stacks
///////////////////////////

import HomeStack from './home/Home';
import UnAuthStack from './UnAuth';

///////////////////////////
// Screens Names
///////////////////////////

import screens from '../screens';

///////////////////////////
// Navigation
///////////////////////////

import { createStackNavigator } from '@react-navigation/stack';
import defaultHeader from 'navigation/headers/default';

///////////////////////////
// Constants
///////////////////////////

const Stack = createStackNavigator();

const Root = () => {
  const { wallets, hasEncryptedVault, migrateWallet }: IVaultState = useSelector(
    (state: RootState) => state.vault
  );

  const isAuthorized =
    migrateWallet ||
    (wallets.local && Object.values(wallets.local).length > 0) ||
    hasEncryptedVault;

  return (
    <Stack.Navigator
      screenOptions={(navigation) => ({
        ...defaultHeader(navigation),
      })}
    >
      {!isAuthorized && (
        <Stack.Screen
          options={{ headerShown: false }}
          name={screens.unAuthorized.root}
          component={UnAuthStack}
        />
      )}
      {isAuthorized && (
        <Stack.Screen
          options={{ headerShown: false }}
          name={screens.authorized.root}
          component={HomeStack}
        />
      )}
    </Stack.Navigator>
  );
};

export default Root;
