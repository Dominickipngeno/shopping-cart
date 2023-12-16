const express= require('express')
const router = express.Router()
const multer = require ('multer')
const axios = require('axios')
const product = require('../models/Product')
const fs = require("fs")
const Product = require('../models/Product')
 const  Order = require('../models/order')

const Cart = require('../models/cart')
const Payment = require ("../models/Payment")
const req = require('express/lib/request')
const { session } = require('passport')
const { body } = require('express-validator')

const request= require('request')
const moment = require("moment")
const base64 = require('base-64');
const utf8 = require('utf8');
const { response } = require('express')
const { error } = require('console')
const cart = require('../models/cart')

//image upload

var storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, './uploads')
    },
    filename: function( req,file,cb){
        cb(null,file.fieldname +"_"+Date.now()+"_"+file.originalname)
    },
})
var upload = multer({
    storage:storage, 
}).single("image")

//pages routes

router.get('/', (req, res)=>{
    Product.find().exec((err,products)=>{
        var productChunks =[]
        var chunkSize=3
        for(var i = 0; i<products.length; i+=chunkSize){
            productChunks.push(products.slice(i, i + chunkSize))
        }
        
        if(err){
            console.log("err occured")
        }

        else{
            res.render ("index",{tittle: ' Express-Online Shopping' , products: products, productChunks}) 
         }
     })
   }) 

   router.get('/login', (req, res)=>{
    res.render ("add-stock",{tittle: ' Add stock'}) 
})

router.get('/add-stock', (req, res)=>{
    res.render ("add-stock",{tittle: ' Add stock'}) 
})
router.get('/add-to-cart/:id',(req,res,next)=>{
    var productId = req.params.id 
    var cart = new Cart(req.session.cart ? req.session.cart : {items: {}})
    
    Product.findById(productId,function(err,products){
      if(err){    
        return res.redirect('/')

      } 
     var totalQty = 0;
      cart.add(products,products.id,totalQty) 
      req.session.cart = cart
      console.log(req.session.cart)
      res.redirect('/')
    })

})  

router.get('/reduce/:id', function(req,res,next){
    var productId = req.params.id 
    var cart = new Cart(req.session.cart ? req.session.cart : {items: {}})
    cart.reduceByOne(productId)
    req.session.cart = cart
    res.redirect('/shopping-cart')

})
router.get('/remove/:id', function(req,res,next){
    var productId = req.params.id 
    var cart = new Cart(req.session.cart ? req.session.cart : {items: {}})
    cart.removeItem(productId)
    req.session.cart = cart
    res.redirect('/shopping-cart')

})
// insert prject route
router.post('/add-product', upload,(req, res)=>{
    const product= new Product({
        Product_name: req.body.Product_name,
        Description: req.body.Description,
        Cost: req.body.Cost,
        image: req.file.filename

    })
    product.save((err)=>{
        if(err){

            console.log("Error occured")

        }else{
           console.log("Stock Added succesfully")
            res.redirect("/")
        }
    })
})

router.get('/shopping-cart', function( req,res,next){
    if(!req.session.cart){
return res.render('shopping-cart',{tittle: 'Express-Online Shopping cart', products: null})
    }

    var cart = new Cart(req.session.cart)
    res.render('shopping-cart', {tittle: 'Express-Online Shopping cart', products: cart.generateArray(),totalPrice: cart.totalPrice })
})


router.get('/checkout', isLoggedIn, function(req,res,next){
    if(!req.session.cart){
        return res.redirect('/shopping-cart')
    }
    var cart= new Cart (req.session.cart)
    res.render('checkout',{tittle: 'Express-Online Shopping Checkout Page',total:cart.totalPrice})
})

router.get("/access_token",  (req,res)=>{

   //res.status(200).json({access_token:req.access_token})
  access()
    .then((accessToken)=>{
        res.send("Your access token is"  + accessToken)
       console.log(accessToken)
   
    }).catch(console.log)
})

const consumerKey = process.env.SAFARICOM_CONSUMER_KEY;
 const consumerSecret = process.env.SAFARICOM_CONSUMER_SECRET;

 function access(){
    //access token
    let url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    let auth= 'Basic ' + Buffer.from(consumerKey + ':' + consumerSecret).toString('base64');
    return new Promise((response, reject)=>{
    request(
        {
     url: url,
     headers:{
        Authorization : auth

     },
    },
    (error, res,body)=>{
        var jsonBody = JSON.parse(body);
        if(error){
            
            reject(error);
        }
        else{
            const accessToken= jsonBody.access_token;
            response(accessToken);
            
        }
    }
    )
})

}
//stk push
router.post("/stk",(req, res)=>{

const phone= req.body.phone;
const amount = req.body.amount;



    access()
    .then((accessToken)=>{
        const url="https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
         auth = 'Bearer ' + accessToken;
        var timestamp= moment().format("YYYYMMDDHHmmss");
        const lipaNaMpesaShortCode = process.env.BUSINESS_SHORT_CODE;
        const lipaNaMpesaPasskey = process.env.PASS_KEY;
        const password = base64.encode(utf8.encode(lipaNaMpesaShortCode + lipaNaMpesaPasskey + timestamp));
        


        request(
           {
            url:url,
            method:"POST",
            headers:{
               Authorization: auth, 
            },
            json:{
       BusinessShortCode: lipaNaMpesaShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: lipaNaMpesaShortCode,
      PhoneNumber:phone, 
      CallBackURL: 'https://dce5-105-161-85-137.ngrok.io/callback',
      AccountReference: phone,
      TransactionDesc: 'Service payments',
            },
           } ,

           function(error,response,body){
           
            if(error){
                console.log(error);
            } 
            
            else{
             console.log("Request is succesful. Please insert Pin to finish")
               //console.log(phone)
               //console.log(amount)
             res.status(200).json(body)
              //res.send('STK sent')
              /*
              req.session.message={
                type: "success",
                message: "STK sent. Insert Pin to complete transcation"
            }
            */
        
            //res.redirect("/checkout")
               
            }
           }
        )
    })
    .catch(console.log)
    
})
router.post("/callback", (req, res)=>{
    
    const callbackData= req.body;
    //console.log(callbackData.Body)
    
 if(!callbackData.Body.stkCallback.CallbackMetadata){
    console.log(callbackData.Body)
    return res.json('ok')
 }
 
//console.log(callbackData.Body.stkCallback.CallbackMetadata)

const meta = Object.values(callbackData.Body.stkCallback.CallbackMetadata.Item)
        const PhoneNumber = meta.find(o => o.Name === 'PhoneNumber').Value.toString()
        const Amount = meta.find(o => o.Name === 'Amount').Value.toString()
        const transactionId = meta.find(o => o.Name === 'MpesaReceiptNumber').Value.toString()
        //const TransactionDate = meta.find(o => o.Name === 'TransactionDate').Value.toString()
const order = new Order({

    user: req.user,
    cart: cart,
    fname: req.body.fname,
    lname: req.body.lname,
    transactionId: transactionId,
    amount: Amount,
    phoneNumber:PhoneNumber,
    //TransactionDate: TransactionDate


})

order.save().then((data)=>{
    console.log({message: "Saved Successfully", data})
})
.catch((err)=>{
    console.log(err.message)
})

})

module.exports = router

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        req.session.originalUrl = req.originalUrl
        return next()
    }
    res.redirect('/user/signin')
}