FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build-env

# install NodeJS 14.x
# see https://github.com/nodesource/distributions/blob/master/README.md#deb
RUN apt-get update -yq 
RUN apt-get install curl gnupg -yq 
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs

RUN npm install -g npm

WORKDIR /app

COPY *.csproj ./
RUN dotnet restore


# Copy everything else and build
COPY . ./

RUN npm install

RUN dotnet publish -c Release -o out




FROM mcr.microsoft.com/dotnet/aspnet:5.0

RUN apt-get update && apt-get install -y libgdiplus && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --chown=1000:1000 --from=build-env /app/out .

VOLUME /data

EXPOSE 5000

# host on 5000
ENV ASPNETCORE_URLS=http://*:5000

HEALTHCHECK CMD curl -s -o /dev/null -w "%{http_code}" -L localhost:5000 || exit 1

CMD dotnet Journal.dll


