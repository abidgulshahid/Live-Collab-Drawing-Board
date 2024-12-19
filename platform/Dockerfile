# Use the official Node.js 22 image as the base image
FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the application's port (replace 3000 with your app's port if different)
EXPOSE 3000

# Set environment variables for MongoDB and Redis (you can override these during deployment)
ENV MONGO_URI='mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.0'
ENV REDIS_HOST='127.0.0.1'
ENV REDIS_PORT=6379

# Start the application
CMD ["npm", "start"]