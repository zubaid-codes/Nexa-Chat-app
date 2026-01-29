import express from "express"
import dotenv from 'dotenv'
import mongoose from "mongoose"
import chatbotroutes from "./routes/chatbot.route.js"
import cors from "cors";

dotenv.config()
const app = express()
const port=process.env.PORT || 3000

// middleware
app.use(express.json());


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);



// database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to DB...");
  })
  .catch((error) => {
    console.error("Error in connecting to DB:", error.message);
  });


// defining Routes...
app.use("/bot/v1/",chatbotroutes)

app.listen(port,()=>{
    console.log(`Server is listening at port ${port}`)
})