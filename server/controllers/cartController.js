import User from "../models/User.js"

// Update User CartData : /api/cart/update

export const updateCart = async (req, res)=>{
    try {
        /*
        const  {userId,cartItems}  = req.body; */
        const cartItems = req.body.cartItems;
        const userId = req.user; 
        await User.findByIdAndUpdate(userId, {cartItems})
        res.json({ success: true, message: "Cart Updated" })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

// GET User Cart: /api/cart/get
export const getCart = async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId);

    if (!user) return res.json({ success: false, message: "User not found" });

    res.json({ success: true, cartItems: user.cartItems });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};