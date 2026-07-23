FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ANALYSIS_IMAGE_DIR=/app/uploads/analysis

ARG PYTORCH_VERSION=2.12.1
ARG TORCHVISION_VERSION=0.27.1
ARG PYTORCH_INDEX_URL=https://download.pytorch.org/whl/cpu

COPY requirements.txt ./
RUN pip install --no-cache-dir \
        torch==${PYTORCH_VERSION} \
        torchvision==${TORCHVISION_VERSION} \
        --index-url ${PYTORCH_INDEX_URL} \
    && pip install --no-cache-dir -r requirements.txt

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
        libxcb1 \
    && rm -rf /var/lib/apt/lists/*

COPY . .
RUN mkdir -p /app/uploads/analysis

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--timeout", "120", "app:app"]
