const mongoose = require ("mongoose")
const productSchema = new mongoose.Schema({

    Product_name:{
        type: String,
        required: true,
    },

    Description:{
        type: String,
        required: true,
    },
    
    Cost:{
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: true,
    },
    created_at:{
        type: String,
        required: true,
        default: Date.now
    }
})

module.exports= mongoose.model("Product",productSchema)