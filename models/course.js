const mongoose = require('mongoose')
//create schema
const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        Required: true
    },
    email: {
        type: String,
        Required: true
    },
    mobile: {
        type: String,
        Required: true
    },
    dob: {
        type: String,
        Required: true
    },
    gender: {
        type: String,
        Required: true
    },
    address: {
        type: String,
        Required: true
    },
    college: {
        type: String,
        Required: true
    },
    course: {
        type: String,
        Required: true
    },
    branch: {
        type: String,
        Required: true
    },
    user_id: {
        type: String,
        Required: true
    },
    status:{
        type:String,
        default:'Panding'
      }
}, { timestamp: true })

const CourseModel = mongoose.model('course', CourseSchema)

module.exports = CourseModel