const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const app = express();
require('dotenv').config();
const port = 5000;

//middleware 
app.use(cors())
app.use(bodyParser.json())
app.use(fileUpload());
app.use(express.static('services'))

//database
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8acpe.mongodb.net/${process.env.DB_PASS}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



app.get("/",(req,res) =>{
    res.send("hello our app is running")
})




//database connection
client.connect(err => {
  const serviceCollection = client.db(process.env.DB_NAME).collection("services");
  const feedbackCollection = client.db(process.env.DB_NAME).collection("feedback");
  const orderCollection = client.db(process.env.DB_NAME).collection("allOrder");
  const adminCollection = client.db(process.env.DB_NAME).collection("admin");

  app.post("/addServices",(req,res)=>{
      const title = req.body.title
      const description = req.body.description
      const file = req.files.file
      const newImg = file.data;
      const encImg = newImg.toString('base64')
      const image ={
            contentType : req.files.file.mimetype,
            size : req.files.file.size,
            img : Buffer(encImg,'base64')
        }
     serviceCollection.insertOne({title,description,image})
     .then(result =>{
         res.send(result.insertedCount>0)
     })
  })

  app.get("/services",(req,res)=>{
      serviceCollection.find({})
      .toArray((err,documents)=>{
          res.send(documents)
      })
  })

  app.get("/feedback",(req,res)=>{
      feedbackCollection.find({})
      .toArray((err,documents)=>{
          res.send(documents)
      })
  })

  app.post("/addOrder",(req,res)=>{
      const data = req.body
      orderCollection.insertOne(data)
      .then(result =>{
          res.send(result.insertedCount > 0)
      })
  })

 
  app.get("/orders",(req,res)=>{
      const email = req.query.email;
      orderCollection.find({email:email})
      .toArray((err,documents)=>{
          res.send(documents)
      })
  })

  app.get("/service",(req,res)=>{
      const title = req.query.title
      serviceCollection.find({title:title})
      .toArray((err,documents)=>{
          res.send(documents)
      })
  })

  app.get("/allorder",(req,res)=>{
      orderCollection.find({})
      .toArray((err,documents)=>{
          res.send(documents)
      })
  })
  

  app.post("/addFeedback",(req,res)=>{
      const data = req.body
     feedbackCollection.insertOne(data)
     .then(result =>{
         res.send(result.insertedCount>0)
     })
  })
  //to add admin
  app.post("/addAdmin",(req,res)=>{
      const email = req.body
      adminCollection.insertOne(email)
      .then(result =>{
          res.send(result.insertedCount>0)
      })
  })

  app.post("/admin",(req,res)=>{
      const email = req.body;
      adminCollection.find(email)
      .toArray((err,documents)=>{
          if(documents.length > 0){
              res.send(documents.length > 0)
          }
          else{
              res.send(false)
          }
      })
  })



  
});


app.listen(process.env.PORT || port)