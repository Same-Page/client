from collections import defaultdict
from secrets import token_hex


tokens = {}
# one user can have multiple tokens, so value is list
user_id_to_tokens = defaultdict(list)


def create_token(user):
    token = token_hex(16)
    tokens[token] = user.to_dict()
    add_token_to_user(user.id, token)
    return token


def refresh_user_data(token, user):
    tokens[token] = user.to_dict()


def add_token_to_user(user_id, token):
    user_id = str(user_id)
    user_id_to_tokens[user_id].append(token)


def remove_token_from_user(user_id, token):
    user_id = str(user_id)
    user_id_to_tokens[user_id] = [
        t for t in user_id_to_tokens.get(user_id, []) if t != token]


def revoke_all_tokens_of_user(user_id):
    user_id = str(user_id)
    tokens = user_id_to_tokens.get(user_id, [])
    for token in tokens:
        revoke_token(token)


def revoke_token(token):
    """
    Only revoke one given token, not all tokens of user
    """
    user = tokens.get(token)
    if not user:
        return False
    del tokens[token]
    remove_token_from_user(user['id'], token)
    return True
