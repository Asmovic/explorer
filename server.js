const mongoose = require('mongoose');
const dotEnv = require('dotenv');

process.on('uncaughtException', (error)=>{
    // console.log(error.name, error.message);
    console.log('Uncaught Exception. 😠   Server shutting down!...');
    process.exit(1);
});

dotEnv.config({ path: './config.env' });

const DB = process.env.MONGO_URI.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose.connect(DB, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })
.then(() => console.log("Database connected successfully!!!"));


const app = require('./app');


const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, console.log(`App running on PORT ${PORT}`));

process.on('unhandledRejection', (error)=>{
  //  console.log(error.name, error.message);
    console.log('Unhandled Rejection. 😧   Server shutting down!...')
    server.close(()=>{
        process.exit(1);
    })
});

process.on('SIGTERM', ()=>{
    console.log('🦊 SIGTERM RECEIVED. Shutting down gracefully!')
    server.close(()=>{
        console.log('🐞 Process terminated.')
    })
})

