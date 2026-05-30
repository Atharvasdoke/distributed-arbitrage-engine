package main

import (
	"database/sql"
	"fmt"
	"math/rand"
	"time"

	_ "modernc.org/sqlite"
)

func main() {
	fmt.Println("Starting real-time market simulator...")
	db, err := sql.Open("sqlite", "arbitrage.db")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	// Seed Retailers
	retailers := []string{"Amazon", "Walmart", "BestBuy", "Target"}
	for _, r := range retailers {
		db.Exec("INSERT OR IGNORE INTO retailers (name, url) VALUES (?, ?)", r, "http://example.com")
	}

	// Seed Products
	products := []struct{ Name, Sku string }{
		{"Sony PlayStation 5", "PS5-001"},
		{"Apple iPad Pro 12.9", "IPAD-PRO-129"},
		{"NVIDIA RTX 4090", "RTX-4090"},
		{"Samsung Galaxy S24", "SGS24"},
		{"Nintendo Switch OLED", "SW-OLED"},
	}
	for _, p := range products {
		db.Exec("INSERT OR IGNORE INTO products (name, sku) VALUES (?, ?)", p.Name, p.Sku)
	}

	fmt.Println("Database seeded. Starting real-time price injection loop...")

	// Infinite loop generating real-time prices
	basePrices := []float64{499.99, 1099.00, 1599.99, 899.99, 349.99}

	for {
		for i := 1; i <= len(products); i++ {
			for j := 1; j <= len(retailers); j++ {
				// Fluctuate price by +/- 5%
				volatility := 1.0 + (rand.Float64()*0.1 - 0.05)
				price := basePrices[i-1] * volatility

				db.Exec("INSERT INTO prices (product_id, retailer_id, price, currency) VALUES (?, ?, ?, ?)", i, j, price, "USD")
			}
		}
		fmt.Println("Injected new live prices...")
		time.Sleep(3 * time.Second)
	}
}
