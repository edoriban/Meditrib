import subprocess
import signal
import sys
import time
import threading
import os
import shutil

backend_process = None
frontend_process = None


# Función para transmitir la salida al stdout
def stream_output(process, prefix):
    for line in iter(process.stdout.readline, ""):
        print(f"{prefix}: {line}", end="")


# Función para transmitir stderr (no necesariamente son errores)
def stream_error(process, prefix):
    for line in iter(process.stderr.readline, ""):
        # Uvicorn y logging envían mensajes INFO/WARNING a stderr
        # Solo marcar como ERROR si realmente contiene "error" o "exception"
        line_lower = line.lower()
        if "error" in line_lower or "exception" in line_lower or "traceback" in line_lower:
            print(f"{prefix} ❌: {line}", end="", file=sys.stderr)
        elif "warning" in line_lower:
            print(f"{prefix} ⚠️: {line}", end="")
        else:
            print(f"{prefix}: {line}", end="")


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
    backend_process = subprocess.Popen([sys.executable, "-m", "uvicorn", "backend.main:app", "--reload"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, bufsize=1, universal_newlines=True)

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
    # Get the user's home directory
    pnpm_path = shutil.which("pnpm")

    # Si no se encuentra, intentar con ubicaciones comunes
    if not pnpm_path:
        home_dir = os.path.expanduser("~")
        if sys.platform == "win32":
            possible_path = os.path.join(home_dir, ".pnpm-global", "bin", "pnpm.cmd")
        else:
            possible_path = os.path.join(home_dir, ".pnpm-global", "bin", "pnpm")
        
        if os.path.exists(possible_path):
            pnpm_path = possible_path
        else:
            print("ERROR: No se pudo encontrar pnpm. Asegúrate de que esté instalado y en el PATH.")
            backend_process.terminate()
            sys.exit(1)

    print(f"Usando pnpm en: {pnpm_path}")
    frontend_process = subprocess.Popen([pnpm_path, "dev"], cwd="frontend", stdout=subprocess.PIPE, stderr=subprocess.PIPE, bufsize=1, universal_newlines=True)
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
