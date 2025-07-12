import { connect } from 'mongoose';
import User, { findOne } from './models/User';

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await connect(process.env.MONGODB_URI , {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    await createDefaultAdmin();
    
  } 
  catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const createDefaultAdmin = async () => {
  try {
    const adminExists = await findOne({ email: 'admin@rewear.com' });
    
    if (!adminExists) {
      const adminUser = new User({
        email: 'admin@rewear.com',
        password: 'admin123', 
        name: 'Admin User',
        isAdmin: true,
        points: 1000
      });
      
      await adminUser.save();
      console.log('Default admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

export default { connectDB }; 