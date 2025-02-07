advertise_addr='103.118.40.185'
docker swarm leave --force 2>/dev/null
docker swarm init --advertise-addr $advertise_addr

echo "Swarm initialized"
docker network rm -f dokploy-network 2>/dev/null
docker network create --driver overlay --attachable dokploy-network
echo "Network created"
mkdir -p /etc/dokploy
chmod 777 /etc/dokploy
mkdir /etc/.docker
chmod 777 /etc/.docker
docker pull dokploy/dokploy:latest
docker service create \
  --name dokploy \
  --replicas 1 \
  --network dokploy-network \
  --publish published=3000,target=3000,mode=host \
  --update-parallelism 1 \
  --update-order stop-first \
  --constraint 'node.role == manager' \
  dokploy/dokploy:latest

GREEN="\033[0;32m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color
