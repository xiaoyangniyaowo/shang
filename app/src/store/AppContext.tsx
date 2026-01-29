import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { authApi, cartApi } from '@/services/api';
import type { CartItem, User, Order } from '@/types';

interface AppState {
  cart: CartItem[];
  user: User | null;
  isAuthenticated: boolean;
  orders: Order[];
  cartTotal: number;
  cartCount: number;
  isLoading: boolean;
}

type Action =
  | { type: 'SET_CART'; payload: { items: CartItem[]; total: number; count: number } }
  | { type: 'ADD_TO_CART'; payload: { items: CartItem[]; total: number; count: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  cart: [],
  user: null,
  isAuthenticated: false,
  orders: [],
  cartTotal: 0,
  cartCount: 0,
  isLoading: true,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        cart: action.payload.items,
        cartTotal: action.payload.total,
        cartCount: action.payload.count,
      };
    case 'ADD_TO_CART':
      return {
        ...state,
        cart: action.payload.items,
        cartTotal: action.payload.total,
        cartCount: action.payload.count,
      };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [], cartTotal: 0, cartCount: 0 };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartQuantity: (itemId: string, quantity: number) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 初始化：检查本地存储的 token 并获取用户信息
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { user } = await authApi.getMe();
          dispatch({ type: 'LOGIN', payload: user });
        } catch (error) {
          // Token 无效，清除
          localStorage.removeItem('token');
        }
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    initAuth();
  }, []);

  // 用户登录后获取购物车
  useEffect(() => {
    if (state.isAuthenticated) {
      refreshCart();
    }
  }, [state.isAuthenticated]);

  const refreshCart = async () => {
    try {
      const data = await cartApi.getCart();
      dispatch({ type: 'SET_CART', payload: data });
    } catch (error) {
      console.error('获取购物车失败:', error);
    }
  };

  const addToCart = async (productId: string, quantity = 1) => {
    const data = await cartApi.addToCart({ product_id: productId, quantity });
    dispatch({ type: 'ADD_TO_CART', payload: data });
  };

  const removeFromCart = async (itemId: string) => {
    await cartApi.removeItem(itemId);
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
    // 刷新购物车以获取最新总价
    await refreshCart();
  };

  const updateCartQuantity = async (itemId: string, quantity: number) => {
    await cartApi.updateQuantity(itemId, quantity);
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
    // 刷新购物车以获取最新总价
    await refreshCart();
  };

  const login = async (email: string, password: string) => {
    const { user, token } = await authApi.login({ email, password });
    localStorage.setItem('token', token);
    dispatch({ type: 'LOGIN', payload: user });
  };

  const register = async (email: string, password: string, name: string) => {
    const { user, token } = await authApi.register({ email, password, name });
    localStorage.setItem('token', token);
    dispatch({ type: 'LOGIN', payload: user });
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        refreshCart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
