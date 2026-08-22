# Lightweight Nginx Web Server for Digital Land Registry Frontend UI
FROM nginx:alpine

# Copy static frontend web assets
COPY public /usr/share/nginx/html

# Copy Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP container port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
