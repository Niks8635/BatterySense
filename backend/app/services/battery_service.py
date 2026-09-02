import psutil
from app.models.battery import BatteryResponse
from app.models.common import create_metric, HealthStatus
import wmi
import pythoncom


def _init_com():
    try:
        pythoncom.CoInitializeEx(pythoncom.COINIT_MULTITHREADED)
    except Exception:
        try:
            pythoncom.CoInitialize()
        except Exception:
            pass


class BatteryService:
    def get_battery_info(self) -> BatteryResponse:
        _init_com()
        return self._collect()

    def _collect(self) -> BatteryResponse:
        battery = psutil.sensors_battery()

        percentage = None
        power_plugged = None
        secsleft = None

        if battery:
            percentage = battery.percent
            power_plugged = battery.power_plugged
            secsleft = battery.secsleft

            if secsleft == psutil.POWER_TIME_UNLIMITED or secsleft == -1:
                secsleft = None

        design_capacity = None
        full_charge_capacity = None
        voltage = None
        charge_rate = None
        cycle_count = None

        # Try root/WMI namespace for accurate battery capacity data
        try:
            w_wmi = wmi.WMI(namespace="root/WMI")

            try:
                static_data = w_wmi.BatteryStaticData()
                if static_data:
                    dc = static_data[0].DesignedCapacity
                    if dc and dc > 0:
                        design_capacity = int(dc)
            except Exception:
                pass

            try:
                full_cap = w_wmi.BatteryFullChargedCapacity()
                if full_cap:
                    fc = full_cap[0].FullChargedCapacity
                    if fc and fc > 0:
                        full_charge_capacity = int(fc)
            except Exception:
                pass

            try:
                cycle_data = w_wmi.BatteryCycleCount()
                if cycle_data:
                    cc = cycle_data[0].CycleCount
                    if cc is not None and cc >= 0:
                        cycle_count = int(cc)
            except Exception:
                pass
        except Exception:
            pass

        # Fallback to Win32_Battery for voltage and charge rate
        try:
            w = wmi.WMI()
            wmi_battery = w.Win32_Battery()
            if wmi_battery:
                bat = wmi_battery[0]
                try:
                    if hasattr(bat, "DesignVoltage") and bat.DesignVoltage:
                        voltage = int(bat.DesignVoltage)
                except (ValueError, TypeError):
                    pass
                try:
                    if hasattr(bat, "ChargeRate") and bat.ChargeRate:
                        charge_rate = int(bat.ChargeRate)
                except (ValueError, TypeError):
                    pass
                # Fallback capacities from Win32_Battery if root/WMI failed
                if design_capacity is None:
                    try:
                        if hasattr(bat, "DesignCapacity") and bat.DesignCapacity:
                            design_capacity = int(bat.DesignCapacity)
                    except (ValueError, TypeError):
                        pass
                if full_charge_capacity is None:
                    try:
                        if hasattr(bat, "FullChargeCapacity") and bat.FullChargeCapacity:
                            full_charge_capacity = int(bat.FullChargeCapacity)
                    except (ValueError, TypeError):
                        pass
        except Exception:
            pass

        # Calculate health and wear
        health = None
        wear = None
        health_status = None

        if design_capacity is not None and full_charge_capacity is not None and design_capacity > 0:
            health_calc = (full_charge_capacity / design_capacity) * 100
            health = max(0, min(100, round(health_calc, 1)))
            wear = round(100 - health, 1)

            if health >= 90:
                health_status = HealthStatus.EXCELLENT
            elif health >= 80:
                health_status = HealthStatus.GOOD
            elif health >= 60:
                health_status = HealthStatus.FAIR
            else:
                health_status = HealthStatus.POOR

        return BatteryResponse(
            percentage=create_metric(percentage, "psutil"),
            is_charging=create_metric(power_plugged, "psutil"),
            power_plugged=create_metric(power_plugged, "psutil"),
            design_capacity=create_metric(design_capacity, "wmi"),
            full_charge_capacity=create_metric(full_charge_capacity, "wmi"),
            health_percent=create_metric(health, "calculated"),
            health_status=create_metric(health_status, "calculated"),
            wear_percent=create_metric(wear, "calculated"),
            cycle_count=create_metric(cycle_count, "wmi"),
            voltage=create_metric(voltage, "wmi"),
            temperature=create_metric(None, None),
            estimated_runtime_seconds=create_metric(secsleft, "psutil"),
            charge_rate=create_metric(charge_rate, "wmi"),
        )
