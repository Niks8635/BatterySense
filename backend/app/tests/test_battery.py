import unittest
from unittest.mock import patch, MagicMock
import psutil
from app.services.battery_service import BatteryService
from app.models.common import HealthStatus

class TestBattery(unittest.TestCase):
    def setUp(self):
        self.service = BatteryService()

    @patch('app.services.battery_service.pythoncom')
    @patch('app.services.battery_service.wmi.WMI')
    @patch('app.services.battery_service.psutil.sensors_battery')
    def test_health_calculation_excellent(self, mock_psutil, mock_wmi, mock_com):
        mock_psutil.return_value = MagicMock(percent=100, power_plugged=True, secsleft=psutil.POWER_TIME_UNLIMITED)
        
        mock_battery = MagicMock()
        mock_battery.DesignCapacity = 50000
        mock_battery.FullChargeCapacity = 48000
        mock_battery.DesignVoltage = 12000
        mock_battery.ChargeRate = 0
        
        mock_wmi_instance = MagicMock()
        mock_wmi_instance.Win32_Battery.return_value = [mock_battery]
        mock_wmi_instance.BatteryStaticData.return_value = []
        mock_wmi_instance.BatteryFullChargedCapacity.return_value = []
        mock_wmi_instance.BatteryCycleCount.return_value = []
        mock_wmi.return_value = mock_wmi_instance
        
        info = self.service.get_battery_info()
        
        self.assertEqual(info.health_percent.value, 96.0)
        self.assertEqual(info.wear_percent.value, 4.0)
        self.assertEqual(info.health_status.value, HealthStatus.EXCELLENT)
        self.assertEqual(info.estimated_runtime_seconds.available, False)
        
    @patch('app.services.battery_service.pythoncom')
    @patch('app.services.battery_service.wmi.WMI')
    @patch('app.services.battery_service.psutil.sensors_battery')
    def test_health_calculation_poor(self, mock_psutil, mock_wmi, mock_com):
        mock_psutil.return_value = MagicMock(percent=50, power_plugged=False, secsleft=3600)
        
        mock_battery = MagicMock()
        mock_battery.DesignCapacity = 50000
        mock_battery.FullChargeCapacity = 25000
        mock_battery.DesignVoltage = 12000
        mock_battery.ChargeRate = 1000
        
        mock_wmi_instance = MagicMock()
        mock_wmi_instance.Win32_Battery.return_value = [mock_battery]
        mock_wmi_instance.BatteryStaticData.return_value = []
        mock_wmi_instance.BatteryFullChargedCapacity.return_value = []
        mock_wmi_instance.BatteryCycleCount.return_value = []
        mock_wmi.return_value = mock_wmi_instance
        
        info = self.service.get_battery_info()
        
        self.assertEqual(info.health_percent.value, 50.0)
        self.assertEqual(info.wear_percent.value, 50.0)
        self.assertEqual(info.health_status.value, HealthStatus.POOR)
        self.assertEqual(info.estimated_runtime_seconds.value, 3600)

    @patch('app.services.battery_service.pythoncom')
    @patch('app.services.battery_service.wmi.WMI')
    @patch('app.services.battery_service.psutil.sensors_battery')
    def test_clamping(self, mock_psutil, mock_wmi, mock_com):
        mock_psutil.return_value = MagicMock(percent=100, power_plugged=True, secsleft=1000)
        
        mock_battery = MagicMock()
        mock_battery.DesignCapacity = 50000
        mock_battery.FullChargeCapacity = 55000 # Overcharge
        
        mock_wmi_instance = MagicMock()
        mock_wmi_instance.Win32_Battery.return_value = [mock_battery]
        mock_wmi_instance.BatteryStaticData.return_value = []
        mock_wmi_instance.BatteryFullChargedCapacity.return_value = []
        mock_wmi_instance.BatteryCycleCount.return_value = []
        mock_wmi.return_value = mock_wmi_instance
        
        info = self.service.get_battery_info()
        
        self.assertEqual(info.health_percent.value, 100.0)
        self.assertEqual(info.wear_percent.value, 0.0)
        self.assertEqual(info.health_status.value, HealthStatus.EXCELLENT)

    @patch('app.services.battery_service.pythoncom')
    @patch('app.services.battery_service.wmi.WMI')
    @patch('app.services.battery_service.psutil.sensors_battery')
    def test_unavailable_battery(self, mock_psutil, mock_wmi, mock_com):
        mock_psutil.return_value = None
        mock_wmi.side_effect = Exception("No WMI")
        
        info = self.service.get_battery_info()
        
        self.assertFalse(info.percentage.available)
        self.assertFalse(info.power_plugged.available)
        self.assertFalse(info.design_capacity.available)
        self.assertFalse(info.health_percent.available)
