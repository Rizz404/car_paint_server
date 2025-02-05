docker login
docker tag setup-express _dockerHubUsername_/setup-express:latest
docker push _dockerHubUsername_/setup-express:latest
docker build -t setup-express .
