import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const {stockData, productData} = await getStockProductData(productId);
      const newCart = [...cart];
      const cartProduct = newCart.find(product => product.id === productId);
      const cartProductAmmout = (cartProduct?.amount ?? 0) + 1;
      if(cartProductAmmout > stockData.amount){
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }
      if (cartProduct) {
        cartProduct.amount = cartProductAmmout;
      } else {
        newCart.push(productData)
      }
      setCart(newCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const getStockProductData = async (productId: number): Promise<{stockData: Stock, productData: Product}> => {
    const {data: stockData} = await api.get(`stock/${productId}`);
    const {data: productData} = await  api.get(`products/${productId}`);
    return {stockData, productData};
  }

  const removeProduct = (productId: number) => {
    try {
      const newCart = [...cart];
      const cartProductIndex = newCart.findIndex(product => product.id === productId);
      newCart.splice(cartProductIndex);
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
