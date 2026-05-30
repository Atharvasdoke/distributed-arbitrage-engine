package main

import (
	"database/sql"
	"fmt"
	"os"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func ConnectDB() error {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "arbitrage.db"
	}
	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return fmt.Errorf("unable to connect to database: %w", err)
	}
	DB = db
	return initSchema()
}

func initSchema() error {
	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email VARCHAR(255) UNIQUE NOT NULL,
		password_hash VARCHAR(255) NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS retailers (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name VARCHAR(255) NOT NULL,
		url VARCHAR(255) NOT NULL
	);

	CREATE TABLE IF NOT EXISTS products (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name VARCHAR(255) NOT NULL,
		sku VARCHAR(255) UNIQUE NOT NULL
	);

	CREATE TABLE IF NOT EXISTS prices (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		product_id INTEGER REFERENCES products(id),
		retailer_id INTEGER REFERENCES retailers(id),
		price REAL NOT NULL,
		currency VARCHAR(10) NOT NULL,
		timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	INSERT OR IGNORE INTO retailers (id, name, url) VALUES 
		(1, 'eBay', 'https://www.ebay.com'),
		(2, 'Newegg', 'https://www.newegg.com');

	INSERT OR IGNORE INTO products (id, name, sku) VALUES 
		(1, 'Sony PlayStation 5', 'PlayStation 5 Console'),
		(2, 'NVIDIA RTX 4090', 'RTX 4090 Graphics Card');
	`
	_, err := DB.Exec(schema)
	return err
}
