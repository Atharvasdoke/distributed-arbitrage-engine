$ErrorActionPreference = "Stop"

Write-Host "Setting up Arbitrage Engine..."

# Force refresh PATH for this script session
$env:PATH = "C:\Program Files\Go\bin;C:\Program Files\nodejs;" + $env:PATH

# 1. Download and install protoc
$ProtocDir = "$PWD\protoc"
if (-Not (Test-Path "$ProtocDir\bin\protoc.exe")) {
    Write-Host "Downloading protoc..."
    Invoke-WebRequest -Uri "https://github.com/protocolbuffers/protobuf/releases/download/v25.3/protoc-25.3-win64.zip" -OutFile "protoc.zip"
    Expand-Archive -Path "protoc.zip" -DestinationPath $ProtocDir -Force
    Remove-Item "protoc.zip"
}

# Add protoc to path for this session
$env:PATH = "$ProtocDir\bin;" + $env:PATH

# 2. Install Go plugins
Write-Host "Installing Go Protobuf plugins..."
go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.32.0
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.3.0
$GoBin = "$(go env GOPATH)\bin"
$env:PATH = "$GoBin;" + $env:PATH

# 3. Generate protobufs
Write-Host "Generating Protobuf files..."
protoc --go_out=core --go_opt=paths=source_relative --go-grpc_out=core --go-grpc_opt=paths=source_relative proto\arbitrage.proto

# 4. Build and run Backend
Write-Host "Building Go Backend..."
Set-Location "core"
go mod tidy
go build -o arbitrage-api.exe .

Write-Host "Starting Go Backend on port 3001..."
.\arbitrage-api.exe
