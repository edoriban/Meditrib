import subprocess
import signal
import sys
import time

backend_process = None
frontend_process = None


def signal_handler(sig, frame):
    if backend_process:
        backend_process.terminate()
    if frontend_process:
        frontend_process.terminate()
    sys.exit(0)


signal.signal(signal.SIGINT, signal_handler)

if __name__ == "__main__":
    # Iniciar backend
    backend_process = subprocess.Popen(["uvicorn", "backend.main:app", "--reload"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # Esperar 2 segundos para asegurar que el backend esté listo
    time.sleep(2)

    # Iniciar frontend
    frontend_process = subprocess.Popen(["pnpm", "dev"], cwd="frontend", stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # Esperar a que ambos procesos terminen
    backend_process.wait()
    frontend_process.wait()
