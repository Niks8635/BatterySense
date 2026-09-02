import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_battery(self):
        response = self.client.get("/api/battery")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("percentage", data)
        self.assertIn("health_percent", data)

    def test_performance(self):
        response = self.client.get("/api/performance")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("cpu", data)
        self.assertIn("memory", data)
        self.assertIn("gpu", data)

    def test_system(self):
        response = self.client.get("/api/system")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("os", data)
        self.assertIn("processor", data)

    def test_storage(self):
        response = self.client.get("/api/storage")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("drives", data)
