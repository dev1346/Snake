from flask import Flask, request, jsonify, send_file, Response,send_from_directory
from flask_cors import CORS
import json, os
from pathlib import Path


# Pfad zum SSL-Zertifikat und zum privaten Schlüssel
current_directory = os.getcwd()
http_port = '9000'

app = Flask(__name__)
CORS(app,origins='*')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

@app.route('/')
def home():
    return send_from_directory('static','index.html')

if __name__ == '__main__':
    app.run('0.0.0.0',f'{http_port}')#,ssl_context=(ssl_cert, ssl_key))
