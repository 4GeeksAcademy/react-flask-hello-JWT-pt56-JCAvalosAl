from flask import Flask, request, jsonify, Blueprint
from api.models import db, User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

api = Blueprint('api', __name__)

# Ruta de registro


@api.route('/signup', methods=['POST'])
def signup():
    body = request.get_json()

    # Validar que vengan email y password
    if not body.get('email') or not body.get('password'):
        return jsonify({"msg": "Email y contraseña son requeridos"}), 400

    # Verificar si el usuario ya existe
    user_exists = User.query.filter_by(email=body['email']).first()
    if user_exists:
        return jsonify({"msg": "El usuario ya existe"}), 400

    # Crear nuevo usuario
    new_user = User()
    new_user.email = body['email']
    new_user.set_password(body['password'])

    # Guardar en base de datos
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Usuario creado exitosamente"}), 201


# Ruta de login
@api.route('/login', methods=['POST'])
def login():
    body = request.get_json()

    # Validar que vengan email y password
    if not body.get('email') or not body.get('password'):
        return jsonify({"msg": "Email y contraseña son requeridos"}), 400

    # Buscar usuario en la base de datos
    user = User.query.filter_by(email=body['email']).first()

    # Verificar que el usuario existe y la contraseña es correcta
    if not user or not user.check_password(body['password']):
        return jsonify({"msg": "Email o contraseña incorrectos"}), 401

    # Crear token JWT
    access_token = create_access_token(identity=user.id)

    return jsonify({
        "token": access_token,
        "user": user.serialize()
    }), 200


# Ruta privada (protegida)
@api.route('/private', methods=['GET'])
@jwt_required()
def private():
    # Obtener el ID del usuario del token
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    return jsonify({
        "msg": "Acceso autorizado a ruta privada",
        "user": user.serialize()
    }), 200


# Ruta para validar token
@api.route('/validate-token', methods=['GET'])
@jwt_required()
def validate_token():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"valid": False}), 401

    return jsonify({
        "valid": True,
        "user": user.serialize()
    }), 200
