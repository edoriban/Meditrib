import subprocess
import signal
import sys
import time
import threading

backend_process = None
frontend_process = None


# Función para transmitir la salida al stdout
def stream_output(process, prefix):
    for line in iter(process.stdout.readline, ""):
        print(f"{prefix}: {line}", end="")


# Función para transmitir errores al stderr
def stream_error(process, prefix):
    for line in iter(process.stderr.readline, ""):
        print(f"{prefix} ERROR: {line}", end="", file=sys.stderr)


def signal_handler(sig, frame):
    print("\nDeteniendo servicios...")
    if backend_process:
        backend_process.terminate()
    if frontend_process:
        frontend_process.terminate()
    sys.exit(0)


signal.signal(signal.SIGINT, signal_handler)

if __name__ == "__main__":
    print("Iniciando servicios de Meditrib...")

    # Iniciar backend
    print("Iniciando backend con uvicorn...")
    backend_process = subprocess.Popen(["uvicorn", "backend.main:app", "--reload"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, bufsize=1, universal_newlines=True)

    # Iniciar hilos para mostrar la salida del backend
    backend_stdout_thread = threading.Thread(target=stream_output, args=(backend_process, "Backend"))
    backend_stderr_thread = threading.Thread(target=stream_error, args=(backend_process, "Backend"))
    backend_stdout_thread.daemon = True
    backend_stderr_thread.daemon = True
    backend_stdout_thread.start()
    backend_stderr_thread.start()

    # Esperar 2 segundos para asegurar que el backend esté listo
    time.sleep(2)

    # Iniciar frontend
    print("Iniciando frontend con pnpm dev...")
    frontend_process = subprocess.Popen(["pnpm", "dev"], cwd="frontend", stdout=subprocess.PIPE, stderr=subprocess.PIPE, bufsize=1, universal_newlines=True)

    # Iniciar hilos para mostrar la salida del frontend
    frontend_stdout_thread = threading.Thread(target=stream_output, args=(frontend_process, "Frontend"))
    frontend_stderr_thread = threading.Thread(target=stream_error, args=(frontend_process, "Frontend"))
    frontend_stdout_thread.daemon = True
    frontend_stderr_thread.daemon = True
    frontend_stdout_thread.start()
    frontend_stderr_thread.start()

    print("Servicios iniciados. Presiona Ctrl+C para detener.")

    try:
        # Esperar a que ambos procesos terminen (o se interrumpan con Ctrl+C)
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)
