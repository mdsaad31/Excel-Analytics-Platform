#!/bin/bash

echo "Installing dependencies..."
pnpm install

echo "Building the application..."
pnpm run build

echo "Build completed successfully!"
