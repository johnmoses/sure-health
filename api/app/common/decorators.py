from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt

import logging

def jwt_required_with_roles(roles=None):
    if roles is None:
        roles = []

    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_roles = claims.get("roles") or claims.get("role")
            logging.debug(f"User roles from JWT claims: {user_roles}")

            if isinstance(user_roles, str):
                user_roles = [user_roles]
            elif user_roles is None:
                user_roles = []

            if any(role in user_roles for role in roles):
                return fn(*args, **kwargs)
            else:
                logging.warning(f"Access denied: required roles {roles}, user roles {user_roles}")
                return jsonify({"msg": "Missing or insufficient role"}), 403
        return decorator
    return wrapper
