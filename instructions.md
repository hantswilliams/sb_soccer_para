# Docker Instructions for Soccer Stats Analyzer

## Prerequisites
- Docker installed on your system
- Port 3000 available on your host machine

## Building the Docker Image
To build the Docker image, run the following command in the project directory:
```bash
docker build -t soccer-stats-app .
```

## Running the Container
To run the container, execute:
```bash
docker run -d -p 3017:3017 --name soccer-stats soccer-stats-app
```

This will:
- Run the container in detached mode (-d)
- Map port 3017 from the container to port 3017 on your host (-p 3017:3017)
- Name the container "soccer-stats" (--name soccer-stats)

## Accessing the Application
Once the container is running, you can access the application at:
```
http://localhost:3017
```

## Managing the Container
Common commands for managing the container:

Stop the container:
```bash
docker stop soccer-stats
```

Start an existing container:
```bash
docker start soccer-stats
```

Remove the container:
```bash
docker rm soccer-stats
```

View container logs:
```bash
docker logs soccer-stats
```

## Container Details
- Base image: node:18-alpine (minimal footprint)
- Exposed port: 3017
- Production-optimized build
- Serves static files using 'serve' package

## Troubleshooting
If you encounter port conflicts, you can map to a different host port:
```bash
docker run -d -p 3018:3017 --name soccer-stats soccer-stats-app
```

To check if the container is running:
```bash
docker ps
```

To check container resource usage:
```bash
docker stats soccer-stats
```