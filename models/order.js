const mongoose = require ("mongoose")
const Schema = mongoose.Schema;
const orderSchema = new Schema({
     
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    cart: {type:Object,required: true},
    fname: {type: String, required: true},
    lname: {type: String, required: true},
    phoneNumber: {type: String, required: true},
    amount: {type:String, required: true}, 
    transactionId: { type: String, required: true},
    created_at:{
        type: String,
        required: true,
        default: Date.now
    }
})

module.exports= mongoose.model("Order",orderSchema)