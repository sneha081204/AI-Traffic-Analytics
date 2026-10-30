def test_health_endpoint(client):
    res = client.get('/api/system/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"

def test_v1_analytics_summary(client):
    res = client.get('/api/v1/analytics/summary')
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True

def test_v1_violations_list(client):
    res = client.get('/api/v1/traffic/violations')
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
