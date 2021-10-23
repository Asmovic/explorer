const fs = require('fs');
const mongoose = require('mongoose');
const dotEnv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotEnv.config({ path: './config.env' });

const DB = process.env.MONGO_URI.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose.connect(DB, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })
.then((db) => {
    /* db.store.ensureIndex({ "address.location.coordinates": "2d" }) */
    console.log("Database connected successfully!!!", db)}
    );

//READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//IMPORT DATA INTO DB
const importData = async () =>{
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
        console.log("Data Successfully Loaded.");
    } catch (error) {
        console.log("Error", error);
    }
    process.exit();
}

const dropTourIndexes = async () => {
    /* try {
        await Tour.dropIndexes();
        
        console.log("Indexes cleared Successfully.");
    } catch (error) {
        console.log("Error", error);
    } */
    /* process.exit(); */
}

//DELETE ALL DATA FROM DB
const deleteData = async()=>{
    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Data deleted successfully");
    } catch (error) {
        console.log("Error", error);
    }
    process.exit();
}

if(process.argv[2] === '--import'){
    importData()
} else if(process.argv[2] === '--delete'){
deleteData()
}else{
    dropTourIndexes()
}