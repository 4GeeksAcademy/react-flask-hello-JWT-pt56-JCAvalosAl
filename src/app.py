import os
from flask import Flask, request, jsonify, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_cors import CORS
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_jwt_extended import JWTManager

# Crear aplicación Flask
app = Flask(__name__)
app.url_map.strict_slashes = False

# Configuración de base de datos
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configuración JWT
app.config['JWT_SECRET_KEY'] = os.getenv(
    'JWT_SECRET_KEY', 'super-secret-key-change-in-production')

# Inicializar extensiones
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)
jwt = JWTManager(app)

# Permitir CORS
CORS(app)

# Agregar el admin
setup_admin(app)

# Agregar los comandos
setup_commands(app)

# Registrar el blueprint de API
app.register_blueprint(api, url_prefix='/api')

# Manejo de errores


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# Generar sitemap con todos los endpoints


@app.route('/')
def sitemap():
    if os.getenv("FLASK_DEBUG") == "1":
        return generate_sitemap(app)
    return send_from_directory('public', 'index.html')

# Cualquier otro endpoint intentará servir el archivo de React


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join('public', path)):
        path = 'index.html'
    response = send_from_directory('public', path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response


# Esto solo se ejecuta si se corre `$ python src/app.py`
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
