# Use official PHP image as base image
FROM php:7.4-apache

# Create a directory for the PHP files
WORKDIR /var/www/html

# Instala las extensiones necesarias
RUN apt-get update && \
    apt-get install -y iputils-ping && \
    docker-php-ext-install mysqli && \
    docker-php-ext-enable mysqli
# Copy the entire scripts directory
COPY scripts scripts/

# Copy the CSS file
COPY css css/

#Copy the php code
COPY comments.php comments.php
COPY index.php index.php
COPY register.php register.php

# Expose port 80
EXPOSE 80