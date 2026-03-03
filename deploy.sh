#!/bin/bash
set -e

# ============================================================
# Arken Platform — Docker Deploy Script
# Usage:
#   ./deploy.sh          — full rebuild + restart
#   ./deploy.sh up       — start without rebuilding
#   ./deploy.sh down     — stop all containers
#   ./deploy.sh logs     — tail logs for all services
#   ./deploy.sh logs <svc> — tail logs for one service
#                           (rabbitmq | auth-service | bot-service |
#                            market-service | mini-app | admin-panel)
#   ./deploy.sh restart <svc> — restart a single service
#   ./deploy.sh status   — show container status
# ============================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()    { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

COMPOSE_FILE="docker-compose.yml"
[ ! -f "$COMPOSE_FILE" ] && error "docker-compose.yml not found. Run this script from the project root."

# ── helpers ─────────────────────────────────────────────────

show_status() {
    echo ""
    info "Container status:"
    docker compose ps
    echo ""
    echo "  Mini App      → http://localhost:3000"
    echo "  Admin Panel   → http://localhost:3001"
    echo "  Auth Service  → http://localhost:4000"
    echo "  Market Service→ http://localhost:3003"
    echo "  RabbitMQ UI   → http://localhost:15672  (admin / admin)"
}

# ── commands ─────────────────────────────────────────────────

case "${1:-deploy}" in

  deploy)
    info "=== Full deploy: build + restart ==="

    info "Stopping existing containers..."
    docker compose down --remove-orphans

    info "Building all images..."
    docker compose build --no-cache

    info "Starting all services..."
    docker compose up -d

    info "Waiting for services to settle (10s)..."
    sleep 10

    show_status
    info "=== Deploy complete ==="
    ;;

  up)
    info "Starting containers (no rebuild)..."
    docker compose up -d
    sleep 5
    show_status
    ;;

  down)
    info "Stopping all containers..."
    docker compose down --remove-orphans
    info "All containers stopped."
    ;;

  rebuild)
    # Rebuild only changed services: ./deploy.sh rebuild mini-app bot-service
    shift
    SERVICES="$@"
    [ -z "$SERVICES" ] && error "Specify at least one service: ./deploy.sh rebuild mini-app"
    info "Rebuilding: $SERVICES"
    docker compose build --no-cache $SERVICES
    docker compose up -d $SERVICES
    info "Done. Restarted: $SERVICES"
    ;;

  restart)
    shift
    SERVICE="$1"
    [ -z "$SERVICE" ] && error "Specify a service: ./deploy.sh restart bot-service"
    info "Restarting $SERVICE..."
    docker compose restart "$SERVICE"
    info "$SERVICE restarted."
    ;;

  logs)
    shift
    if [ -z "$1" ]; then
      docker compose logs -f --tail=100
    else
      docker compose logs -f --tail=100 "$1"
    fi
    ;;

  status)
    show_status
    ;;

  *)
    echo "Unknown command: $1"
    echo "Usage: ./deploy.sh [deploy|up|down|rebuild <svc>|restart <svc>|logs [svc]|status]"
    exit 1
    ;;
esac
