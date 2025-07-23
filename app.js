import express from 'express'
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import dotenv from 'dotenv';
import 'dotenv/config'
import cors from 'cors';
import managerRoutes from './routes/managerRoutes.js';
// import stripeRoutes from './routes/stripeRoutes.js';

const app = express()
const port = process.env.PORT;

dotenv.config();

//Middlewares
app.use(express.json({ limit: '20mb' })); // Increased limit for base64 images
app.use(cors());
app.use('/uploads', express.static('uploads'));

//Database 
connectDB();

//Routes
app.use('/api/auth', userRoutes);
app.use('/gameuser', gameRoutes);
app.use('/api/managers', managerRoutes);

// stripe route
// app.use('/stripe', stripeRoutes);

// Protected Routes
import verifyToken from './middlewares/verifyToken.js';
app.use('/api/categories', verifyToken, categoryRoutes);

// uploads 
app.use('/uploads', express.static('uploads'));


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})