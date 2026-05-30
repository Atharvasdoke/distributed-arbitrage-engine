#!/bin/bash
set -e

# We are in the root of the repo during Render build
echo "Installing protoc..."
curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v25.3/protoc-25.3-linux-x86_64.zip
unzip -o protoc-25.3-linux-x86_64.zip -d ./protoc3
export PATH=$PATH:$(pwd)/protoc3/bin

echo "Installing Go Protobuf plugins..."
go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.32.0
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.3.0
export PATH=$PATH:$(go env GOPATH)/bin

echo "Generating Protobuf files..."
protoc --go_out=core --go_opt=paths=source_relative --go-grpc_out=core --go-grpc_opt=paths=source_relative proto/arbitrage.proto

echo "Building Go Backend..."
cd core
go mod tidy
go build -o arbitrage-api main.go db.go auth.go
echo "Build complete!"
