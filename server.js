// import dotenv from 'dotenv';
// import express from 'express';
// import connectDB from './config/database.js';
// import cardRoutes from './routes/cardRoutes.js';
// import { startSocket, } from './socket/sockectServer.js';
// import { startSocketOne, } from './socket/sockectServerOne.js';
// import { startSocketTwo, } from './socket/sockectServerTwo.js';
// import { startSocketThree, } from './socket/sockectServerThree.js';
// import http from 'http';
// import cors from 'cors';

// // import Timer from './models/Timer';
// import superAdminRoutes from './routes/superAdminRoutes.js';
// import adminRoutes from './routes/adminRoutes.js';
// import subAdminRoutes from './routes/subAdminRoutes.js'
// import districtAdminRoutes from './routes/districtAdminRoutes.js'
// import userRoutes from './routes/userRoutes.js';

// dotenv.config();

// const app = express();

// // Connect to the database
// connectDB();

// app.use(cors({
//     origin: '*',  // Allows all origins; for production, specify allowed origins
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // // Define routes
// app.use("/api/super-admin", superAdminRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/sub-admin", subAdminRoutes);
// app.use("/api/district-admin", districtAdminRoutes);
// app.use("/api/user", userRoutes);
// app.use('/api/cards', cardRoutes);

// const PORT = process.env.PORT || 5000;

// const httpServer = http.createServer(app)
// startSocket(httpServer);
// startSocketOne(httpServer);
// startSocketTwo(httpServer);
// startSocketThree(httpServer); 

// httpServer.listen(PORT, () => {
//     console.log('HTTP server is running on port 5000');
// });


import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/database.js';
import cardRoutes from './routes/cardRoutes.js';
import { startSocket } from './socket/sockectServer.js';
import { startSocketOne } from './socket/sockectServerOne.js';
import { startSocketTwo } from './socket/sockectServerTwo.js';
import { startSocketThree } from './socket/sockectServerThree.js';
import http from 'http';
import cors from 'cors';

import superAdminRoutes from './routes/superAdminRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import subAdminRoutes from './routes/subAdminRoutes.js'
import districtAdminRoutes from './routes/districtAdminRoutes.js'
import userRoutes from './routes/userRoutes.js';

dotenv.config();

// Create separate Express apps for each socket server
const mainApp = express();
const socketOneApp = express();
const socketTwoApp = express();
const socketThreeApp = express();

// Connect to the database
connectDB();

// Configure CORS for all apps
const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
};

mainApp.use(cors(corsOptions));
socketOneApp.use(cors(corsOptions));
socketTwoApp.use(cors(corsOptions));
socketThreeApp.use(cors(corsOptions));

// Configure middleware for main app
mainApp.use(express.json());
mainApp.use(express.urlencoded({ extended: true }));

// Define routes for main app
mainApp.use("/api/super-admin", superAdminRoutes);
mainApp.use("/api/admin", adminRoutes);
mainApp.use("/api/sub-admin", subAdminRoutes);
mainApp.use("/api/district-admin", districtAdminRoutes);
mainApp.use("/api/user", userRoutes);
mainApp.use('/api/cards', cardRoutes);

// Create HTTP servers
const mainServer = http.createServer(mainApp);
const socketOneServer = http.createServer(socketOneApp);
const socketTwoServer = http.createServer(socketTwoApp);
const socketThreeServer = http.createServer(socketThreeApp);

// Define different ports for each server
const MAIN_PORT = process.env.PORT || 5000;
const SOCKET_ONE_PORT = 5001;
const SOCKET_TWO_PORT = 5002;
const SOCKET_THREE_PORT = 5003;

// Start each socket server separately
startSocket(mainServer);
startSocketOne(socketOneServer);
startSocketTwo(socketTwoServer);
startSocketThree(socketThreeServer);

// Start listening on different ports
mainServer.listen(MAIN_PORT, () => {
    console.log(`Main server running on port ${MAIN_PORT}`);
});

socketOneServer.listen(SOCKET_ONE_PORT, () => {
    console.log(`Socket One server running on port ${SOCKET_ONE_PORT}`);
});

socketTwoServer.listen(SOCKET_TWO_PORT, () => {
    console.log(`Socket Two server running on port ${SOCKET_TWO_PORT}`);
});

socketThreeServer.listen(SOCKET_THREE_PORT, () => {
    console.log(`Socket Three server running on port ${SOCKET_THREE_PORT}`);
});