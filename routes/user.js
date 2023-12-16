const express= require('express')
const router = express.Router()
const passport = require('passport')

router.get('/profile', isLoggedIn,(req, res,next)=>{
    res.render ("users/profile",{tittle: 'Profile page'}) 
})

router.get('/logout', isLoggedIn,(req, res,next)=>{
    req.logout((err) =>{
        if (err) { return next(err); }
        res.redirect('/')
      });
})
router.use('/',notLoggedIn,function(req,res,next){
    next()
})
router.get('/signup',notLoggedIn, (req, res,next)=>{
    var messages = req.flash('error')
    res.render ("users/signup",{tittle: ' Signup Page', messages: messages, hasErrors: messages.length>0}) 
})

router.post("/signup", passport.authenticate('local.signup',{
 // successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
}), function(req, res, next){
    if(req.session.oldUrl){
        var oldUrl = req.session.oldUrl 
        res.session.oldUrl =null; 
        res.redirect(oldUrl)
        
    } else{
        res.redirect('/user/profile')
    } 
})


router.get('/signin', notLoggedIn, (req, res,next)=>{
    var messages = req.flash('error')
    res.render ("users/signin",{tittle: 'Sign page',messages: messages, hasErrors: messages.length>0}) 
})
router.post('/signin', passport.authenticate ('local.signin',{
    successRedirect: '/user/profile',
    failureRedirect: '/user/signin',
    failureFlash: true
}))

module.exports = router

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
   
    res.redirect('/profile')
}

function notLoggedIn(req,res,next){
    if(!req.isAuthenticated()){
        return next()
    }
    res.redirect('/')
}

