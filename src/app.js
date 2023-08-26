require('dotenv').config();
const express = require("express");
const session = require('express-session');
require("./db/conn");
const UserCollection = require("./models/userModel");
const app = express();
const port= process.env.PORT || 3000;
const hbs = require("hbs");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const path = require("path");
const auth = require("./middleware/auth");
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// console.log(path.join(__dirname, "../public"));
const staticpathPublic = path.join(__dirname, "../public");
const staticpathtemplates = path.join(__dirname, "../templates/views");
const staticpathpartials= path.join(__dirname, "../templates/partials");

app.use(express.static(staticpathPublic));
app.set("view engine", "hbs");
app.set("views", staticpathtemplates);
hbs.registerPartials(staticpathpartials);


app.get("/", (req,res) => {
    res.render("index");
});
app.get("/register", (req,res) => {
    res.render("register");
});

app.get("/home", auth, (req,res) => {
    let fullname =  req.user.fullname;
    // console.log(username);
    
    res.render("home",{fullname:fullname});
    // console.log(`my coolie:  ${req.cookies.jwt}`);

});

app.get("/aboutus",auth, (req,res) => {
    let fullname =  req.user.fullname;
    res.render("aboutus",{fullname:fullname});
});

        //user Info
app.get("/userInfo",auth, (req,res) => {
    let fullname =  req.user.fullname;
    let username =  req.user.username;
    let email =  req.user.email;
    let age =  req.user.age;
    let phone =  req.user.phone;
    let gender =  req.user.gender;
    res.render("UserInfo",{

        fullname:fullname,
        username:username,
        email:email,
        age:age,
        phone:phone,
        gender:gender

    });
});

app.get("/login", (req,res) => {
    res.render("login",{
        alertClass: req.session.alertClass,
        alertMessage: req.session.alertMessage
    });
    // Clear the session message after displaying it
    req.session.alertClass = '';
    req.session.alertMessage = '';
});


        //Logout section
app.get("/logout",auth, async(req,res) => {
    try{
                //Logout single devices only
        req.user.tokens = req.user.tokens.filter( (currElement) => {
            return currElement.token != req.token;
        });

                //Logout all Devices
        // req.user.tokens = [];



        res.clearCookie("jwt");
        console.log("Logout Successfully...");
        await req.user.save();
        res.redirect("login");
    }
    catch(err){
        res.status(500).send(err);
    }
});


        // registration User
app.post("/register", async(req,res) => {
    const fullname = req.body.fullname;
    // console.log(fullname);
    try{
        const password = req.body.password;
        const confirmpassword = req.body.confirmpassword;

        if(password===confirmpassword){
            const createUser = new UserCollection({
                fullname: req.body.fullname,
                username: req.body.username,
                email: req.body.email,
                phone: req.body.phone,
                age: req.body.age,
                gender: req.body.gender,
                password: password,
                confirmpassword: confirmpassword,
            });

            const token = await createUser.generateAuthToken();
            console.log("The Token part " + token);


            // res.cookie("jwt", token,{
            //     expires: new Date(Date.now() + 30000),
            //     httpOnly: true
            // });
            // console.log(cookie);


            const result = await createUser.save();
            
            req.session.alertClass = 'alert-success'; // CSS class for styling
    req.session.alertMessage = 'Registration successful!'; // Message to display
            res.status(201).redirect("login");
            
        }
        else{
            res.render("register",{
                passwordnotsame: "Password are not same..."
            })
            // res.send("Password are not same...")
        }
        
    }
    catch(err){
        res.status(400).send(err);
    }
});

app.post("/login", async(req,res) => {

    try{
        const email= req.body.email; 
        const password = req.body.password;

        const userEmail = await UserCollection.findOne({email:email});
        
        const isMatch =await bcrypt.compare(password, userEmail.password);
        
        const token1 = await userEmail.generateAuthToken();
            console.log("The Token part " + token1);

            res.cookie("jwt", token1
            ,{
                        //Expire the cookies 
                // expires: new Date(Date.now() + 60000),
                httpOnly: true
                // secure:true    for https useage in production phase
            }
            );
            
            

        if(isMatch){
            res.status(201).redirect("home");
        }
        else{
            // res.send("Invalid Password");
            res.render("login",
            {
                invalidpass: "Invalid Password"
            })
        }
    }
    catch(err){
        res.status(400).render("login",{
            invalidemail:"  Invalid login details"
        });
    }
});





app.listen(port, () => {
    console.log(`Listening Port: ${port}`);
});