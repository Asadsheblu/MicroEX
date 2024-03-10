const express = require("express");
const app = express();

require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const { query } = require("express");

// Enable CORS
app.use(cors());
const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

// Parse incoming requests with JSON payloads
app.use(express.json());

// Middleware to set CORS headers
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,authorization"
  );
  next();
});

const port = 5000;

// Default route
app.get("/", (req, res) => {
  res.send("Hello Microters Extension");
});

// MongoDB connection URI
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.7auxx.mongodb.net:27017,
    cluster0-shard-00-01.7auxx.mongodb.net:27017,
    cluster0-shard-00-02.7auxx.mongodb.net:27017/?ssl=true&replicaSet=atlas-quc4tl-shard-0&authSource=admin&retryWrites=true&w=majority`;

// Create a new MongoClient
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// Async function to run the server
async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db("microEx");
    const api = db.collection("api"); // Define the collection

    // POST endpoint to insert data
    app.post("/api", async (req, res) => {
      const doc = req.body;
      const result = await api.insertOne(doc);
      console.log(result);
      res.send(result);
    });

    // GET endpoint to fetch all data
    app.get("/api", async (req, res) => {
      try {
        const result = await api.find({}).toArray(); // Use 'api' collection here
        res.json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // PUT endpoint to update data by ID
    app.put("/api/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;

      try {
        // Exclude _id field from the update operation
        delete updatedData._id;

        const result = await api.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );
        console.log(result);

        if (result.modifiedCount === 1) {
          res.status(200).json({ message: "Data updated successfully" });
        } else {
          res.status(404).json({ message: "Data not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
    app.delete("/api/:id", async (req, res) => {
        const id = req.params.id;
      
        try {
          const result = await api.deleteOne({ _id: new ObjectId(id) });
          console.log(result);
      
          if (result.deletedCount === 1) {
            res.status(200).json({ message: "Data deleted successfully" });
          } else {
            res.status(404).json({ message: "Data not found" });
          }
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Internal server error" });
        }
      });
  } finally {
    // await client.close();
  }
}

// Start the server
run().catch(console.dir);

// Listen for requests on the specified port
app.listen(port, () => {
  console.log(`Running server ${port}`);
});
