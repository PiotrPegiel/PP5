# Use the official Node.js image as the base image
FROM node:22.11.0

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Prettier and ESLint
RUN npm install --save-dev prettier eslint

# Copy the rest of the application code to the working directory
COPY . .

# Copy the ESLint configuration file
COPY eslint.config.js ./

# Run ESLint and Prettier
RUN npm run lint
RUN npm run format

# Expose the port the app runs on
EXPOSE 3000

# Start the backend server
CMD ["node", "server.js"]