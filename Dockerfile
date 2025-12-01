# Use an official Nginx image as the base
FROM nginx:alpine

# Copy the website files into the container
COPY index.html /usr/share/nginx/html
