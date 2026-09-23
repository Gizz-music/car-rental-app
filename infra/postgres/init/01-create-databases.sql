-- Runs only on the first start, when the postgres-data volume is empty.
-- Database per service: services must not share tables.
CREATE DATABASE car_rental_auth;
CREATE DATABASE car_rental_rentals;
