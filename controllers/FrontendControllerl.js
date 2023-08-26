const UserModel = require("../models/user")
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const jwt = require('jsonwebtoken');
const CourseModel = require("../models/course");

cloudinary.config({ 
    cloud_name: 'dye3jylbh', 
    api_key: '825323644814649', 
    api_secret: 'HCaAKmv-NgLdoEDASj6lNjsiJv0' 
  });

class FrontendController {
    static login=async(req, res)=>{
        try {
            res.render('login',{message:req.flash('success')})
        } catch (error){
            console.log(error)
        }
    }
    static register=async(req, res)=>{
        try {
            res.render('register',{message:req.flash('error')})
        } catch (error){
            console.log(error)
        }
    }
    static dashboard=async(req, res)=>{
        try {
            const{name, image, _id} = req.data1
            const btech =await CourseModel.findOne({user_id:_id, course:'B.Tech'})
            const bca =await CourseModel.findOne({user_id:_id, course:'BCA'})
            const mca =await CourseModel.findOne({user_id:_id, course:'MCA'})
            //console.log(name)
            res.render('dashboard',{n:name, img:image, b:btech, bca:bca, mca:mca})
        } catch (error){
            console.log(error)
        }
    }
    static about =async(req, res)=>{
        try {
            const{name, image} = req.data1
            res.render('about',{n:name, img:image})
            res.render('about')
        } catch (error){
            console.log(error)
        }
    }
    static contact =async(req, res)=>{
        try {
            const{name, image} = req.data1
            res.render('contact',{n:name, img:image})
            res.render('contact')
        } catch (error){
            console.log(error)
        }
    }
    static userinsert =async(req, res)=>{
        
            const{name, email, password, confirmpassword}=req.body
         const image = req.files.image
         //console.log(image)
           const imageupload = await cloudinary.uploader.upload(image.tempFilePath,{
            folder:'profileimage'
            })
           // console.log(imageupload)

             const user =await UserModel.findOne({email:email})
            console.log(user)
            if(user){
                req.flash('error', 'email already exist')
                res.redirect('/register')
            }else{
                if(name && email && password && confirmpassword){
                    if(password == confirmpassword){
                        try {
                            const hashpassword = await bcrypt.hash(password, 10);
                        //  console.log(hashpassword);
                            const result = new UserModel({
                                name:name,
                                email:email,
                                password:hashpassword,
                                image: {
                                    public_id: imageupload.public_id,
                                    url: imageupload.secure_url,
                                  },
                            })
                            await result.save()
                                req.flash('success', 'registation successfully please login')
                                res.redirect('/')
                            
                        } catch(error){
                            console.log(error)
                        }
                    }else{
                        req.flash('error', 'password and confirmpassword does not match')
                res.redirect('/register')
                    }
                }else{
                    req.flash('error', 'all field are required')
                res.redirect('/register') 
                }
            }

        
        
    }
    static verifylogin =async(req, res)=>{
        try {
            const { email, password } = req.body;
            if (email && password) {
              const user = await UserModel.findOne({ email: email })
      
              if (user != null) {
                const isMatched = await bcrypt.compare(password, user.password)
               
                if ( isMatched) {
                    if(user.role=='student'){

                              // genrate tocken
               const token = jwt.sign({ ID: user._id }, 'jitendrakumarsharma123');
               //console.log(token)
               res.cookie('token', token)
                     res.redirect('/dashboard')
                    }
                    if(user.role=='admin'){
                            // genrate tocken
               const token = jwt.sign({ ID: user._id }, 'jitendrakumarsharma123');
               //console.log(token)
               res.cookie('token', token)
                     res.redirect('/admin/dashboard')   
                    }
                  
                } else {
                  req.flash('error', 'Email or password is not valid')
                  return res.redirect('/')
                }
              } else {
                req.flash('error', 'You are not a registered user')
                return res.redirect('/')
              }
            } else {
              req.flash('error', 'All Fields Required')
              return res.redirect('/')
            }
          } catch (error) {
            console.log(error);
          }
    }
    static logout = async(req,res)=>{
        try{
            res.clearCookie('token')
            res.redirect('/')
        }catch (error){
            console.log(error)
        }
    }
    static profile = async(req,res)=>{
        try{
            const {name, email, image}=req.data1
            res.render('profile',{n:name, e:email, img:image})
        }catch (error){
            console.log(error)
        }
    }
    static updatepassword = async(req,res)=>{
        try{
            const {id}=req.data1
            const { old_password, new_password, cpassword } = req.body;
      if (old_password && new_password && cpassword) {
        const user = await UserModel.findById(id);
        const ismatch = await bcrypt.compare(old_password, user.password);
        if (!ismatch) {
          req.flash("error", "Old password is incorrect.");
          return res.redirect("/profile");
        } else {
          if (new_password !== cpassword) {
            req.flash("error", "Password and confirm password do not match.");
            return res.redirect("/profile");
          } else {
            const newHashpassword = await bcrypt.hash(new_password, 10);
            await UserModel.findByIdAndUpdate(id, {
              $set: { password: newHashpassword },
            });
            req.flash(
              "success",
              "Password changed successfully. Please log in with your new password."
            );
            return res.redirect("/logout");
          }
        }
      } else {
        req.flash("error", "All fields are required.");
        return res.redirect("/profile");
      }

        }catch (error){
            console.log(error)
        }
    }
    static updateprofile = async(req, res)=>{
        try{
            const {id}=req.data1
          //  console.log(req.body)
           // console.log(req.files.image)
            if (req.files) {
                const user = await UserModel.findById(id);
                const image_id = user.image.public_id;
                await cloudinary.uploader.destroy(image_id);
    
                const file = req.files.image;
                const myimage = await cloudinary.uploader.upload(file.tempFilePath, {
                    folder: "studentimage",
    
                });
                var data = {
                    name: req.body.name,
                    email: req.body.email,
                    image: {
                        public_id: myimage.public_id,
                        url: myimage.secure_url,
                    },
                };
            } else {
                var data = {
                    name: req.body.name,
                    email: req.body.email,
    
                }
            }
            const update_profile = await UserModel.findByIdAndUpdate(id, data)
            res.redirect('/profile')
        } catch(error){
            console.log(error)
        }
    }
}

module.exports = FrontendController