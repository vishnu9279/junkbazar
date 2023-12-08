# Use an argument to set the Node.js version
ARG NODE_VERSION=20

# Use the official Node.js image with the specified version
FROM node:${NODE_VERSION}

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the entire application to the working directory
COPY . .

# Build the application (if needed)
RUN npm run build

# Expose the port your application will run on
EXPOSE 3000

# Command to run your application
CMD ["npm", "start"]
