@echo off
echo Generating Protobuf for Go...
protoc --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative proto/arbitrage.proto
echo Done!
