# Usa la imagen oficial de MySQL
FROM mysql:latest

# Configuración de variables de entorno para inicializar MySQL
ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=blog_app
ENV MYSQL_USER=blog_user
ENV MYSQL_PASSWORD=blog_password

# Copia los scripts de inicialización al directorio donde MySQL los ejecutará automáticamente
COPY ./database/mysql/create_tables.sql /docker-entrypoint-initdb.d/

# Exponer el puerto MySQL
EXPOSE 3306

# Comando por defecto para iniciar MySQL
CMD ["mysqld"]
