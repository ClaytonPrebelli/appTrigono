declare module '@react-navigation/native' {
  import { ComponentType, ReactNode } from 'react';

  export const NavigationContainer: ComponentType<{ children?: ReactNode }>;
  export function useNavigation<T = any>(): T;
  export function useRoute<T = any>(): T;

  export type RouteProp<TParamList extends Record<string, object | undefined>, TName extends keyof TParamList> = {
    key: string;
    name: TName;
    params: TParamList[TName];
  };

  export type CompositeScreenProps<T, U> = T & U;
}

declare module '@react-navigation/native-stack' {
  import { ComponentType } from 'react';

  export function createNativeStackNavigator<TParamList extends Record<string, object | undefined> = any>(): {
    Navigator: ComponentType<any>;
    Screen: ComponentType<any>;
    Group: ComponentType<any>;
  };

  export type NativeStackNavigationProp<TParamList extends Record<string, object | undefined> = any, TName extends keyof TParamList = any> = {
    navigate: (name: any, params?: any) => void;
    goBack: () => void;
    push: (name: any, params?: any) => void;
    replace: (name: any, params?: any) => void;
    setParams: (params: Partial<any>) => void;
    reset: (state: any) => void;
  };

  export type NativeStackScreenProps<TParamList extends Record<string, object | undefined> = any, TName extends keyof TParamList = any> = {
    navigation: NativeStackNavigationProp<TParamList, TName>;
    route: import('@react-navigation/native').RouteProp<TParamList, TName>;
  };
}

declare module '@react-navigation/drawer' {
  import { ComponentType } from 'react';

  export function createDrawerNavigator<TParamList extends Record<string, object | undefined> = any>(): {
    Navigator: ComponentType<any>;
    Screen: ComponentType<any>;
  };

  export type DrawerNavigationProp<TParamList extends Record<string, object | undefined> = any, TName extends keyof TParamList = any> = {
    navigate: (name: any, params?: any) => void;
    goBack: () => void;
    toggleDrawer: () => void;
    openDrawer: () => void;
    closeDrawer: () => void;
    setParams: (params: Partial<any>) => void;
  };

  export type DrawerScreenProps<TParamList extends Record<string, object | undefined> = any, TName extends keyof TParamList = any> = {
    navigation: DrawerNavigationProp<TParamList, TName>;
    route: import('@react-navigation/native').RouteProp<TParamList, TName>;
  };
}
