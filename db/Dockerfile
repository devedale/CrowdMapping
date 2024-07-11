FROM postgres
RUN apt-get update && \
    apt-get install -y postgis postgresql-13-postgis-3
RUN usermod -u 1000 postgres
CMD ["postgres"]
