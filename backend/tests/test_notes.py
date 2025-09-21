def test_notes_crud(client):
    client.post('/api/auth/signup', json={
        "user_name": "User",
        "user_email": "user@example.com",
        "password": "test1234"
    })
    res = client.post('/api/auth/signin', json={
        "user_email": "user@example.com",
        "password": "test1234"
    })
    token = res.get_json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    res = client.post('/api/notes', headers=headers, json={
        "note_title": "First Note",
        "note_content": "My content"
    })
    assert res.status_code == 201
    note_id = res.get_json()['note']['note_id']

    res = client.get('/api/notes', headers=headers)
    assert res.status_code == 200
    assert len(res.get_json()['notes']) == 1

    res = client.put(f'/api/notes/{note_id}', headers=headers, json={
        "note_title": "Updated"
    })
    assert res.status_code == 200

    res = client.delete(f'/api/notes/{note_id}', headers=headers)
    assert res.status_code == 200
