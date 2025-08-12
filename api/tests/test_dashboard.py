def test_clinician_dashboard(client):
    # You can pre-insert test data before hitting dashboard endpoints
    rv = client.get('/dashboard/clinician/1')
    assert rv.status_code == 200
    data = rv.get_json()
    assert "upcoming_appointments" in data
