from flask import Flask, jsonify, request
import redis
import hashlib
import json

app = Flask(__name__)
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)
def append_details(existing_details, new_details):
    for key, value in new_details.items():
        if key in existing_details:
            if isinstance(existing_details[key], list):
                existing_details[key].append(value)
            else:
                existing_details[key] = [existing_details[key], value]
        else:
            existing_details[key] = [value]
    return existing_details
@app.route('/locatii', methods=['GET'])
def get_locatii_data():
    try:
        locatii_data = redis_client.hgetall("Locatii")
        locatii_info = {}
        for location, details_str in locatii_data.items():
            details = json.loads(details_str.decode('utf-8'))
            items_data = redis_client.hgetall(location.decode('utf-8'))
            key_values = []
            for item, item_details_str in items_data.items():
                item_name = item.decode('utf-8')
                if item_details_str:
                    item_details = json.loads(item_details_str.decode('utf-8'))
                    key_values.append({
                        'item': item_name,
                        'count': item_details.get('count', 0),
                        'category': item_details.get('category', ''),
                        'culoare': item_details.get('color', ''),
                        'size': item_details.get('size', ''),
                    })
            coords = details.get('coords', '')
            coords_list = list(map(float, coords.split(', '))) if coords else []
            locatii_info[location.decode('utf-8')] = {
                'coords': coords_list,
                'items': key_values,
            }
        return jsonify(locatii_info)
    except Exception as e:
        print(f"Error fetching Locatii data: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500
@app.route('/api/add/<name>/<cnp>', methods=['POST'])
def add_cnp(name, cnp):
    name = name.upper()
    hashed_cnp = hashlib.sha256(cnp.encode()).hexdigest()
    existing_name = redis_client.hget("Users", hashed_cnp)
    if existing_name:
        if existing_name.decode().upper() != name:
            response_data = {
                'status': 'error',
                'message': 'CNP already exists with a different name'
            }
            return jsonify(response_data), 400
    else:
        redis_client.hset("Users", hashed_cnp, name)
    response_data = {
        'status': 'success',
        'message': 'Data added successfully',
        'name': name,
        'cnp': cnp
    }
    return jsonify(response_data), 200
@app.route('/api/<location>/<item_name>', methods=['POST'])
def add_item(location, item_name):
    location = location.capitalize()
    item_name = item_name.capitalize()
    details_str = request.json.get('details', '')
    if not details_str:
        return jsonify({'status': 400, 'message': 'Details are required'})
    try:
        details = json.loads(details_str)
    except json.JSONDecodeError:
        return jsonify({'status': 400, 'message': 'Invalid JSON format in details'})
    capitalize_fields = ['category', 'color', 'locatie', 'size']
    for field in capitalize_fields:
        if field in details and isinstance(details[field], str):
            details[field] = details[field].capitalize()
    existing_details_str = redis_client.hget(location, item_name)
    if existing_details_str:
        try:
            existing_details = json.loads(existing_details_str.decode('utf-8'))
        except json.JSONDecodeError:
            return jsonify({'status': 500, 'message': 'Error decoding existing details JSON'})
        if (
            existing_details.get('item_name') == details.get('item_name') and
            existing_details.get('category') == details.get('category') and
            existing_details.get('color') == details.get('color') and
            existing_details.get('size') == details.get('size')
        ):
            existing_details['count'] = int(existing_details.get('count', 0)) + int(details.get('count', 1))
        else:
            return jsonify({'status': 200, 'message': f'{item_name} is a new item. Add it as needed.'})
        redis_client.hset(location, item_name, json.dumps(existing_details))
        return jsonify({'status': 200, 'message': f'{item_name} added/appended to the database'})
    else:
        redis_client.hset(location, item_name, json.dumps(details))
@app.route('/api/locatii/<location>', methods=['POST', 'GET'])
def new_location(location):
    if request.method == 'POST':
        try:
            details_str = request.json.get('details', '')
            if not details_str:
                return jsonify({'status': 400, 'message': 'Details are required'})
            details = json.loads(details_str)
            coords_str = details.get('coords', '')
            try:
                coords_list = list(map(float, coords_str.split(','))) if coords_str else []
            except ValueError:
                return jsonify({'status': 400, 'message': 'Invalid coordinates format'})
            existing_coords_str = redis_client.hget("Locatii", location)
            if existing_coords_str:
                return jsonify({'status': 400, 'message': f'{location} already exists'})
            new_details = {'coords': coords_list, **details}
            redis_client.hset("Locatii", location, json.dumps(new_details))
            return jsonify({'status': 200, 'message': f'{location} has been added to the database with coordinates'})
        except Exception as e:
            print(f"Error processing new location: {e}")
            return jsonify({'status': 500, 'message': 'Internal Server Error'})

    elif request.method == 'GET':
        locatii_data = redis_client.hgetall("Locatii")
        locatii_info = {}
        for loc, coords_str in locatii_data.items():
            coords = json.loads(coords_str.decode('utf-8')).get('coords', '')
            coords_list = list(map(float, coords.split(','))) if coords else []
            locatii_info[loc.decode('utf-8')] = {'coords': coords_list}
        return jsonify(locatii_info)
    else:
        return jsonify({'status': 405, 'message': 'Method Not Allowed'}), 405
if __name__ == '__main__':
    app.run(debug=True)

