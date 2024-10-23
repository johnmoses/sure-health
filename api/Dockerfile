FROM python:3.11-slim

# Copy local code
ENV APP_HOME /app
RUN mkdir $APP_HOME

WORKDIR $APP_HOME

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set Flask environment variables
ENV FLASK_APP=main.py
ENV FLASK_ENV=development
ENV PORT 5001
ENV RUN CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1

# Install pip.
RUN pip install --upgrade pip

# Install other dependencies
RUN apt update && \
    apt install --no-install-recommends -y build-essential gcc && \
    apt clean && rm -rf /var/lib/apt/lists/*

RUN pip install llama-cpp-python
RUN pip install spacy
RUN python -m spacy download en_core_web_sm

# Install from requirements.txt files
COPY ./requirements.txt .
RUN pip install -r requirements.txt

# Download NLP packages
RUN python -m nltk.downloader punkt
RUN python -m nltk.downloader wordnet

# copy entrypoint.prod.sh
COPY ./entrypoint.sh .
RUN sed -i 's/\r$//g'  $APP_HOME/entrypoint.sh
RUN chmod +x  $APP_HOME/entrypoint.sh

# Copy project
COPY . .

# run entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]