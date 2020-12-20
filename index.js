const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const ObjectId = require('mongodb').ObjectId;

const MongoClient = require('mongodb').MongoClient;

require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.oor8w.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const port = 5000

const admin = require("firebase-admin");
const serviceAccount = require("./Config/volunteer-network005-firebase-adminsdk-jwva7-12817eff05.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



client.connect(err => {
      const networkCollection = client.db("volunteerNetwork").collection("networkList");
      const allEventCollection = client.db("volunteerNetwork").collection("allEvents");

      app.post("/addEvent",(req, res) => {
        allEventCollection.insertOne(req.body)
        .then(result => {
          res.send(result.insertedCount > 0)
        })
      })

      app.post('/addMyEvent', (req, res) => {
        networkCollection.insertOne(req.body)
          .then(result => {
            res.send(result.insertedCount > 0)
          })
      })


      app.get('/allEvents',(req, res) => {
        allEventCollection.find({})
        .toArray((err,documents) => {
          res.send(documents)
        })
      })


      app.get('/myEvent', (req, res) => {
        const queryEmail = req.query.email;
        const idToken = req.headers.authorization;
        admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          if (queryEmail ===tokenEmail) {
            networkCollection.find({user:queryEmail})
            .toArray((err, documents) => {
              res.send(documents)
            })
          }
        })
      })

      app.get('/allTask', (req, res) => {
        const queryEmail = req.query.email;
        const idToken = req.headers.authorization
        admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          if (queryEmail ===tokenEmail) {
            if (queryEmail === 'sarowarhosenakib2@gmail.com') {
              networkCollection.find({})
              .toArray((err, documents) => {
                res.send(documents)
              })
            }
          }
        })
      })

      app.delete('/deleteTask/:id', (req, res) => {
        const id = req.params.id;
        networkCollection.deleteOne({ _id: ObjectId(id) })
          .then(result => {
            res.send(result.deletedCount > 0)
          })
      })

      app.delete('/adminDeleteTask/:id', (req, res) => {
        networkCollection.deleteOne({ _id: ObjectId(req.params.id)})
          .then(result => {
            res.send(result.deletedCount > 0)
          })
      })
 

});


app.get('/', (req, res) => {
  res.send('Hello World000000!')
})

app.listen(port)