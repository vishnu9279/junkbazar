# Use an argument to set the Node.js version
ARG NODE_VERSION=14

# Use the official Node.js image with the specified version
FROM node:${NODE_VERSION}

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
        libnss3 \
        libatk-bridge2.0-0 \
        libatk1.0-0 \
        libxkbcommon0 \
        libgtk-3-0 \
        libgbm1 \
        libasound2

# Install Puppeteer
RUN npm install puppeteer --production

# Copy the entire application to the working directory
COPY . .

# Build the application (if needed)
# RUN npm run build

# Expose the port your application will run on
EXPOSE 3000

# Command to run your application
CMD ["npm", "start"]
