FROM debian:trixie-slim AS build

RUN uname -m > /arch

SHELL ["/bin/bash", "-c"]

WORKDIR /server


RUN apt-get update && apt-get install -y python3 python3-pip python3.13-venv
RUN apt-get clean
RUN apt-get autoclean
RUN apt-get autoremove

RUN python3 -m venv venv
ENV VIRTUAL_ENV="./venv"
ENV PATH="./venv/bin:$PATH"


COPY ./cloud/requirements.txt ./requirements.txt

RUN pip3 install -r requirements.txt
RUN pip3 cache purge
RUN rm ./requirements.txt

COPY ./cloud/run-server.sh ./run-server.sh
COPY ./cloud/gunicorn.conf.json ./gunicorn.conf.json

COPY ./main.py ./main.py
COPY ./app_essentials ./app_essentials
COPY ./payments.py ./payments.py
COPY ./utilities.py ./utilities.py
COPY ./static ./static
COPY ./templates ./templates

RUN mkdir .secure

RUN chmod +x ./run-server.sh

EXPOSE 8080

CMD ["./run-server.sh"]