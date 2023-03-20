const express= require('express')
const router = express.Router()
const multer = require ('multer')
const product = require('../models/Product')
const fs = require("fs")
const Product = require('../models/Product')
const Cart = require('../models/cart')
const req = require('express/lib/request')
const { session } = require('passport')

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


router.get('/checkout', function(req,res,next){
    if(!req.session.cart){
        return res.redirect('/shopping-cart')
    }
    var cart= new Cart (req.session.cart)
    res.render('checkout',{tittle: 'Express-Online Shopping Checkout Page',total:cart.totalPrice})
})
module.exports = router