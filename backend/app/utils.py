from pydantic import ValidationError

def validate_json(schema, data):
    try:
        return schema(**data), None
    except ValidationError as e:
        return None, e.errors()
