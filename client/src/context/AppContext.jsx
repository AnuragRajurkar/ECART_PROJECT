import { createContext, useContext, useEffect, useState } from "react";
import {useNavigate} from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

//using this we can send cookie with api request
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL

export const AppContext = createContext();

export const AppContextProvider = ({children}) => {

    const currency = import.meta.env.VITE_CURRENCY;

    const navigate = useNavigate();
    const [user,setUser] = useState(null);
    const [isseller,setIsSeller] = useState(false);
    const [showUserLogin,setShowUserLogin] = useState(false);
    const [products,setProducts] = useState([]);

    const[searchQuery, setSearchQuery] = useState("");
    
    const [cartItems,setCartItems] = useState({});

    //fetch seller status

    const fetchSeller = async () => {
        try {
            const {data} = await axios.get('/api/seller/is-auth')
            if(data.success)
            {
                setIsSeller(true)
            }else{
                setIsSeller(false)
            }
            
        } catch (error) {
            setIsSeller(false)
        }
    }

    //fetch user auth status ,also we will get user cart items
     /*
    const fetchUser = async () => {
        try {

            const {data} = await axios.get('/api/user/is-auth')
            //in this we don't have to send anything just we get response

            if(data.success)
            {
                setUser(data.user)
                setCartItems(data.user.cartItems)
            }else{
                setUser(null)
            }
            
        } catch (error) {
            setUser(null)
        }
    }*/

       // Define fetchUser BEFORE useEffect
const fetchUser = async () => {
  try {
    const res = await axios.get("/api/user/is-auth", { withCredentials: true });
    if (res.data.success) {
      setUser(res.data.user);
      setCartItems(res.data.user.cartItems || {});
    } else {
      setUser(null);
      setCartItems({});
    }
  } catch (err) {
    console.log("Error fetching user:", err.message);
    setUser(null);
    setCartItems({});
  }
};





    
    //fetch all products and siplay in product list of seller
    const fetchProducts = async () => {
       try {

        const {data} = await axios.get('/api/product/list')
        if(data.success)
        {
            setProducts(data.products)
        }else{
            toast.error(data.message)
        }
       } catch (error) {
        toast.error(error.message)
       }
    }

    //Add Product to cart
    const addToCart = (itemId) => {
        let cartData = structuredClone(cartItems);

        if(cartData[itemId]){
            cartData[itemId] += 1;
        }else{
            cartData[itemId] = 1
        }
        setCartItems(cartData)
        toast.success("Added to Cart")
    }

    //Update Cart Item Quantity

    const updateCartItem = (itemId,quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId] = quantity;
        setCartItems(cartData)
        toast.success("Cart Updated")
    }

    //remove product from cart

    const removeFromCart = (itemId) => {
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
            cartData[itemId] -= 1;

            if(cartData[itemId] === 0)
            {
                delete cartData[itemId]
            }
        }
        toast.success("Remove from Cart")
        setCartItems(cartData)
    }

    // Get Cart Item Count
  const getCartCount = ()=>{
    let totalCount = 0;
    for(const item in cartItems){
        totalCount += cartItems[item];
    }
    return totalCount;
  }

    // Get Cart Total Amount
    const getCartAmount = () =>{
    let totalAmount = 0;
    for (const items in cartItems){
        let itemInfo = products.find((product)=> product._id === items);
        if(cartItems[items] > 0){
            totalAmount += itemInfo.offerPrice * cartItems[items]
        }
    }
    return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        fetchUser(); 
        fetchSeller();
        fetchProducts()
    },[])

    useEffect(() => {
  console.log("User after fetchUser:", user);
  console.log("Cart after fetchUser:", cartItems);
}, [user, cartItems]);


   

    //update cartitems in database

    useEffect(() => {

        const updateCart = async () => {
            try {

                const {data} = await axios.post('/api/cart/update', {cartItems})

                //if cart is not updated it will give us toast data
                if(!data.success)
                {
                    toast.error(data.message)
                }
                
            } catch (error) {
                toast.error(error.message)
            }
        }

        if(user){
            updateCart();
        }
    },[cartItems])

    const value = {setCartItems,fetchProducts , axios, getCartCount, getCartAmount, searchQuery, setSearchQuery,navigate , user , setUser , isseller , setIsSeller, showUserLogin , setShowUserLogin, products, currency,addToCart, updateCartItem, removeFromCart, cartItems };

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = () => {
    return useContext(AppContext)
}