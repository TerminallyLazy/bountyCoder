import threading
import time
import pynvml
from app.metrics import GPU_UTILIZATION

class GPUMonitor:
    def __init__(self, interval=5):
        """
        Initialize the GPU monitor.
        
        Args:
            interval (int): Interval in seconds between GPU utilization checks
        """
        self.interval = interval
        self._stop_event = threading.Event()
        self._thread = None
    
    def start(self):
        """Start the GPU monitoring thread."""
        try:
            pynvml.nvmlInit()
            self._thread = threading.Thread(target=self._monitor_gpu, daemon=True)
            self._thread.start()
            print("GPU monitoring started")
        except Exception as e:
            print(f"Could not initialize GPU monitoring: {e}")
    
    def stop(self):
        """Stop the GPU monitoring thread."""
        if self._thread and self._thread.is_alive():
            self._stop_event.set()
            self._thread.join(timeout=1)
            try:
                pynvml.nvmlShutdown()
            except:
                pass
            print("GPU monitoring stopped")
    
    def _monitor_gpu(self):
        """Continuously monitor GPU utilization and update metrics."""
        try:
            device_count = pynvml.nvmlDeviceGetCount()
            while not self._stop_event.is_set():
                for i in range(device_count):
                    handle = pynvml.nvmlDeviceGetHandleByIndex(i)
                    util = pynvml.nvmlDeviceGetUtilizationRates(handle)
                    GPU_UTILIZATION.labels(index=str(i)).set(util.gpu)
                time.sleep(self.interval)
        except Exception as e:
            print(f"Error in GPU monitoring thread: {e}")