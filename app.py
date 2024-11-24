from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from models import db, TaskFile
import os

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx'}

app = Flask(__name__, static_folder="/build", static_url_path="")
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['JWT_SECRET_KEY'] = 'exr+,[r[W^4K;8'  # Ganti dengan secret key yang aman
db.init_app(app)

jwt = JWTManager(app)

@app.route("/")
def serve():
    return send_from_directory(app.static_folder, "index.html")

# Dummy user credentials
USER = {'username': 'admin', 'password': 'admin'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if username == USER['username'] and password == USER['password']:
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token), 200
    return jsonify({'error': 'Invalid credentials'}), 401

# Middleware untuk mengamankan endpoint
@app.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    tasks = TaskFile.query.all()
    return jsonify([{
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'filename': task.filename,
        'file_url': f'/tasks/download/{task.id}'
    } for task in tasks])

@app.route('/tasks', methods=['POST'])
@jwt_required()
def upload_task():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    title = request.form.get('title')
    description = request.form.get('description')

    if file and allowed_file(file.filename):
        filename = file.filename
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        new_task = TaskFile(
            title=title,
            description=description,
            filename=filename,
            file_path=file_path
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify({'message': 'File uploaded successfully!'}), 201
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/tasks/download/<int:id>', methods=['GET'])
@jwt_required()
def download_task(id):
    task = TaskFile.query.get(id)
    if not task:
        return jsonify({'error': 'File not found'}), 404
    return send_from_directory(app.config['UPLOAD_FOLDER'], task.filename, as_attachment=True)

@app.route('/tasks/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_task(id):
    task = TaskFile.query.get(id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    try:
        os.remove(task.file_path)
    except FileNotFoundError:
        pass

    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted successfully!'})

if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    with app.app_context():
        db.create_all()
    app.run(debug=True)
