const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const User = require('./backend/src/models/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        // Find the 'pharmacy' user created by the seeder (or any pharmacy)
        const pharmacy = await User.findOne({ role: 'pharmacy' }).sort({ createdAt: -1 }); // Get latest
        console.log('PHARMACY_DATA:', JSON.stringify(pharmacy));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

run();
