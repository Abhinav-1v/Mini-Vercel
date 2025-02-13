FROM ubuntu:20.04

RUN apt-get update  
RUN apt-get install -y curl  
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -  
RUN apt-get upgrade -y
RUN apt-get install -y nodejs 

RUN apt-get install -y git 

WORKDIR /home/app

COPY script.js .
COPY package*.json .

RUN npm install


# Give execute permission to the script
RUN chmod +x script.js

# ENTRYPOINT ["bash", "-c", "./main.sh & exec bash"]
ENTRYPOINT [ "node","script.js" ]
