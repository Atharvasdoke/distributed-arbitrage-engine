package main

import (
	"context"
	"log"
	"net"

	"core/pb" // Assumes protoc generated code is here
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"google.golang.org/grpc"
)

// GRPC Server Implementation
type arbitrageServer struct {
	pb.UnimplementedArbitrageServiceServer
}

func (s *arbitrageServer) ReportPrice(ctx context.Context, req *pb.ReportPriceRequest) (*pb.ReportPriceResponse, error) {
	for _, p := range req.Prices {
		_, err := DB.Exec(ctx, 
			"INSERT INTO prices (product_id, retailer_id, price, currency) VALUES ($1, $2, $3, $4)",
			p.ProductId, p.RetailerId, p.Price, p.Currency,
		)
		if err != nil {
			log.Printf("Failed to insert price for product %d: %v", p.ProductId, err)
		}
	}
	return &pb.ReportPriceResponse{Success: true, Message: "Prices recorded"}, nil
}

func startGRPCServer() {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	s := grpc.NewServer()
	pb.RegisterArbitrageServiceServer(s, &arbitrageServer{})
	log.Printf("gRPC server listening at %v", lis.Addr())
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}

func main() {
	// 1. Connect to Postgres
	if err := ConnectDB(); err != nil {
		log.Fatalf("Could not connect to database: %v", err)
	}
	defer DB.Close()

	// 2. Start gRPC Server in a goroutine
	go startGRPCServer()

	// 3. Start Fiber REST API
	app := fiber.New()
	app.Use(cors.New())

	// Auth routes
	app.Post("/api/register", RegisterHandler)
	app.Post("/api/login", LoginHandler)

	// Protected routes
	api := app.Group("/api", AuthMiddleware)
	
	api.Get("/dashboard", func(c *fiber.Ctx) error {
		// Mock data for dashboard
		return c.JSON(fiber.Map{
			"total_products": 142,
			"active_workers": 3,
			"opportunities": 12,
		})
	})

	api.Get("/prices", func(c *fiber.Ctx) error {
		rows, err := DB.Query(context.Background(), "SELECT id, product_id, retailer_id, price, currency FROM prices ORDER BY timestamp DESC LIMIT 50")
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch prices"})
		}
		defer rows.Close()

		var prices []map[string]interface{}
		for rows.Next() {
			var id, pId, rId int
			var price float64
			var cur string
			rows.Scan(&id, &pId, &rId, &price, &cur)
			prices = append(prices, map[string]interface{}{
				"id": id, "product_id": pId, "retailer_id": rId, "price": price, "currency": cur,
			})
		}
		return c.JSON(prices)
	})

	log.Fatal(app.Listen(":3001"))
}
