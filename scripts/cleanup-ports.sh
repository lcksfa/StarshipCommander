#!/bin/bash

# Kill processes on specified ports
# Usage:
#   ./scripts/cleanup-ports.sh                    # Cleans default ports 3000-3005
#   ./scripts/cleanup-ports.sh 3000 8080 8081   # Cleans ports 3000, 8080, 8081
#   ./scripts/cleanup-ports.sh --all            # Cleans common dev ports (3000-3010, 8000-8099, 9000-9009)

# Function to display usage
show_usage() {
    echo "🧹 Port Cleanup Script"
    echo ""
    echo "Usage:"
    echo "  $0 <port1> <port2> ...       # Clean specified ports"
    echo "  $0 --all                    # Clean common development ports"
    echo "  $0 --help                   # Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 3000 8080 8081           # Clean ports 3000, 8080, 8081"
    echo "  $0 --all                    # Clean ports 3000-3010, 8000-8099, 9000-9009"
    echo "  $0 3001                     # Clean backend port 3001"
    echo "  $0 3000                     # Clean frontend port 3000"
    echo ""
    echo "⚠️  WARNING: This will forcefully terminate processes on specified ports."
    echo "   Make sure to save your work before running this script."
}

# Function to kill processes on a port
kill_port() {
    local port=$1
    echo "Checking port $port..."

    # Find process ID using the port
    pid=$(lsof -ti :$port 2>/dev/null)

    if [ -n "$pid" ]; then
        echo "🔪 Killing process $pid on port $port"
        kill -9 $pid
        echo "✅ Port $port freed"
        return 0
    else
        echo "🔍 No process found on port $port"
        return 1
    fi
}

# Function to verify port is free
verify_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        echo "⚠️  Port $port is still in use"
        return 1
    else
        echo "✅ Port $port is free"
        return 0
    fi
}

# Main execution
main() {
    local ports=()

    # Parse arguments
    if [ $# -eq 0 ]; then
        # No arguments provided - show usage and exit
        echo "⚠️  Error: No ports specified."
        echo ""
        show_usage
        exit 1
    elif [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        show_usage
        exit 0
    elif [ "$1" = "--all" ]; then
        # Common development ports
        echo "🧹 Cleaning up common development ports..."
        ports=(
            # Node.js/React/Vue apps
            3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010
            # Backend servers
            8000 8001 8002 8003 8004 8005 8006 8007 8008 8009 8010 8011 8012 8013 8014 8015
            8080 8081 8082 8083 8084 8085 8086 8087 8088 8089 8090 8091 8092 8093 8094 8095 8096 8097 8098 8099
            # Database/Tools
            9000 9001 9002 9003 9004 9005 9006 9007 9008 9009
        )
    else
        # Use provided ports
        echo "🧹 Cleaning up specified ports: $*"
        ports=("$@")
    fi

    # Kill processes on specified ports
    local killed_count=0
    local total_count=${#ports[@]}

    for port in "${ports[@]}"; do
        if kill_port "$port"; then
            ((killed_count++))
        fi
    done

    echo ""
    echo "🎉 Port cleanup completed! Killed $killed_count/$total_count processes."
    echo ""

    # Verify ports are free
    echo "🔍 Verifying ports are free..."
    local free_count=0

    for port in "${ports[@]}"; do
        if verify_port "$port"; then
            ((free_count++))
        fi
    done

    echo ""
    echo "📊 Summary: $free_count/$total_count ports are free"
}

# Run main function with all arguments
main "$@"
