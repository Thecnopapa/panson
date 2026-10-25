#!/bin/bash
cd /server
echo "Starting gunicorn server..."
gunicorn --config ./gunicorn.conf.py "$@"