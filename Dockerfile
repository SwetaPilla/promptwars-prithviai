FROM nginx:alpine
# Copy local static files to default nginx html directory
COPY index.html style.css app.js /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
