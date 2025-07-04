#!/bin/bash

# Test script for the Node.js Authentication App
# This script demonstrates how to run tests using Docker Compose

echo "🧪 Node.js Authentication App - Test Runner"
echo "==========================================="
echo ""

# Function to check if docker compose is available
check_docker_compose() {
    if ! docker compose version &> /dev/null; then
        echo "❌ docker compose is not available"
        echo "Please make sure Docker Desktop is running or Docker Compose plugin is installed"
        exit 1
    fi
    echo "✅ docker compose is available"
}

# Function to run tests
run_tests() {
    echo ""
    echo "🚀 Running tests with Docker Compose..."
    echo "--------------------------------------"
    
    # Clean up any existing test containers
    docker compose -f docker-compose.test.yml down -v > /dev/null 2>&1
    
    # Run tests
    if docker compose -f docker-compose.test.yml up --build app-test --abort-on-container-exit; then
        echo ""
        echo "✅ All tests passed!"
    else
        echo ""
        echo "❌ Some tests failed!"
        exit 1
    fi
}

# Function to run tests with coverage
run_tests_with_coverage() {
    echo ""
    echo "📊 Running tests with coverage report..."
    echo "---------------------------------------"
    
    # Clean up any existing test containers
    docker compose -f docker-compose.test.yml down -v > /dev/null 2>&1
    
    # Run tests with coverage
    if docker compose -f docker-compose.test.yml up --build app-test-coverage --abort-on-container-exit; then
        echo ""
        echo "✅ Tests completed with coverage report!"
    else
        echo ""
        echo "❌ Tests failed!"
        exit 1
    fi
}

# Function to run tests in watch mode
run_tests_watch() {
    echo ""
    echo "👀 Running tests in watch mode..."
    echo "--------------------------------"
    echo "Press Ctrl+C to stop watching"
    echo ""
    
    # Clean up any existing test containers
    docker compose -f docker-compose.test.yml down -v > /dev/null 2>&1
    
    # Run tests in watch mode (this will keep running)
    docker compose -f docker-compose.test.yml up --build app-test-watch
}

# Function to clean up
cleanup() {
    echo ""
    echo "🧹 Cleaning up test containers and volumes..."
    echo "--------------------------------------------"
    docker compose -f docker-compose.test.yml down -v
    echo "✅ Cleanup completed!"
}

# Main script
main() {
    check_docker_compose
    
    case "${1:-run}" in
        "run"|"test")
            run_tests
            ;;
        "coverage")
            run_tests_with_coverage
            ;;
        "watch")
            run_tests_watch
            ;;
        "cleanup")
            cleanup
            ;;
        "help")
            echo "Usage: $0 [run|coverage|watch|cleanup|help]"
            echo ""
            echo "Commands:"
            echo "  run       - Run all tests once (default)"
            echo "  test      - Same as 'run' (for backward compatibility)"
            echo "  coverage  - Run tests with coverage report"
            echo "  watch     - Run tests in watch mode for development"
            echo "  cleanup   - Clean up test containers and volumes"
            echo "  help      - Show this help message"
            ;;
        *)
            echo "❌ Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Handle Ctrl+C gracefully
trap cleanup EXIT

# Run main function
main "$@"
