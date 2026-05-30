package main

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

func ConnectDB() error {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://postgres:postgres@localhost:5432/arbitrage?sslmode=disable"
	}
	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		return fmt.Errorf("unable to connect to database: %w", err)
	}
	DB = pool
	return initSchema()
}

func initSchema() error {
	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		email VARCHAR(255) UNIQUE NOT NULL,
		password_hash VARCHAR(255) NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS retailers (
		id SERIAL PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		url VARCHAR(255) NOT NULL
	);

	CREATE TABLE IF NOT EXISTS products (
		id SERIAL PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		sku VARCHAR(255) UNIQUE NOT NULL
	);

	CREATE TABLE IF NOT EXISTS prices (
		id SERIAL PRIMARY KEY,
		product_id INTEGER REFERENCES products(id),
		retailer_id INTEGER REFERENCES retailers(id),
		price NUMERIC(10, 2) NOT NULL,
		currency VARCHAR(10) NOT NULL,
		timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	`
	_, err := DB.Exec(context.Background(), schema)
	return err
}
