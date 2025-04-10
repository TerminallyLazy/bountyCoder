require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Define the admin user details
    const email = 'admin@bountycoder.com';
    const password = 'admin123';
    const name = 'Admin User';
    const role = 'ADMIN';
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      console.log(`User with email ${email} already exists.`);
      return;
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create the admin user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });
    
    console.log('Admin user created successfully:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', user.id);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
