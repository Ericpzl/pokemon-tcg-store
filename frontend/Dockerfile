FROM nginx:alpine
# Copiamos todos los archivos estáticos a la carpeta de nginx
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
COPY components /usr/share/nginx/html/components
COPY pages /usr/share/nginx/html/pages

# Redirigir la ruta raíz (/) a pages/index.html
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html/pages; index index.html; } location ~ ^/(css|js|components)/ { root /usr/share/nginx/html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
