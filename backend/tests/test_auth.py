def test_signup_and_login(client):
    res = client.post('/api/auth/signup', json={
        "user_name": "Test",
        "user_email": "test@example.com",
        "password": "test1234"
    })
    assert res.status_code == 201
    assert 'access_token' in res.get_json()

    res = client.post('/api/auth/signin', json={
        "user_email": "test@example.com",
        "password": "test1234"
    })
    data = res.get_json()
    assert res.status_code == 200
    assert 'access_token' in data
    assert 'refresh_token' in data
