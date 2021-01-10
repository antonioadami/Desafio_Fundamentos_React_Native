import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const gottenProducts = await AsyncStorage.getItem('products');
      console.log(gottenProducts);

      if (gottenProducts) {
        setProducts(JSON.parse(gottenProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const fakeProducts = products;
      const newProduct = product;

      const index = products.findIndex(
        productInCart => productInCart.id === product.id,
      );
      if (index !== -1) {
        fakeProducts[index].quantity++;
        setProducts(fakeProducts);
      } else {
        newProduct.quantity = 1;
        setProducts([...products, newProduct]);
      }

      await AsyncStorage.setItem('products', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const fakeProducts = products;

      const index = products.findIndex(
        productInCart => productInCart.id === id,
      );

      if (index !== -1) {
        fakeProducts[index].quantity++;
        setProducts(fakeProducts);
      }

      await AsyncStorage.setItem('products', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const fakeProducts = products;

      const index = products.findIndex(
        productInCart => productInCart.id === id,
      );

      if (index !== -1 && fakeProducts[index].quantity > 1) {
        fakeProducts[index].quantity--;
        setProducts(fakeProducts);
      }

      await AsyncStorage.setItem('products', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
