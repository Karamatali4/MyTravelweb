const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema=  new  mongoose.Schema({

    fullname:{
        type: String,
        require: true
    },
    username:{
        type: String,
        require: true
    },
    email:{
        type: String,
        require: true,
        unique: true
        // validate: 
        //     (email) =>  validator.isEmail(email)
            
    },
    phone:{
        type: Number,
        require: true
         
        
    },

    age:{
        type: Number,
        require: true
    },
    gender:{
        type: String,
        require:true
    },
    password:{
        type: String,
        require: true
        // minlength: 2,
        // maxlength: 8
    },
    confirmpassword:{
        type: String,
        require: true
        // minlength: 2,
        // maxlength: 8
    },
    tokens:[
        {
            token:{
                type: String,
                require: true
            }
        }
    ]

});
        // Generate Tokens Authentication
    userSchema.methods.generateAuthToken =   async function() {
        try{
            const token = await jwt.sign({_id: this._id.toString()},process.env.SECRET_KEY);
            this.tokens = this.tokens.concat({token:token});
            await this.save();
            // console.log(token);
            return token;
        
            // const userVeri = await jwt.verify(token, "asdfghjkloiuytrewqasdfghjklmnbvckk");
            // console.log(userVeri);
        }
        catch(err){
            console.log(err);
        }
        
    }         


        // Password secure method
userSchema.pre("save", async function(next) {

    if(this.isModified("password")){
        console.log(`actual passwod ${this.password}`);
    this.password = await bcrypt.hash(this.password,10);
    this.confirmpassword = await bcrypt.hash(this.password,10);
    console.log(`new passwod ${this.password}`);

    // this.confirmpassword = undefined;
    }
    
    next();
});

    // create collection
const UserCollection = new mongoose.model("UserCollection",userSchema);


module.exports = UserCollection;