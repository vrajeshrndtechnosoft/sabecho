const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const serveStatic = require('serve-static');
const path = require('path');
const cron = require('node-cron');
const {exportAndBackupAllCollectionsmonthly} = require("./controller/Backup")
require('dotenv').config();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();

// Increase body size limit for JSON requests
app.use(bodyParser.json({ limit: '50mb' })); // Adjust the size limit as needed

// Increase body size limit for URL-encoded requests
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());

app.use(cookieParser());


// Swagger setup
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerDocs = require('./swaggerConfig');


  app.use(cors());

cron.schedule('59 23 31 * *', () => {
   
    exportAndBackupAllCollectionsmonthly();
}, {
    scheduled: true,
    timezone: "Asia/Kolkata" 
});



// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// Static file serving
// app.use('/uploads', serveStatic(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.DATABASE_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});

// Use routes
app.use('/api/product', require('./routes/product'));
app.use('/api/services', require('./routes/services'));
app.use('/api/news', require('./routes/news'));
app.use('/api/pageHeading', require('./routes/pageHeading'));
app.use('/api/image', require('./routes/image'));
app.use('/api/testimonial', require('./routes/testinomial'));
app.use('/api/faq', require('./routes/FAQ'));
app.use('/api/staff', require('./routes/ourStaff'));
app.use('/api/banner', require('./routes/Banner'));
app.use('/api/pageContent', require('./routes/pageContent'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/password',require('./routes/forgotpassword'));
app.use('/api/email', require('./routes/email'));
app.use('/api/logo', require('./routes/logo'));
app.use('/api/backup', require('./routes/backup'));
app.use('/api/aboutusPoints', require('./routes/aboutuspoints'));
app.use("/api/achievements",require('./routes/achievements'));
app.use("/api/counter",require('./routes/counter'));
app.use("/api/inquiries",require('./routes/inquiry'));
app.use("/api/mission",require('./routes/mission'));
app.use("/api/vision",require('./routes/vision'));
app.use("/api/corevalue",require('./routes/corevalue'));
app.use("/api/aboutcompany",require('./routes/aboutcompany'));
app.use("/api/careeroption",require('./routes/careeroption'));
app.use("/api/careerInquiries",require('./routes/careerinquiry'));
    app.use("/api/footer",require('./routes/footer'));
app.use("/api/header",require('./routes/header'));
app.use("/api/globalpresence",require('./routes/globalpresence'));
app.use("/api/whatsappsettings",require('./routes/whatsappsettings'));
app.use("/api/googlesettings",require('./routes/googlesettings'));
app.use("/api/menulisting",require('./routes/menulisting'));    
app.use("/api/infrastructure",require('./routes/infrastructure'));
app.use("/api/qualitycontrol",require('./routes/qualitycontrol'));
app.use("/api/sitemap",require('./routes/sitemap'));
app.use("/api/benefits",require('./routes/benefits'));
app.use('/api/herosection',require('./routes/herosection'));
app.use('/api/serviceDetails',require('./routes/serviceDetails'));
app.use("/api/homehero",require('./routes/homeHero'));
app.use("/api/homepage",require('./routes/homepage'));
app.use("/api/video",require('./routes/video'));
app.use("/api/serviceImages",require('./routes/serviceImage'));
app.use("/api/industryImages",require('./routes/industryimage'));
app.use("/api/packages",require('./routes/plan'));
app.use("/api/designProcess",require('./routes/designProcess'));
app.use("/api/content",require('./routes/content'));
app.use("/api/submenulisting",require('./routes/submenu'));
app.use("/api/industries",require('./routes/industries'));
app.use("/api/industiesHeroSection",require('./routes/industriesHeroSection'));
app.use("/api/industiesDetails",require('./routes/industriesdetails'));
app.use('/api/portfolio',require('./routes/portfoliocategory'));
app.use('/api/navbar' , require('./routes/navbardata'));
app.use('/api/contactInfo' , require('./routes/contactInfo'));
app.use('/api/icon' , require('./routes/contactIcon'));
app.use('/api/address' , require('./routes/address'));
app.use("/api/contactinquiries",require('./routes/contactinquiry'));
app.use("/api/colors",require('./routes/managecolor'));
app.use("/api/newsletter",require('./routes/newsletter'));
app.use("/api/card",require('./routes/cards'));
app.use("/api/home",require('./routes/homeanimation'));
app.use("/api/popupinquiry",require('./routes/popupinquiry'));
app.use("/api/herosectioninquiry",require('./routes/herosectioninquiry'));
app.use("/api/logotype",require('./routes/logotype'));
app.use("/api/packagedescription",require('./routes/packagedescription'));



app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
  
const port = process.env.PORT || 3006;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
