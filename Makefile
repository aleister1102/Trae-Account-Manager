# Trae Account Manager Build Automation

# Variables
NPM = npm
TAURI = $(NPM) run tauri

# Default target
.PHONY: all
all: install build

# Install dependencies
.PHONY: install
install:
	$(NPM) install

# Run in development mode
.PHONY: dev
dev:
	$(TAURI) dev

# Build the frontend and desktop app for the current platform
.PHONY: build
build:
	$(NPM) run build
	$(TAURI) build

# Build specifically for macOS (Apple Silicon)
.PHONY: build-mac
build-mac:
	$(NPM) run build:mac

# Build specifically for Linux (x86_64)
.PHONY: build-linux
build-linux:
	$(NPM) run build:linux

# Clean build artifacts
.PHONY: clean
clean:
	rm -rf dist
	rm -rf src-tauri/target
